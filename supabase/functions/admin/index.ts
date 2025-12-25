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
  const path = url.pathname.replace('/admin', '')
  const method = req.method

  const user = await getUser(req)
  if (!user) {
    return unauthorized('Authentication required')
  }

  if (!await requireAdmin(user.id)) {
    return forbidden('Admin access required')
  }

  try {
    // ========== SEASONS ==========

    // POST /admin/seasons - Create season
    if (method === 'POST' && path === '/seasons') {
      const body = await req.json()
      const {
        number,
        name,
        registration_opens_at,
        draft_order_deadline,
        registration_closes_at,
        premiere_at,
        draft_deadline,
        finale_at,
      } = body

      if (!number || !name || !registration_opens_at || !premiere_at || !draft_deadline) {
        return error('number, name, registration_opens_at, premiere_at, and draft_deadline are required')
      }

      const { data: season, error: createError } = await supabaseAdmin
        .from('seasons')
        .insert({
          number,
          name,
          registration_opens_at,
          draft_order_deadline: draft_order_deadline || registration_closes_at,
          registration_closes_at: registration_closes_at || premiere_at,
          premiere_at,
          draft_deadline,
          finale_at,
        })
        .select()
        .single()

      if (createError) {
        return error(createError.message)
      }

      return json({ season }, 201)
    }

    // PATCH /admin/seasons/:id - Update season
    const seasonMatch = path.match(/^\/seasons\/([^\/]+)$/)
    if (method === 'PATCH' && seasonMatch) {
      const seasonId = seasonMatch[1]
      const body = await req.json()

      const { data: season, error: updateError } = await supabaseAdmin
        .from('seasons')
        .update(body)
        .eq('id', seasonId)
        .select()
        .single()

      if (updateError) {
        return error(updateError.message)
      }

      return json({ season })
    }

    // POST /admin/seasons/:id/activate - Set season as active
    const activateMatch = path.match(/^\/seasons\/([^\/]+)\/activate$/)
    if (method === 'POST' && activateMatch) {
      const seasonId = activateMatch[1]

      // Deactivate all other seasons
      await supabaseAdmin
        .from('seasons')
        .update({ is_active: false })
        .neq('id', seasonId)

      // Activate this season
      const { data: season, error: updateError } = await supabaseAdmin
        .from('seasons')
        .update({ is_active: true })
        .eq('id', seasonId)
        .select()
        .single()

      if (updateError) {
        return error(updateError.message)
      }

      return json({ season, previous_deactivated: true })
    }

    // ========== CASTAWAYS ==========

    // POST /admin/castaways - Add castaway
    if (method === 'POST' && path === '/castaways') {
      const body = await req.json()
      const { season_id, name, age, hometown, occupation, photo_url, tribe_original } = body

      if (!season_id || !name) {
        return error('season_id and name are required')
      }

      const { data: castaway, error: createError } = await supabaseAdmin
        .from('castaways')
        .insert({
          season_id,
          name,
          age,
          hometown,
          occupation,
          photo_url,
          tribe_original,
        })
        .select()
        .single()

      if (createError) {
        return error(createError.message)
      }

      return json({ castaway }, 201)
    }

    // PATCH /admin/castaways/:id - Update castaway
    const castawayMatch = path.match(/^\/castaways\/([^\/]+)$/)
    if (method === 'PATCH' && castawayMatch) {
      const castawayId = castawayMatch[1]
      const body = await req.json()

      const { data: castaway, error: updateError } = await supabaseAdmin
        .from('castaways')
        .update(body)
        .eq('id', castawayId)
        .select()
        .single()

      if (updateError) {
        return error(updateError.message)
      }

      return json({ castaway })
    }

    // POST /admin/castaways/:id/eliminate - Mark castaway as eliminated
    const eliminateMatch = path.match(/^\/castaways\/([^\/]+)\/eliminate$/)
    if (method === 'POST' && eliminateMatch) {
      const castawayId = eliminateMatch[1]
      const body = await req.json()
      const { episode_id, placement } = body

      if (!episode_id) {
        return error('episode_id is required')
      }

      const { data: castaway, error: updateError } = await supabaseAdmin
        .from('castaways')
        .update({
          status: 'eliminated',
          eliminated_episode_id: episode_id,
          placement: placement || null,
        })
        .eq('id', castawayId)
        .select()
        .single()

      if (updateError) {
        return error(updateError.message)
      }

      return json({ castaway })
    }

    // ========== EPISODES ==========

    // POST /admin/episodes - Create episode
    if (method === 'POST' && path === '/episodes') {
      const body = await req.json()
      const {
        season_id,
        number,
        title,
        air_date,
        picks_lock_at,
        results_posted_at,
        is_finale,
      } = body

      if (!season_id || !number || !air_date) {
        return error('season_id, number, and air_date are required')
      }

      // Default picks_lock_at to 5 hours before air_date
      const airDateTime = new Date(air_date)
      const defaultPicksLock = new Date(airDateTime.getTime() - 5 * 60 * 60 * 1000)

      const { data: episode, error: createError } = await supabaseAdmin
        .from('episodes')
        .insert({
          season_id,
          number,
          title,
          air_date,
          picks_lock_at: picks_lock_at || defaultPicksLock.toISOString(),
          results_posted_at,
          is_finale: is_finale || false,
        })
        .select()
        .single()

      if (createError) {
        return error(createError.message)
      }

      return json({ episode }, 201)
    }

    // PATCH /admin/episodes/:id - Update episode
    const episodeMatch = path.match(/^\/episodes\/([^\/]+)$/)
    if (method === 'PATCH' && episodeMatch) {
      const episodeId = episodeMatch[1]
      const body = await req.json()

      const { data: episode, error: updateError } = await supabaseAdmin
        .from('episodes')
        .update(body)
        .eq('id', episodeId)
        .select()
        .single()

      if (updateError) {
        return error(updateError.message)
      }

      return json({ episode })
    }

    // ========== JOBS ==========

    // GET /admin/jobs - Get job status
    if (method === 'GET' && path === '/jobs') {
      // In a real implementation, this would query a jobs table or external scheduler
      // For now, return static job definitions
      const jobs = [
        { name: 'lock-picks', schedule: 'Wed 3pm PST', description: 'Lock all pending picks', last_run: null, next_run: null, status: 'scheduled' },
        { name: 'auto-fill-picks', schedule: 'Wed 3:05pm PST', description: 'Auto-pick for missing users', last_run: null, next_run: null, status: 'scheduled' },
        { name: 'send-pick-reminders', schedule: 'Wed 12pm PST', description: 'Send pick reminder emails', last_run: null, next_run: null, status: 'scheduled' },
        { name: 'send-results', schedule: 'Fri 12pm PST', description: 'Send episode results', last_run: null, next_run: null, status: 'scheduled' },
        { name: 'finalize-drafts', schedule: 'Mar 2 8pm PST', description: 'Auto-complete incomplete drafts', last_run: null, next_run: null, status: 'scheduled' },
        { name: 'weekly-summary', schedule: 'Sun 10am PST', description: 'Send weekly standings summary', last_run: null, next_run: null, status: 'scheduled' },
      ]

      return json({ jobs })
    }

    // POST /admin/jobs/:name/run - Trigger job manually
    const jobMatch = path.match(/^\/jobs\/([^\/]+)\/run$/)
    if (method === 'POST' && jobMatch) {
      const jobName = jobMatch[1]

      // Map job names to function calls
      const jobFunctions: Record<string, { function: string; path: string; body?: any }> = {
        'lock-picks': { function: 'picks', path: '/lock' },
        'auto-fill-picks': { function: 'picks', path: '/auto-fill' },
        'send-pick-reminders': { function: 'notifications', path: '/send-reminders', body: { type: 'pick' } },
        'send-draft-reminders': { function: 'notifications', path: '/send-reminders', body: { type: 'draft' } },
        'finalize-drafts': { function: 'draft', path: '/finalize-all' },
      }

      const jobConfig = jobFunctions[jobName]
      if (!jobConfig) {
        return error(`Unknown job: ${jobName}`)
      }

      // For now, just return info about the job
      // In production, this would call the appropriate edge function
      return json({
        job: jobName,
        triggered: true,
        function: jobConfig.function,
        path: jobConfig.path,
        message: `Job ${jobName} triggered. Call the ${jobConfig.function} function at ${jobConfig.path} to execute.`,
      })
    }

    return notFound('Route not found')
  } catch (err) {
    console.error('Admin function error:', err)
    return error('Internal server error', 500)
  }
})
