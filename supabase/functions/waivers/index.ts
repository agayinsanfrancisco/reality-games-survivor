import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { handleCors } from "../_shared/cors.ts"
import { supabaseAdmin, getUser } from "../_shared/supabase.ts"
import { json, error, unauthorized, forbidden, notFound } from "../_shared/response.ts"

serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  const url = new URL(req.url)
  const path = url.pathname.replace('/waivers', '')
  const method = req.method

  const user = await getUser(req)
  if (!user) {
    return unauthorized('Authentication required')
  }

  try {
    // POST /waivers/process - Process all waivers (admin/cron)
    if (method === 'POST' && path === '/process') {
      const { data: userProfile } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userProfile?.role !== 'admin') {
        return forbidden('Admin access required')
      }

      const now = new Date()

      // Find episodes with closed waiver windows
      const { data: episodes } = await supabaseAdmin
        .from('episodes')
        .select('id, season_id')
        .lte('waiver_closes_at', now.toISOString())
        .eq('is_scored', true)

      if (!episodes || episodes.length === 0) {
        return json({ processed: 0, transactions: [] })
      }

      const transactions: Array<{ user: string; dropped: string; acquired: string }> = []

      for (const episode of episodes) {
        // Get leagues for this season
        const { data: leagues } = await supabaseAdmin
          .from('leagues')
          .select('id')
          .eq('season_id', episode.season_id)
          .eq('status', 'active')

        if (!leagues) continue

        for (const league of leagues) {
          // Check if already processed
          const { data: existingResults } = await supabaseAdmin
            .from('waiver_results')
            .select('id')
            .eq('league_id', league.id)
            .eq('episode_id', episode.id)
            .limit(1)

          if (existingResults && existingResults.length > 0) continue

          // Get members sorted by inverse standings (last place first)
          const { data: members } = await supabaseAdmin
            .from('league_members')
            .select('user_id, rank')
            .eq('league_id', league.id)
            .order('rank', { ascending: false })

          if (!members) continue

          // Get available castaways (eliminated ones that can be picked up)
          const { data: eliminatedCastaways } = await supabaseAdmin
            .from('castaways')
            .select('id, name')
            .eq('status', 'eliminated')
            .eq('eliminated_episode_id', episode.id)

          if (!eliminatedCastaways || eliminatedCastaways.length === 0) continue

          // Get all current rosters to find available replacements
          const { data: allRosters } = await supabaseAdmin
            .from('rosters')
            .select('castaway_id')
            .eq('league_id', league.id)
            .is('dropped_at', null)

          const rosteredCastawayIds = new Set(allRosters?.map((r: any) => r.castaway_id) || [])

          // Get active castaways not on any roster
          const { data: activeCastaways } = await supabaseAdmin
            .from('castaways')
            .select('id, name')
            .eq('season_id', episode.season_id)
            .eq('status', 'active')

          const availableCastaways = activeCastaways?.filter(
            (c: any) => !rosteredCastawayIds.has(c.id)
          ) || []

          // Process each member's waiver rankings
          for (let waiverPosition = 0; waiverPosition < members.length; waiverPosition++) {
            const member = members[waiverPosition]

            // Check if user has eliminated castaway
            const { data: userRoster } = await supabaseAdmin
              .from('rosters')
              .select('id, castaway_id, castaways(id, name, status)')
              .eq('league_id', league.id)
              .eq('user_id', member.user_id)
              .is('dropped_at', null)

            const eliminatedOnRoster = userRoster?.find(
              (r: any) => r.castaways?.status === 'eliminated'
            )

            if (!eliminatedOnRoster) continue

            // Get user's waiver rankings
            const { data: rankings } = await supabaseAdmin
              .from('waiver_rankings')
              .select('rankings')
              .eq('league_id', league.id)
              .eq('user_id', member.user_id)
              .eq('episode_id', episode.id)
              .single()

            if (!rankings?.rankings) continue

            // Find first available castaway from rankings
            let acquiredCastaway = null
            for (const castawayId of rankings.rankings as string[]) {
              const available = availableCastaways.find((c: any) => c.id === castawayId)
              if (available) {
                acquiredCastaway = available
                // Remove from available pool
                const idx = availableCastaways.findIndex((c: any) => c.id === castawayId)
                if (idx > -1) availableCastaways.splice(idx, 1)
                break
              }
            }

            if (!acquiredCastaway) continue

            // Drop eliminated castaway
            await supabaseAdmin
              .from('rosters')
              .update({ dropped_at: now.toISOString() })
              .eq('id', eliminatedOnRoster.id)

            // Add new castaway
            await supabaseAdmin
              .from('rosters')
              .insert({
                league_id: league.id,
                user_id: member.user_id,
                castaway_id: acquiredCastaway.id,
                draft_round: 0,
                draft_pick: 0,
                acquired_via: 'waiver',
              })

            // Record result
            await supabaseAdmin
              .from('waiver_results')
              .insert({
                league_id: league.id,
                user_id: member.user_id,
                episode_id: episode.id,
                dropped_castaway_id: eliminatedOnRoster.castaway_id,
                acquired_castaway_id: acquiredCastaway.id,
                waiver_position: waiverPosition + 1,
              })

            transactions.push({
              user: member.user_id,
              dropped: (eliminatedOnRoster.castaways as any)?.name || 'Unknown',
              acquired: acquiredCastaway.name,
            })
          }
        }
      }

      return json({
        processed: transactions.length,
        transactions,
      })
    }

    // Extract league ID from path like /leagues/:id/...
    const leagueMatch = path.match(/^\/leagues\/([^\/]+)(.*)/)
    if (!leagueMatch) {
      return notFound('Route not found')
    }

    const leagueId = leagueMatch[1]
    const subPath = leagueMatch[2]

    // Verify user is league member
    const { data: membership } = await supabaseAdmin
      .from('league_members')
      .select('id')
      .eq('league_id', leagueId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return forbidden('Not a member of this league')
    }

    // GET /waivers/leagues/:id/available - Get available castaways
    if (method === 'GET' && subPath === '/available') {
      const { data: league } = await supabaseAdmin
        .from('leagues')
        .select('season_id')
        .eq('id', leagueId)
        .single()

      if (!league) {
        return notFound('League not found')
      }

      // Get all rostered castaways in this league
      const { data: rosters } = await supabaseAdmin
        .from('rosters')
        .select('castaway_id')
        .eq('league_id', leagueId)
        .is('dropped_at', null)

      const rosteredIds = new Set(rosters?.map((r: any) => r.castaway_id) || [])

      // Get active castaways not on any roster
      const { data: castaways } = await supabaseAdmin
        .from('castaways')
        .select('id, name, photo_url, tribe_original')
        .eq('season_id', league.season_id)
        .eq('status', 'active')

      const available = castaways?.filter((c: any) => !rosteredIds.has(c.id)) || []

      return json({ castaways: available })
    }

    // GET /waivers/leagues/:id/my-rankings - Get user's rankings
    if (method === 'GET' && subPath === '/my-rankings') {
      const { data: league } = await supabaseAdmin
        .from('leagues')
        .select('season_id')
        .eq('id', leagueId)
        .single()

      if (!league) {
        return notFound('League not found')
      }

      // Get current episode with open waiver window
      const now = new Date()
      const { data: episode } = await supabaseAdmin
        .from('episodes')
        .select('id')
        .eq('season_id', league.season_id)
        .lte('waiver_opens_at', now.toISOString())
        .gte('waiver_closes_at', now.toISOString())
        .single()

      if (!episode) {
        return json({ rankings: [], submitted_at: null, episode_id: null })
      }

      const { data: rankings } = await supabaseAdmin
        .from('waiver_rankings')
        .select('rankings, submitted_at')
        .eq('league_id', leagueId)
        .eq('user_id', user.id)
        .eq('episode_id', episode.id)
        .single()

      return json({
        rankings: rankings?.rankings || [],
        submitted_at: rankings?.submitted_at || null,
        episode_id: episode.id,
      })
    }

    // PUT /waivers/leagues/:id/rankings - Submit rankings
    if (method === 'PUT' && subPath === '/rankings') {
      const body = await req.json()
      const { rankings } = body

      if (!Array.isArray(rankings)) {
        return error('rankings must be an array of castaway IDs')
      }

      const { data: league } = await supabaseAdmin
        .from('leagues')
        .select('season_id')
        .eq('id', leagueId)
        .single()

      if (!league) {
        return notFound('League not found')
      }

      // Get current episode with open waiver window
      const now = new Date()
      const { data: episode } = await supabaseAdmin
        .from('episodes')
        .select('id, waiver_closes_at')
        .eq('season_id', league.season_id)
        .lte('waiver_opens_at', now.toISOString())
        .gte('waiver_closes_at', now.toISOString())
        .single()

      if (!episode) {
        return error('Waiver window is not open')
      }

      const { data: result, error: upsertError } = await supabaseAdmin
        .from('waiver_rankings')
        .upsert({
          league_id: leagueId,
          user_id: user.id,
          episode_id: episode.id,
          rankings,
          submitted_at: now.toISOString(),
        }, {
          onConflict: 'league_id,user_id,episode_id',
        })
        .select()
        .single()

      if (upsertError) {
        return error(upsertError.message)
      }

      return json({
        rankings: result.rankings,
        deadline: episode.waiver_closes_at,
      })
    }

    return notFound('Route not found')
  } catch (err) {
    console.error('Waivers function error:', err)
    return error('Internal server error', 500)
  }
})
