import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { handleCors } from "../_shared/cors.ts"
import { supabaseAdmin, getUser } from "../_shared/supabase.ts"
import { json, error, unauthorized, forbidden, notFound } from "../_shared/response.ts"

serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  const url = new URL(req.url)
  const path = url.pathname.replace('/picks', '')
  const method = req.method

  const user = await getUser(req)
  if (!user) {
    return unauthorized('Authentication required')
  }

  try {
    // POST /picks/lock - Lock all picks for current episode (admin/cron)
    if (method === 'POST' && path === '/lock') {
      const { data: userProfile } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userProfile?.role !== 'admin') {
        return forbidden('Admin access required')
      }

      const now = new Date()

      const { data: episodes } = await supabaseAdmin
        .from('episodes')
        .select('id')
        .lte('picks_lock_at', now.toISOString())
        .eq('is_scored', false)

      if (!episodes || episodes.length === 0) {
        return json({ locked: 0, episodes: [] })
      }

      const episodeIds = episodes.map((e: any) => e.id)

      const { data, error: updateError } = await supabaseAdmin
        .from('weekly_picks')
        .update({
          status: 'locked',
          locked_at: now.toISOString(),
        })
        .eq('status', 'pending')
        .in('episode_id', episodeIds)
        .select()

      if (updateError) {
        return error(updateError.message)
      }

      return json({
        locked: data?.length || 0,
        episodes: episodeIds,
      })
    }

    // POST /picks/auto-fill - Auto-pick for users who didn't submit (admin/cron)
    if (method === 'POST' && path === '/auto-fill') {
      const { data: userProfile } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userProfile?.role !== 'admin') {
        return forbidden('Admin access required')
      }

      const now = new Date()

      const { data: episodes } = await supabaseAdmin
        .from('episodes')
        .select('id, season_id')
        .lte('picks_lock_at', now.toISOString())
        .eq('is_scored', false)

      if (!episodes || episodes.length === 0) {
        return json({ auto_picked: 0, users: [] })
      }

      const autoPicks: Array<{ user_id: string; episode_id: string }> = []

      for (const episode of episodes) {
        const { data: leagues } = await supabaseAdmin
          .from('leagues')
          .select('id')
          .eq('season_id', episode.season_id)
          .eq('status', 'active')

        if (!leagues) continue

        for (const league of leagues) {
          const { data: members } = await supabaseAdmin
            .from('league_members')
            .select('user_id')
            .eq('league_id', league.id)

          const { data: existingPicks } = await supabaseAdmin
            .from('weekly_picks')
            .select('user_id')
            .eq('league_id', league.id)
            .eq('episode_id', episode.id)

          const pickedUserIds = new Set(existingPicks?.map((p: any) => p.user_id) || [])
          const missingUsers = members?.filter((m: any) => !pickedUserIds.has(m.user_id)) || []

          for (const member of missingUsers) {
            const { data: roster } = await supabaseAdmin
              .from('rosters')
              .select('castaway_id, castaways(id, status)')
              .eq('league_id', league.id)
              .eq('user_id', member.user_id)
              .is('dropped_at', null)

            const activeCastaway = roster?.find(
              (r: any) => r.castaways?.status === 'active'
            )

            if (activeCastaway) {
              await supabaseAdmin.from('weekly_picks').insert({
                league_id: league.id,
                user_id: member.user_id,
                episode_id: episode.id,
                castaway_id: activeCastaway.castaway_id,
                status: 'auto_picked',
                picked_at: now.toISOString(),
                locked_at: now.toISOString(),
              })

              autoPicks.push({
                user_id: member.user_id,
                episode_id: episode.id,
              })
            }
          }
        }
      }

      return json({
        auto_picked: autoPicks.length,
        users: autoPicks.map((p) => p.user_id),
      })
    }

    // Extract league ID from path like /leagues/:id/...
    const leagueMatch = path.match(/^\/leagues\/([^\/]+)(.*)/)
    if (!leagueMatch) {
      return notFound('Route not found')
    }

    const leagueId = leagueMatch[1]
    const subPath = leagueMatch[2]

    // POST /picks/leagues/:id - Submit weekly pick
    if (method === 'POST' && subPath === '') {
      const body = await req.json()
      const { castaway_id, episode_id } = body

      if (!castaway_id || !episode_id) {
        return error('castaway_id and episode_id are required')
      }

      const { data: episode } = await supabaseAdmin
        .from('episodes')
        .select('*')
        .eq('id', episode_id)
        .single()

      if (!episode) {
        return notFound('Episode not found')
      }

      const lockTime = new Date(episode.picks_lock_at)
      if (new Date() >= lockTime) {
        return error('Picks are locked for this episode')
      }

      const { data: roster } = await supabaseAdmin
        .from('rosters')
        .select('*')
        .eq('league_id', leagueId)
        .eq('user_id', user.id)
        .eq('castaway_id', castaway_id)
        .is('dropped_at', null)
        .single()

      if (!roster) {
        return error('Castaway not on your roster')
      }

      const { data: castaway } = await supabaseAdmin
        .from('castaways')
        .select('status')
        .eq('id', castaway_id)
        .single()

      if (castaway?.status !== 'active') {
        return error('Castaway is eliminated')
      }

      const { data: pick, error: upsertError } = await supabaseAdmin
        .from('weekly_picks')
        .upsert({
          league_id: leagueId,
          user_id: user.id,
          episode_id,
          castaway_id,
          status: 'pending',
          picked_at: new Date().toISOString(),
        }, {
          onConflict: 'league_id,user_id,episode_id',
        })
        .select()
        .single()

      if (upsertError) {
        return error(upsertError.message)
      }

      return json({ pick })
    }

    // GET /picks/leagues/:id/current - Get current week pick status
    if (method === 'GET' && subPath === '/current') {
      const { data: league } = await supabaseAdmin
        .from('leagues')
        .select('season_id')
        .eq('id', leagueId)
        .single()

      if (!league) {
        return notFound('League not found')
      }

      const now = new Date()
      const { data: episodes } = await supabaseAdmin
        .from('episodes')
        .select('*')
        .eq('season_id', league.season_id)
        .gte('picks_lock_at', now.toISOString())
        .order('picks_lock_at', { ascending: true })
        .limit(1)

      const episode = episodes?.[0]

      if (!episode) {
        return json({
          episode: null,
          my_pick: null,
          deadline: null,
          roster: [],
        })
      }

      const { data: pick } = await supabaseAdmin
        .from('weekly_picks')
        .select('*, castaways(*)')
        .eq('league_id', leagueId)
        .eq('user_id', user.id)
        .eq('episode_id', episode.id)
        .single()

      const { data: roster } = await supabaseAdmin
        .from('rosters')
        .select('*, castaways(*)')
        .eq('league_id', leagueId)
        .eq('user_id', user.id)
        .is('dropped_at', null)

      return json({
        episode: {
          id: episode.id,
          number: episode.number,
          title: episode.title,
          air_date: episode.air_date,
          picks_lock_at: episode.picks_lock_at,
        },
        my_pick: pick ? {
          castaway: (pick as any).castaways,
          status: pick.status,
          picked_at: pick.picked_at,
        } : null,
        deadline: episode.picks_lock_at,
        roster: roster?.map((r: any) => ({
          castaway: r.castaways,
          canPick: r.castaways?.status === 'active',
        })) || [],
      })
    }

    return notFound('Route not found')
  } catch (err) {
    console.error('Picks function error:', err)
    return error('Internal server error', 500)
  }
})
