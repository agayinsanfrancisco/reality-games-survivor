import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { handleCors } from "../_shared/cors.ts"
import { supabaseAdmin, getUser } from "../_shared/supabase.ts"
import { json, error, unauthorized, forbidden } from "../_shared/response.ts"

// Note: In production, integrate with Resend for email and Twilio for SMS
// For now, this logs notifications and records them in the database

serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  const url = new URL(req.url)
  const path = url.pathname.replace('/notifications', '')
  const method = req.method

  const user = await getUser(req)
  if (!user) {
    return unauthorized('Authentication required')
  }

  // Verify admin
  const { data: userProfile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userProfile?.role !== 'admin') {
    return forbidden('Admin access required')
  }

  try {
    // POST /notifications/send-reminders - Send pick/draft/waiver reminders
    if (method === 'POST' && path === '/send-reminders') {
      const body = await req.json()
      const { type } = body // 'pick' | 'draft' | 'waiver'

      if (!type || !['pick', 'draft', 'waiver'].includes(type)) {
        return error('type must be pick, draft, or waiver')
      }

      const now = new Date()
      let sent = 0

      if (type === 'pick') {
        // Find episodes with picks due soon (within 3 hours)
        const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000)

        const { data: episodes } = await supabaseAdmin
          .from('episodes')
          .select('id, number, picks_lock_at, season_id')
          .gte('picks_lock_at', now.toISOString())
          .lte('picks_lock_at', threeHoursFromNow.toISOString())

        if (episodes && episodes.length > 0) {
          for (const episode of episodes) {
            // Get leagues for this season
            const { data: leagues } = await supabaseAdmin
              .from('leagues')
              .select('id, name')
              .eq('season_id', episode.season_id)
              .eq('status', 'active')

            if (!leagues) continue

            for (const league of leagues) {
              // Get members who haven't picked
              const { data: members } = await supabaseAdmin
                .from('league_members')
                .select('user_id, users(id, email, display_name, notification_email)')
                .eq('league_id', league.id)

              const { data: picks } = await supabaseAdmin
                .from('weekly_picks')
                .select('user_id')
                .eq('league_id', league.id)
                .eq('episode_id', episode.id)

              const pickedUserIds = new Set(picks?.map((p: any) => p.user_id) || [])

              for (const member of members || []) {
                if (pickedUserIds.has(member.user_id)) continue

                const userData = member.users as any
                if (!userData?.notification_email) continue

                // Record notification
                await supabaseAdmin.from('notifications').insert({
                  user_id: member.user_id,
                  type: 'email',
                  subject: `Pick Reminder: Episode ${episode.number}`,
                  body: `Don't forget to make your pick for ${league.name}! Picks lock at ${new Date(episode.picks_lock_at).toLocaleString()}.`,
                  metadata: {
                    league_id: league.id,
                    episode_id: episode.id,
                    reminder_type: 'pick',
                  },
                })

                sent++
                console.log(`Pick reminder sent to ${userData.email} for ${league.name}`)
              }
            }
          }
        }
      }

      if (type === 'draft') {
        // Find leagues with pending/in_progress drafts
        const { data: leagues } = await supabaseAdmin
          .from('leagues')
          .select('id, name, seasons(draft_deadline)')
          .in('draft_status', ['pending', 'in_progress'])

        if (leagues) {
          for (const league of leagues) {
            const deadline = (league.seasons as any)?.draft_deadline
            if (!deadline) continue

            const deadlineDate = new Date(deadline)
            const hoursUntilDeadline = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60)

            // Only send if deadline is within 24 hours
            if (hoursUntilDeadline > 24 || hoursUntilDeadline < 0) continue

            const { data: members } = await supabaseAdmin
              .from('league_members')
              .select('user_id, users(id, email, display_name, notification_email)')
              .eq('league_id', league.id)

            for (const member of members || []) {
              const userData = member.users as any
              if (!userData?.notification_email) continue

              await supabaseAdmin.from('notifications').insert({
                user_id: member.user_id,
                type: 'email',
                subject: `Draft Reminder: ${league.name}`,
                body: `The draft for ${league.name} closes in ${Math.round(hoursUntilDeadline)} hours!`,
                metadata: {
                  league_id: league.id,
                  reminder_type: 'draft',
                },
              })

              sent++
              console.log(`Draft reminder sent to ${userData.email} for ${league.name}`)
            }
          }
        }
      }

      if (type === 'waiver') {
        // Find episodes with waiver window closing soon
        const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000)

        const { data: episodes } = await supabaseAdmin
          .from('episodes')
          .select('id, number, waiver_closes_at, season_id')
          .gte('waiver_closes_at', now.toISOString())
          .lte('waiver_closes_at', threeHoursFromNow.toISOString())

        if (episodes && episodes.length > 0) {
          for (const episode of episodes) {
            const { data: leagues } = await supabaseAdmin
              .from('leagues')
              .select('id, name')
              .eq('season_id', episode.season_id)
              .eq('status', 'active')

            if (!leagues) continue

            for (const league of leagues) {
              // Get members who haven't submitted rankings but have eliminated castaways
              const { data: members } = await supabaseAdmin
                .from('league_members')
                .select('user_id, users(id, email, display_name, notification_email)')
                .eq('league_id', league.id)

              const { data: rankings } = await supabaseAdmin
                .from('waiver_rankings')
                .select('user_id')
                .eq('league_id', league.id)
                .eq('episode_id', episode.id)

              const submittedUserIds = new Set(rankings?.map((r: any) => r.user_id) || [])

              for (const member of members || []) {
                if (submittedUserIds.has(member.user_id)) continue

                // Check if they have eliminated castaway
                const { data: roster } = await supabaseAdmin
                  .from('rosters')
                  .select('castaways(status)')
                  .eq('league_id', league.id)
                  .eq('user_id', member.user_id)
                  .is('dropped_at', null)

                const hasEliminated = roster?.some((r: any) => r.castaways?.status === 'eliminated')
                if (!hasEliminated) continue

                const userData = member.users as any
                if (!userData?.notification_email) continue

                await supabaseAdmin.from('notifications').insert({
                  user_id: member.user_id,
                  type: 'email',
                  subject: `Waiver Reminder: ${league.name}`,
                  body: `Submit your waiver rankings for ${league.name}! Window closes at ${new Date(episode.waiver_closes_at).toLocaleString()}.`,
                  metadata: {
                    league_id: league.id,
                    episode_id: episode.id,
                    reminder_type: 'waiver',
                  },
                })

                sent++
                console.log(`Waiver reminder sent to ${userData.email} for ${league.name}`)
              }
            }
          }
        }
      }

      return json({ sent })
    }

    // POST /notifications/send-results - Send episode results
    if (method === 'POST' && path === '/send-results') {
      const body = await req.json()
      const { episode_id } = body

      if (!episode_id) {
        return error('episode_id is required')
      }

      const { data: episode } = await supabaseAdmin
        .from('episodes')
        .select('id, number, season_id, is_scored')
        .eq('id', episode_id)
        .single()

      if (!episode) {
        return error('Episode not found')
      }

      if (!episode.is_scored) {
        return error('Episode has not been scored yet')
      }

      let sent = 0

      // Get leagues for this season
      const { data: leagues } = await supabaseAdmin
        .from('leagues')
        .select('id, name')
        .eq('season_id', episode.season_id)
        .eq('status', 'active')

      if (!leagues) {
        return json({ sent: 0 })
      }

      for (const league of leagues) {
        // Get members with their picks and points
        const { data: picks } = await supabaseAdmin
          .from('weekly_picks')
          .select(`
            user_id,
            points_earned,
            castaways(name),
            users(id, email, display_name, notification_email)
          `)
          .eq('league_id', league.id)
          .eq('episode_id', episode_id)

        for (const pick of picks || []) {
          const userData = pick.users as any
          if (!userData?.notification_email) continue

          const castawayName = (pick.castaways as any)?.name || 'Unknown'

          await supabaseAdmin.from('notifications').insert({
            user_id: pick.user_id,
            type: 'email',
            subject: `Episode ${episode.number} Results: ${league.name}`,
            body: `Your pick ${castawayName} earned ${pick.points_earned || 0} points in Episode ${episode.number}!`,
            metadata: {
              league_id: league.id,
              episode_id: episode_id,
              points_earned: pick.points_earned,
            },
          })

          sent++
          console.log(`Results sent to ${userData.email} for ${league.name}`)
        }
      }

      return json({ sent })
    }

    return error('Route not found', 404)
  } catch (err) {
    console.error('Notifications function error:', err)
    return error('Internal server error', 500)
  }
})
