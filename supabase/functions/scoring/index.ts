import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { handleCors } from "../_shared/cors.ts"
import { supabaseAdmin, getUser } from "../_shared/supabase.ts"
import { json, error, unauthorized, forbidden, notFound } from "../_shared/response.ts"

async function requireAdmin(userId: string): Promise<boolean> {
  const { data: userProfile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()
  return userProfile?.role === 'admin'
}

serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  const url = new URL(req.url)
  const path = url.pathname.replace('/scoring', '')
  const method = req.method

  const user = await getUser(req)
  if (!user) {
    return unauthorized('Authentication required')
  }

  try {
    // POST /scoring/recalculate - Recalculate all standings (admin)
    if (method === 'POST' && path === '/recalculate') {
      if (!await requireAdmin(user.id)) {
        return forbidden('Admin access required')
      }

      const body = await req.json()
      const { season_id } = body

      if (!season_id) {
        return error('season_id is required')
      }

      const { data: leagues } = await supabaseAdmin
        .from('leagues')
        .select('id')
        .eq('season_id', season_id)
        .eq('status', 'active')

      if (!leagues || leagues.length === 0) {
        return json({ recalculated_leagues: 0 })
      }

      for (const league of leagues) {
        const { data: members } = await supabaseAdmin
          .from('league_members')
          .select('user_id')
          .eq('league_id', league.id)

        for (const member of members || []) {
          const { data: picks } = await supabaseAdmin
            .from('weekly_picks')
            .select('points_earned')
            .eq('league_id', league.id)
            .eq('user_id', member.user_id)

          const totalPoints = picks?.reduce((sum: number, p: any) => sum + (p.points_earned || 0), 0) || 0

          await supabaseAdmin
            .from('league_members')
            .update({ total_points: totalPoints })
            .eq('league_id', league.id)
            .eq('user_id', member.user_id)
        }

        const { data: rankedMembers } = await supabaseAdmin
          .from('league_members')
          .select('id, total_points')
          .eq('league_id', league.id)
          .order('total_points', { ascending: false })

        for (let i = 0; i < (rankedMembers?.length || 0); i++) {
          await supabaseAdmin
            .from('league_members')
            .update({ rank: i + 1 })
            .eq('id', rankedMembers![i].id)
        }
      }

      return json({ recalculated_leagues: leagues.length })
    }

    // Extract episode ID from path like /episodes/:id/...
    const episodeMatch = path.match(/^\/episodes\/([^\/]+)(.*)/)
    if (!episodeMatch) {
      return notFound('Route not found')
    }

    const episodeId = episodeMatch[1]
    const subPath = episodeMatch[2]

    // POST /scoring/episodes/:id/start - Begin scoring session
    if (method === 'POST' && subPath === '/start') {
      if (!await requireAdmin(user.id)) {
        return forbidden('Admin access required')
      }

      const { data: episode } = await supabaseAdmin
        .from('episodes')
        .select('*, seasons(*)')
        .eq('id', episodeId)
        .single()

      if (!episode) {
        return notFound('Episode not found')
      }

      const { data: existingSession } = await supabaseAdmin
        .from('scoring_sessions')
        .select('*')
        .eq('episode_id', episodeId)
        .single()

      if (existingSession) {
        const { data: castaways } = await supabaseAdmin
          .from('castaways')
          .select('*')
          .eq('season_id', episode.season_id)
          .eq('status', 'active')

        const { data: rules } = await supabaseAdmin
          .from('scoring_rules')
          .select('*')
          .or(`season_id.eq.${episode.season_id},season_id.is.null`)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        const { data: scores } = await supabaseAdmin
          .from('episode_scores')
          .select('*')
          .eq('episode_id', episodeId)

        return json({
          session: existingSession,
          castaways,
          rules,
          scores,
        })
      }

      const { data: session, error: sessionError } = await supabaseAdmin
        .from('scoring_sessions')
        .insert({
          episode_id: episodeId,
          status: 'draft',
        })
        .select()
        .single()

      if (sessionError) {
        return error(sessionError.message)
      }

      const { data: castaways } = await supabaseAdmin
        .from('castaways')
        .select('*')
        .eq('season_id', episode.season_id)
        .eq('status', 'active')

      const { data: rules } = await supabaseAdmin
        .from('scoring_rules')
        .select('*')
        .or(`season_id.eq.${episode.season_id},season_id.is.null`)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      return json({
        session,
        castaways,
        rules,
        scores: [],
      })
    }

    // POST /scoring/episodes/:id/save - Save progress
    if (method === 'POST' && subPath === '/save') {
      if (!await requireAdmin(user.id)) {
        return forbidden('Admin access required')
      }

      const body = await req.json()
      const { scores } = body

      if (!Array.isArray(scores)) {
        return error('scores must be an array')
      }

      const { data: session } = await supabaseAdmin
        .from('scoring_sessions')
        .select('*')
        .eq('episode_id', episodeId)
        .single()

      if (!session) {
        return notFound('Scoring session not found')
      }

      if (session.status === 'finalized') {
        return error('Session is already finalized')
      }

      let savedCount = 0
      for (const score of scores) {
        const { castaway_id, scoring_rule_id, quantity } = score

        if (!castaway_id || !scoring_rule_id) continue

        const { data: rule } = await supabaseAdmin
          .from('scoring_rules')
          .select('points')
          .eq('id', scoring_rule_id)
          .single()

        if (!rule) continue

        const points = rule.points * (quantity || 1)

        if (quantity > 0) {
          await supabaseAdmin
            .from('episode_scores')
            .upsert({
              episode_id: episodeId,
              castaway_id,
              scoring_rule_id,
              quantity: quantity || 1,
              points,
              entered_by: user.id,
            }, {
              onConflict: 'episode_id,castaway_id,scoring_rule_id',
            })
          savedCount++
        } else {
          await supabaseAdmin
            .from('episode_scores')
            .delete()
            .eq('episode_id', episodeId)
            .eq('castaway_id', castaway_id)
            .eq('scoring_rule_id', scoring_rule_id)
        }
      }

      return json({ saved: savedCount })
    }

    // POST /scoring/episodes/:id/finalize - Finalize scores
    if (method === 'POST' && subPath === '/finalize') {
      if (!await requireAdmin(user.id)) {
        return forbidden('Admin access required')
      }

      const { data: episode } = await supabaseAdmin
        .from('episodes')
        .select('*, seasons(*)')
        .eq('id', episodeId)
        .single()

      if (!episode) {
        return notFound('Episode not found')
      }

      const { data: session } = await supabaseAdmin
        .from('scoring_sessions')
        .select('*')
        .eq('episode_id', episodeId)
        .single()

      if (!session) {
        return notFound('Scoring session not found')
      }

      if (session.status === 'finalized') {
        return error('Session already finalized')
      }

      await supabaseAdmin
        .from('scoring_sessions')
        .update({
          status: 'finalized',
          finalized_at: new Date().toISOString(),
          finalized_by: user.id,
        })
        .eq('id', session.id)

      await supabaseAdmin
        .from('episodes')
        .update({ is_scored: true })
        .eq('id', episodeId)

      const { data: scores } = await supabaseAdmin
        .from('episode_scores')
        .select('castaway_id, points')
        .eq('episode_id', episodeId)

      const castawayTotals: Record<string, number> = {}
      for (const score of scores || []) {
        castawayTotals[score.castaway_id] =
          (castawayTotals[score.castaway_id] || 0) + score.points
      }

      const { data: picks } = await supabaseAdmin
        .from('weekly_picks')
        .select('id, castaway_id')
        .eq('episode_id', episodeId)

      for (const pick of picks || []) {
        const pointsEarned = castawayTotals[pick.castaway_id] || 0
        await supabaseAdmin
          .from('weekly_picks')
          .update({ points_earned: pointsEarned })
          .eq('id', pick.id)
      }

      const { data: leagues } = await supabaseAdmin
        .from('leagues')
        .select('id')
        .eq('season_id', episode.season_id)
        .eq('status', 'active')

      for (const league of leagues || []) {
        const { data: members } = await supabaseAdmin
          .from('league_members')
          .select('user_id')
          .eq('league_id', league.id)

        for (const member of members || []) {
          const { data: userPicks } = await supabaseAdmin
            .from('weekly_picks')
            .select('points_earned')
            .eq('league_id', league.id)
            .eq('user_id', member.user_id)

          const totalPoints = userPicks?.reduce((sum: number, p: any) => sum + (p.points_earned || 0), 0) || 0

          await supabaseAdmin
            .from('league_members')
            .update({ total_points: totalPoints })
            .eq('league_id', league.id)
            .eq('user_id', member.user_id)
        }

        const { data: rankedMembers } = await supabaseAdmin
          .from('league_members')
          .select('id, total_points')
          .eq('league_id', league.id)
          .order('total_points', { ascending: false })

        for (let i = 0; i < (rankedMembers?.length || 0); i++) {
          await supabaseAdmin
            .from('league_members')
            .update({ rank: i + 1 })
            .eq('id', rankedMembers![i].id)
        }
      }

      const { data: eliminationRules } = await supabaseAdmin
        .from('scoring_rules')
        .select('id')
        .ilike('code', '%ELIM%')

      const eliminatedCastawayIds: string[] = []
      if (eliminationRules && eliminationRules.length > 0) {
        const elimRuleIds = eliminationRules.map((r: any) => r.id)

        const { data: elimScores } = await supabaseAdmin
          .from('episode_scores')
          .select('castaway_id')
          .eq('episode_id', episodeId)
          .in('scoring_rule_id', elimRuleIds)

        for (const score of elimScores || []) {
          await supabaseAdmin
            .from('castaways')
            .update({
              status: 'eliminated',
              eliminated_episode_id: episodeId,
            })
            .eq('id', score.castaway_id)

          eliminatedCastawayIds.push(score.castaway_id)
        }
      }

      return json({
        finalized: true,
        eliminated: eliminatedCastawayIds,
        standings_updated: true,
      })
    }

    // GET /scoring/episodes/:id - Get all scores for episode
    if (method === 'GET' && subPath === '') {
      const { data: session } = await supabaseAdmin
        .from('scoring_sessions')
        .select('status')
        .eq('episode_id', episodeId)
        .single()

      if (!session || session.status !== 'finalized') {
        return forbidden('Scores not yet available')
      }

      const { data: scores } = await supabaseAdmin
        .from('episode_scores')
        .select(`
          id,
          quantity,
          points,
          castaways (
            id,
            name,
            photo_url
          ),
          scoring_rules (
            id,
            code,
            name,
            points,
            category
          )
        `)
        .eq('episode_id', episodeId)

      const totals: Record<string, number> = {}
      for (const score of scores || []) {
        const castawayId = (score as any).castaways?.id
        if (castawayId) {
          totals[castawayId] = (totals[castawayId] || 0) + score.points
        }
      }

      return json({ scores, totals })
    }

    // GET /scoring/episodes/:id/:castawayId - Get castaway's episode scores
    const castawayMatch = subPath.match(/^\/([^\/]+)$/)
    if (method === 'GET' && castawayMatch) {
      const castawayId = castawayMatch[1]

      const { data: session } = await supabaseAdmin
        .from('scoring_sessions')
        .select('status')
        .eq('episode_id', episodeId)
        .single()

      if (!session || session.status !== 'finalized') {
        return forbidden('Scores not yet available')
      }

      const { data: castaway } = await supabaseAdmin
        .from('castaways')
        .select('*')
        .eq('id', castawayId)
        .single()

      if (!castaway) {
        return notFound('Castaway not found')
      }

      const { data: scores } = await supabaseAdmin
        .from('episode_scores')
        .select(`
          quantity,
          points,
          scoring_rules (
            code,
            name,
            points,
            category
          )
        `)
        .eq('episode_id', episodeId)
        .eq('castaway_id', castawayId)

      const total = scores?.reduce((sum: number, s: any) => sum + s.points, 0) || 0

      return json({
        castaway,
        scores,
        total,
      })
    }

    return notFound('Route not found')
  } catch (err) {
    console.error('Scoring function error:', err)
    return error('Internal server error', 500)
  }
})
