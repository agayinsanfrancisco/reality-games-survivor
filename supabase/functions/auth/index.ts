import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { handleCors } from "../_shared/cors.ts"
import { supabaseAdmin, getUser } from "../_shared/supabase.ts"
import { json, error, unauthorized } from "../_shared/response.ts"

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  const url = new URL(req.url)
  const path = url.pathname.replace('/auth', '')
  const method = req.method

  // Get authenticated user
  const user = await getUser(req)
  if (!user) {
    return unauthorized('Authentication required')
  }

  try {
    // GET /auth/me - Current user with leagues
    if (method === 'GET' && (path === '/me' || path === '')) {
      // Get user profile
      const { data: profile, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userError) {
        return error('User not found', 404)
      }

      // Get user's leagues with membership info
      const { data: memberships } = await supabaseAdmin
        .from('league_members')
        .select(`
          draft_position,
          total_points,
          rank,
          joined_at,
          leagues (
            id,
            name,
            code,
            status,
            commissioner_id,
            is_global
          )
        `)
        .eq('user_id', user.id)

      const leagues = memberships?.map((m: any) => ({
        ...m.leagues,
        isCommissioner: m.leagues.commissioner_id === user.id,
        draftPosition: m.draft_position,
        totalPoints: m.total_points,
        rank: m.rank,
        joinedAt: m.joined_at,
      })) || []

      return json({ user: profile, leagues })
    }

    // PATCH /auth/me/phone - Update phone number
    if (method === 'PATCH' && path === '/me/phone') {
      const body = await req.json()
      const { phone } = body

      const { data, error: updateError } = await supabaseAdmin
        .from('users')
        .update({ phone, phone_verified: false })
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) {
        return error(updateError.message)
      }

      return json({ user: data, verification_sent: true })
    }

    // POST /auth/me/verify-phone - Verify SMS code
    if (method === 'POST' && path === '/me/verify-phone') {
      const body = await req.json()
      const { code } = body

      // TODO: Verify code against stored verification
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ phone_verified: true })
        .eq('id', user.id)

      if (updateError) {
        return error(updateError.message)
      }

      return json({ verified: true })
    }

    // PATCH /auth/me/notifications - Update notification preferences
    if (method === 'PATCH' && path === '/me/notifications') {
      const body = await req.json()
      const { email, sms, push } = body

      const updates: Record<string, boolean> = {}
      if (typeof email === 'boolean') updates.notification_email = email
      if (typeof sms === 'boolean') updates.notification_sms = sms
      if (typeof push === 'boolean') updates.notification_push = push

      const { data, error: updateError } = await supabaseAdmin
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) {
        return error(updateError.message)
      }

      return json({ user: data })
    }

    // GET /auth/me/payments - Payment history
    if (method === 'GET' && path === '/me/payments') {
      const { data: payments, error: paymentsError } = await supabaseAdmin
        .from('payments')
        .select(`
          id,
          amount,
          currency,
          status,
          created_at,
          leagues (
            id,
            name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (paymentsError) {
        return error(paymentsError.message)
      }

      return json({ payments })
    }

    return error('Not found', 404)
  } catch (err) {
    console.error('Auth function error:', err)
    return error('Internal server error', 500)
  }
})
