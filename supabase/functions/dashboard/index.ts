import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { handleCors } from "../_shared/cors.ts"
import { supabaseAdmin, getUser } from "../_shared/supabase.ts"
import { json, error, unauthorized } from "../_shared/response.ts"

type Phase = 'waiver_open' | 'picks_locked' | 'awaiting_results' | 'results_posted' | 'make_pick' | 'pre_season' | 'draft'

function getCurrentPhase(now: Date, episode: any, league: any): Phase {
  if (!episode) return 'pre_season'

  if (league?.draft_status === 'pending' || league?.draft_status === 'in_progress') {
    return 'draft'
  }

  const picksLockAt = new Date(episode.picks_lock_at)
  const airDate = new Date(episode.air_date)
  const resultsPostedAt = episode.results_posted_at ? new Date(episode.results_posted_at) : null
  const waiverOpensAt = episode.waiver_opens_at ? new Date(episode.waiver_opens_at) : null
  const waiverClosesAt = episode.waiver_closes_at ? new Date(episode.waiver_closes_at) : null

  if (now < picksLockAt) return 'make_pick'
  if (now < airDate) return 'picks_locked'
  if (resultsPostedAt && now < resultsPostedAt) return 'awaiting_results'
  if (waiverOpensAt && waiverClosesAt && now >= waiverOpensAt && now < waiverClosesAt) return 'waiver_open'
  if (resultsPostedAt && now >= resultsPostedAt) return 'results_posted'

  return 'make_pick'
}

function getPrimaryCta(phase: Phase, leagueId: string): { label: string; action: string; urgent: boolean } {
  switch (phase) {
    case 'pre_season':
      return { label: 'View Season Info', action: '/seasons', urgent: false }
    case 'draft':
      return { label: 'Complete Your Draft', action: `/leagues/${leagueId}/draft`, urgent: true }
    case 'make_pick':
      return { label: 'Make Your Pick', action: `/leagues/${leagueId}/pick`, urgent: true }
    case 'picks_locked':
      return { label: "View Tonight's Episode", action: `/leagues/${leagueId}`, urgent: false }
    case 'awaiting_results':
      return { label: 'Episode Aired - Results Coming Soon', action: `/leagues/${leagueId}`, urgent: false }
    case 'results_posted':
      return { label: 'View Your Scores', action: `/leagues/${leagueId}/results`, urgent: false }
    case 'waiver_open':
      return { label: 'Submit Waiver Rankings', action: `/leagues/${leagueId}/waivers`, urgent: true }
    default:
      return { label: 'View League', action: `/leagues/${leagueId}`, urgent: false }
  }
}

function getCountdown(phase: Phase, episode: any): { label: string; targetTime: string } | null {
  if (!episode) return null

  switch (phase) {
    case 'make_pick':
      return { label: 'Picks lock in', targetTime: episode.picks_lock_at }
    case 'picks_locked':
      return { label: 'Episode airs in', targetTime: episode.air_date }
    case 'awaiting_results':
      return episode.results_posted_at
        ? { label: 'Results posted in', targetTime: episode.results_posted_at }
        : null
    case 'waiver_open':
      return episode.waiver_closes_at
        ? { label: 'Waiver closes in', targetTime: episode.waiver_closes_at }
        : null
    default:
      return null
  }
}

serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  const user = await getUser(req)
  if (!user) {
    return unauthorized('Authentication required')
  }

  const url = new URL(req.url)
  const leagueId = url.searchParams.get('league_id')

  try {
    const now = new Date()

    // Get user's leagues
    const { data: memberships } = await supabaseAdmin
      .from('league_members')
      .select(`
        league_id,
        total_points,
        rank,
        leagues (
          id,
          name,
          season_id,
          draft_status,
          status
        )
      `)
      .eq('user_id', user.id)

    if (!memberships || memberships.length === 0) {
      return json({
        phase: 'pre_season',
        primaryCta: { label: 'Join a League', action: '/join', urgent: false },
        countdown: null,
        currentEpisode: null,
        userStatus: {
          pickSubmitted: false,
          waiverRankingsSubmitted: false,
          needsWaiverAction: false,
        },
        standings: null,
        alerts: [],
        leagues: [],
      })
    }

    // Use specified league or first one
    const targetLeagueId = leagueId || (memberships[0].leagues as any)?.id
    const membership = memberships.find((m: any) => m.leagues?.id === targetLeagueId) || memberships[0]
    const league = membership.leagues as any

    if (!league) {
      return error('League not found')
    }

    // Get current/next episode
    const { data: episodes } = await supabaseAdmin
      .from('episodes')
      .select('*')
      .eq('season_id', league.season_id)
      .gte('air_date', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('air_date', { ascending: true })
      .limit(2)

    const currentEpisode = episodes?.[0] || null

    // Determine phase
    const phase = getCurrentPhase(now, currentEpisode, league)

    // Get user's pick status for current episode
    let pickSubmitted = false
    if (currentEpisode) {
      const { data: pick } = await supabaseAdmin
        .from('weekly_picks')
        .select('id')
        .eq('league_id', league.id)
        .eq('user_id', user.id)
        .eq('episode_id', currentEpisode.id)
        .single()

      pickSubmitted = !!pick
    }

    // Get waiver status
    let waiverRankingsSubmitted = false
    let needsWaiverAction = false
    if (currentEpisode && phase === 'waiver_open') {
      const { data: rankings } = await supabaseAdmin
        .from('waiver_rankings')
        .select('id')
        .eq('league_id', league.id)
        .eq('user_id', user.id)
        .eq('episode_id', currentEpisode.id)
        .single()

      waiverRankingsSubmitted = !!rankings

      // Check if user has eliminated castaway
      const { data: roster } = await supabaseAdmin
        .from('rosters')
        .select('castaways(status)')
        .eq('league_id', league.id)
        .eq('user_id', user.id)
        .is('dropped_at', null)

      needsWaiverAction = roster?.some((r: any) => r.castaways?.status === 'eliminated') || false
    }

    // Get standings
    const { data: allMembers } = await supabaseAdmin
      .from('league_members')
      .select('user_id, total_points, rank')
      .eq('league_id', league.id)
      .order('total_points', { ascending: false })

    const totalPlayers = allMembers?.length || 0
    const userRank = membership.rank || totalPlayers

    // Build alerts
    const alerts: Array<{ type: string; message: string }> = []

    if (phase === 'make_pick' && !pickSubmitted) {
      alerts.push({ type: 'warning', message: 'You haven\'t submitted your pick yet!' })
    }

    if (phase === 'draft' && league.draft_status === 'in_progress') {
      alerts.push({ type: 'info', message: 'Draft is in progress' })
    }

    if (needsWaiverAction && !waiverRankingsSubmitted) {
      alerts.push({ type: 'warning', message: 'You have an eliminated castaway - submit waiver rankings!' })
    }

    return json({
      phase,
      primaryCta: getPrimaryCta(phase, league.id),
      countdown: getCountdown(phase, currentEpisode),
      currentEpisode: currentEpisode ? {
        id: currentEpisode.id,
        number: currentEpisode.number,
        title: currentEpisode.title,
        airDate: currentEpisode.air_date,
      } : null,
      userStatus: {
        pickSubmitted,
        waiverRankingsSubmitted,
        needsWaiverAction,
      },
      standings: {
        rank: userRank,
        totalPlayers,
        points: membership.total_points || 0,
        movement: 0,
      },
      alerts,
      leagues: memberships.map((m: any) => ({
        id: m.leagues?.id,
        name: m.leagues?.name,
        rank: m.rank,
        points: m.total_points,
      })),
    })
  } catch (err) {
    console.error('Dashboard function error:', err)
    return error('Internal server error', 500)
  }
})
