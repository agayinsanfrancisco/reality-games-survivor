import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { handleCors } from "../_shared/cors.ts"
import { supabaseAdmin, getUser } from "../_shared/supabase.ts"
import { json, error, unauthorized, forbidden, notFound } from "../_shared/response.ts"

serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  const url = new URL(req.url)
  const path = url.pathname.replace('/draft', '')
  const method = req.method

  const user = await getUser(req)
  if (!user) {
    return unauthorized('Authentication required')
  }

  try {
    // POST /draft/finalize-all - Auto-complete all incomplete drafts (admin only)
    if (method === 'POST' && path === '/finalize-all') {
      const { data: userProfile } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userProfile?.role !== 'admin') {
        return forbidden('Admin access required')
      }

      const { data: leagues } = await supabaseAdmin
        .from('leagues')
        .select('*, seasons(*)')
        .eq('draft_status', 'in_progress')

      if (!leagues || leagues.length === 0) {
        return json({ finalized_leagues: 0, auto_picks: 0 })
      }

      let totalAutoPicks = 0
      const finalizedLeagues: string[] = []

      for (const league of leagues) {
        const season = (league as any).seasons
        const deadline = new Date(season.draft_deadline)

        if (new Date() < deadline) continue

        const { data: picks } = await supabaseAdmin
          .from('rosters')
          .select('*')
          .eq('league_id', league.id)

        const { data: members } = await supabaseAdmin
          .from('league_members')
          .select('user_id')
          .eq('league_id', league.id)

        const { data: castaways } = await supabaseAdmin
          .from('castaways')
          .select('*')
          .eq('season_id', league.season_id)
          .eq('status', 'active')

        const pickedIds = new Set(picks?.map((p: any) => p.castaway_id) || [])
        const available = castaways?.filter((c: any) => !pickedIds.has(c.id)) || []

        const totalMembers = members?.length || 0
        let currentPicks = picks?.length || 0
        const draftOrder = league.draft_order || []

        while (currentPicks < totalMembers * 2 && available.length > 0) {
          const currentRound = Math.floor(currentPicks / totalMembers) + 1
          const pickInRound = currentPicks % totalMembers

          let currentPickerIndex: number
          if (currentRound % 2 === 1) {
            currentPickerIndex = pickInRound
          } else {
            currentPickerIndex = totalMembers - 1 - pickInRound
          }

          const pickerId = draftOrder[currentPickerIndex]
          const castaway = available.shift()!

          await supabaseAdmin.from('rosters').insert({
            league_id: league.id,
            user_id: pickerId,
            castaway_id: castaway.id,
            draft_round: currentRound,
            draft_pick: currentPicks + 1,
            acquired_via: 'auto_draft',
          })

          currentPicks++
          totalAutoPicks++
        }

        await supabaseAdmin
          .from('leagues')
          .update({
            draft_status: 'completed',
            draft_completed_at: new Date().toISOString(),
            status: 'active',
          })
          .eq('id', league.id)

        finalizedLeagues.push(league.id)
      }

      return json({
        finalized_leagues: finalizedLeagues.length,
        auto_picks: totalAutoPicks,
      })
    }

    // Extract league ID from path like /leagues/:id/...
    const leagueMatch = path.match(/^\/leagues\/([^\/]+)(.*)/)
    if (!leagueMatch) {
      return notFound('Route not found')
    }

    const leagueId = leagueMatch[1]
    const subPath = leagueMatch[2]

    // GET /draft/leagues/:id/state - Get draft state
    if (method === 'GET' && subPath === '/state') {
      const { data: league, error: leagueError } = await supabaseAdmin
        .from('leagues')
        .select('*, seasons(*)')
        .eq('id', leagueId)
        .single()

      if (leagueError || !league) {
        return notFound('League not found')
      }

      const { data: members } = await supabaseAdmin
        .from('league_members')
        .select('user_id, draft_position, users(id, display_name)')
        .eq('league_id', leagueId)
        .order('draft_position', { ascending: true })

      const { data: picks } = await supabaseAdmin
        .from('rosters')
        .select('user_id, castaway_id, draft_round, draft_pick')
        .eq('league_id', leagueId)
        .order('draft_pick', { ascending: true })

      const { data: castaways } = await supabaseAdmin
        .from('castaways')
        .select('*')
        .eq('season_id', league.season_id)

      const pickedCastawayIds = new Set(picks?.map((p: any) => p.castaway_id) || [])
      const available = castaways?.filter((c: any) => !pickedCastawayIds.has(c.id)) || []

      const totalMembers = members?.length || 0
      const totalPicks = picks?.length || 0
      const currentRound = Math.floor(totalPicks / totalMembers) + 1
      const pickInRound = totalPicks % totalMembers

      let currentPickerIndex: number
      if (currentRound % 2 === 1) {
        currentPickerIndex = pickInRound
      } else {
        currentPickerIndex = totalMembers - 1 - pickInRound
      }

      const draftOrder = league.draft_order || members?.map((m: any) => m.user_id) || []
      const currentPickUserId = draftOrder[currentPickerIndex]

      const myPicks = picks?.filter((p: any) => p.user_id === user.id) || []

      return json({
        status: league.draft_status,
        current_pick: totalPicks + 1,
        current_round: currentRound,
        current_picker: currentPickUserId,
        is_my_turn: currentPickUserId === user.id,
        order: draftOrder.map((uid: string, idx: number) => {
          const member = members?.find((m: any) => m.user_id === uid)
          return {
            user_id: uid,
            position: idx + 1,
            display_name: (member as any)?.users?.display_name || 'Unknown',
          }
        }),
        available,
        my_picks: myPicks.map((p: any) => ({
          castaway: castaways?.find((c: any) => c.id === p.castaway_id),
          round: p.draft_round,
          pick: p.draft_pick,
        })),
        picks: picks?.map((p: any) => ({
          user_id: p.user_id,
          castaway_id: p.castaway_id,
          round: p.draft_round,
          pick: p.draft_pick,
        })),
      })
    }

    // GET /draft/leagues/:id/order - Get draft order
    if (method === 'GET' && subPath === '/order') {
      const { data: league } = await supabaseAdmin
        .from('leagues')
        .select('draft_order')
        .eq('id', leagueId)
        .single()

      if (!league) {
        return notFound('League not found')
      }

      const { data: members } = await supabaseAdmin
        .from('league_members')
        .select('user_id, users(id, display_name)')
        .eq('league_id', leagueId)

      const order = (league.draft_order || []).map((uid: string, idx: number) => {
        const member = members?.find((m: any) => m.user_id === uid)
        return {
          user_id: uid,
          position: idx + 1,
          display_name: (member as any)?.users?.display_name || 'Unknown',
        }
      })

      return json({ order })
    }

    // POST /draft/leagues/:id/pick - Make a draft pick
    if (method === 'POST' && subPath === '/pick') {
      const body = await req.json()
      const { castaway_id } = body

      if (!castaway_id) {
        return error('castaway_id is required')
      }

      const { data: league } = await supabaseAdmin
        .from('leagues')
        .select('*')
        .eq('id', leagueId)
        .single()

      if (!league) {
        return notFound('League not found')
      }

      if (league.draft_status !== 'in_progress') {
        return error('Draft is not in progress')
      }

      const { data: picks } = await supabaseAdmin
        .from('rosters')
        .select('*')
        .eq('league_id', leagueId)

      const { data: members } = await supabaseAdmin
        .from('league_members')
        .select('user_id')
        .eq('league_id', leagueId)

      const totalMembers = members?.length || 0
      const totalPicks = picks?.length || 0
      const currentRound = Math.floor(totalPicks / totalMembers) + 1
      const pickInRound = totalPicks % totalMembers

      let currentPickerIndex: number
      if (currentRound % 2 === 1) {
        currentPickerIndex = pickInRound
      } else {
        currentPickerIndex = totalMembers - 1 - pickInRound
      }

      const draftOrder = league.draft_order || []
      const currentPickUserId = draftOrder[currentPickerIndex]

      if (currentPickUserId !== user.id) {
        return forbidden('Not your turn to pick')
      }

      const alreadyPicked = picks?.some((p: any) => p.castaway_id === castaway_id)
      if (alreadyPicked) {
        return error('Castaway already drafted')
      }

      const userPicks = picks?.filter((p: any) => p.user_id === user.id).length || 0
      if (userPicks >= 2) {
        return error('You already have 2 castaways')
      }

      const { data: roster, error: insertError } = await supabaseAdmin
        .from('rosters')
        .insert({
          league_id: leagueId,
          user_id: user.id,
          castaway_id,
          draft_round: currentRound,
          draft_pick: totalPicks + 1,
        })
        .select()
        .single()

      if (insertError) {
        return error(insertError.message)
      }

      const newTotalPicks = totalPicks + 1
      const isDraftComplete = newTotalPicks >= totalMembers * 2

      if (isDraftComplete) {
        await supabaseAdmin
          .from('leagues')
          .update({
            draft_status: 'completed',
            draft_completed_at: new Date().toISOString(),
            status: 'active',
          })
          .eq('id', leagueId)
      }

      const nextPickNumber = newTotalPicks + 1
      const nextRound = Math.floor(newTotalPicks / totalMembers) + 1
      const nextPickInRound = newTotalPicks % totalMembers

      let nextPickerIndex: number
      if (nextRound % 2 === 1) {
        nextPickerIndex = nextPickInRound
      } else {
        nextPickerIndex = totalMembers - 1 - nextPickInRound
      }

      const nextPickUserId = draftOrder[nextPickerIndex]

      return json({
        roster_entry: roster,
        draft_complete: isDraftComplete,
        next_pick: isDraftComplete ? null : {
          pick_number: nextPickNumber,
          round: nextRound,
          user_id: nextPickUserId,
        },
      })
    }

    // POST /draft/leagues/:id/set-order - Set or randomize draft order
    if (method === 'POST' && subPath === '/set-order') {
      const body = await req.json()
      const { order, randomize } = body

      const { data: league } = await supabaseAdmin
        .from('leagues')
        .select('commissioner_id, co_commissioners, draft_status')
        .eq('id', leagueId)
        .single()

      const { data: userProfile } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      const isCommissioner = league?.commissioner_id === user.id ||
        ((league?.co_commissioners as string[]) || []).includes(user.id)

      if (!league || (!isCommissioner && userProfile?.role !== 'admin')) {
        return forbidden('Only commissioner can set draft order')
      }

      if (league.draft_status !== 'pending') {
        return error('Cannot change order after draft starts')
      }

      const { data: members } = await supabaseAdmin
        .from('league_members')
        .select('user_id')
        .eq('league_id', leagueId)

      let draftOrder: string[]

      if (randomize) {
        const memberIds = members?.map((m: any) => m.user_id) || []
        draftOrder = memberIds.sort(() => Math.random() - 0.5)
      } else if (order && Array.isArray(order)) {
        draftOrder = order
      } else {
        return error('Must provide order array or randomize=true')
      }

      const { error: updateError } = await supabaseAdmin
        .from('leagues')
        .update({ draft_order: draftOrder })
        .eq('id', leagueId)

      if (updateError) {
        return error(updateError.message)
      }

      for (let i = 0; i < draftOrder.length; i++) {
        await supabaseAdmin
          .from('league_members')
          .update({ draft_position: i + 1 })
          .eq('league_id', leagueId)
          .eq('user_id', draftOrder[i])
      }

      return json({ order: draftOrder })
    }

    // POST /draft/leagues/:id/start - Start draft (commissioner only)
    if (method === 'POST' && subPath === '/start') {
      const { data: league } = await supabaseAdmin
        .from('leagues')
        .select('commissioner_id, co_commissioners, draft_status, draft_order')
        .eq('id', leagueId)
        .single()

      const { data: userProfile } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      const isCommissioner = league?.commissioner_id === user.id ||
        ((league?.co_commissioners as string[]) || []).includes(user.id)

      if (!league || (!isCommissioner && userProfile?.role !== 'admin')) {
        return forbidden('Only commissioner can start draft')
      }

      if (league.draft_status !== 'pending') {
        return error('Draft already started or completed')
      }

      // If no draft order set, randomize it
      let draftOrder = league.draft_order
      if (!draftOrder || draftOrder.length === 0) {
        const { data: members } = await supabaseAdmin
          .from('league_members')
          .select('user_id')
          .eq('league_id', leagueId)

        const memberIds = members?.map((m: any) => m.user_id) || []
        draftOrder = memberIds.sort(() => Math.random() - 0.5)

        for (let i = 0; i < draftOrder.length; i++) {
          await supabaseAdmin
            .from('league_members')
            .update({ draft_position: i + 1 })
            .eq('league_id', leagueId)
            .eq('user_id', draftOrder[i])
        }
      }

      const { data, error: updateError } = await supabaseAdmin
        .from('leagues')
        .update({
          draft_status: 'in_progress',
          draft_order: draftOrder,
          draft_started_at: new Date().toISOString(),
          status: 'drafting',
        })
        .eq('id', leagueId)
        .select()
        .single()

      if (updateError) {
        return error(updateError.message)
      }

      return json({ league: data, message: 'Draft started' })
    }

    return notFound('Route not found')
  } catch (err) {
    console.error('Draft function error:', err)
    return error('Internal server error', 500)
  }
})
