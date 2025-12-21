import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.0.0?target=deno"
import { handleCors } from "../_shared/cors.ts"
import { supabaseAdmin, getUser } from "../_shared/supabase.ts"
import { json, error, unauthorized, forbidden, notFound } from "../_shared/response.ts"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

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
  const path = url.pathname.replace('/payments', '')
  const method = req.method

  const user = await getUser(req)
  if (!user) {
    return unauthorized('Authentication required')
  }

  if (!await requireAdmin(user.id)) {
    return forbidden('Admin access required')
  }

  try {
    // GET /payments - Get all payments (admin)
    if (method === 'GET' && path === '') {
      const leagueId = url.searchParams.get('league_id')
      const status = url.searchParams.get('status')
      const limit = parseInt(url.searchParams.get('limit') || '50')
      const offset = parseInt(url.searchParams.get('offset') || '0')

      let query = supabaseAdmin
        .from('payments')
        .select(`
          id,
          user_id,
          league_id,
          amount,
          currency,
          status,
          created_at,
          refunded_at,
          stripe_session_id,
          stripe_payment_intent_id,
          stripe_refund_id,
          users (
            id,
            email,
            display_name
          ),
          leagues (
            id,
            name
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (leagueId) {
        query = query.eq('league_id', leagueId)
      }

      if (status) {
        query = query.eq('status', status)
      }

      const { data: payments, error: queryError, count } = await query

      if (queryError) {
        return error(queryError.message)
      }

      // Calculate totals
      const { data: totals } = await supabaseAdmin
        .from('payments')
        .select('amount, status')

      const stats = {
        total_payments: totals?.length || 0,
        total_amount: totals?.filter((p: any) => p.status === 'completed').reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0,
        total_refunded: totals?.filter((p: any) => p.status === 'refunded').reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0,
        pending_count: totals?.filter((p: any) => p.status === 'pending').length || 0,
      }

      return json({
        payments,
        total: count,
        stats,
      })
    }

    // POST /payments/:id/refund - Issue refund
    const refundMatch = path.match(/^\/([^\/]+)\/refund$/)
    if (method === 'POST' && refundMatch) {
      const paymentId = refundMatch[1]
      const body = await req.json()
      const { reason } = body

      // Get payment
      const { data: payment, error: paymentError } = await supabaseAdmin
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single()

      if (paymentError || !payment) {
        return notFound('Payment not found')
      }

      if (payment.status === 'refunded') {
        return error('Payment already refunded')
      }

      if (payment.status !== 'completed') {
        return error('Can only refund completed payments')
      }

      if (!payment.stripe_payment_intent_id) {
        return error('No Stripe payment intent found')
      }

      // Create Stripe refund
      let stripeRefund: Stripe.Refund
      try {
        stripeRefund = await stripe.refunds.create({
          payment_intent: payment.stripe_payment_intent_id,
          reason: 'requested_by_customer',
          metadata: {
            admin_user_id: user.id,
            reason: reason || 'Admin requested refund',
          },
        })
      } catch (stripeError: any) {
        console.error('Stripe refund error:', stripeError)
        return error(`Stripe refund failed: ${stripeError.message}`)
      }

      // Update payment record
      const { data: updatedPayment, error: updateError } = await supabaseAdmin
        .from('payments')
        .update({
          status: 'refunded',
          stripe_refund_id: stripeRefund.id,
          refunded_at: new Date().toISOString(),
        })
        .eq('id', paymentId)
        .select()
        .single()

      if (updateError) {
        return error(updateError.message)
      }

      // Remove user from league if they were added via payment
      await supabaseAdmin
        .from('league_members')
        .delete()
        .eq('league_id', payment.league_id)
        .eq('user_id', payment.user_id)

      return json({
        payment: updatedPayment,
        refund_id: stripeRefund.id,
        message: 'Refund processed successfully',
      })
    }

    // GET /payments/:id - Get single payment details
    const paymentDetailMatch = path.match(/^\/([^\/]+)$/)
    if (method === 'GET' && paymentDetailMatch) {
      const paymentId = paymentDetailMatch[1]

      const { data: payment, error: paymentError } = await supabaseAdmin
        .from('payments')
        .select(`
          *,
          users (
            id,
            email,
            display_name
          ),
          leagues (
            id,
            name,
            commissioner_id
          )
        `)
        .eq('id', paymentId)
        .single()

      if (paymentError || !payment) {
        return notFound('Payment not found')
      }

      // Get Stripe payment details if available
      let stripeDetails = null
      if (payment.stripe_payment_intent_id) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripe_payment_intent_id)
          stripeDetails = {
            id: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            created: new Date(paymentIntent.created * 1000).toISOString(),
            payment_method: paymentIntent.payment_method,
          }
        } catch (err) {
          console.error('Failed to fetch Stripe details:', err)
        }
      }

      return json({
        payment,
        stripe_details: stripeDetails,
      })
    }

    return notFound('Route not found')
  } catch (err) {
    console.error('Payments function error:', err)
    return error('Internal server error', 500)
  }
})
