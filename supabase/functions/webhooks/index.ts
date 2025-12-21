import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.0.0?target=deno"
import { handleCors, corsHeaders } from "../_shared/cors.ts"
import { supabaseAdmin } from "../_shared/supabase.ts"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  const url = new URL(req.url)
  const path = url.pathname.replace('/webhooks', '')

  try {
    // POST /webhooks/stripe - Handle Stripe events
    if (req.method === 'POST' && path === '/stripe') {
      const body = await req.text()
      const sig = req.headers.get('stripe-signature')!

      let event: Stripe.Event

      try {
        event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message)
        return new Response(`Webhook Error: ${err.message}`, {
          status: 400,
          headers: corsHeaders
        })
      }

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session

          if (session.metadata?.type === 'league_donation') {
            const { league_id, user_id } = session.metadata

            const { data: existing } = await supabaseAdmin
              .from('league_members')
              .select('id')
              .eq('league_id', league_id)
              .eq('user_id', user_id)
              .single()

            if (!existing) {
              await supabaseAdmin.from('league_members').insert({
                league_id,
                user_id,
              })
            }

            await supabaseAdmin.from('payments').insert({
              user_id,
              league_id,
              amount: (session.amount_total || 0) / 100,
              currency: session.currency || 'usd',
              stripe_session_id: session.id,
              stripe_payment_intent_id: session.payment_intent as string,
              status: 'completed',
            })

            console.log(`User ${user_id} joined league ${league_id} via payment`)
          }
          break
        }

        case 'checkout.session.expired': {
          const session = event.data.object as Stripe.Checkout.Session
          console.log(`Checkout session expired: ${session.id}`)
          break
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent
          console.log(`Payment failed: ${paymentIntent.id}`)
          break
        }

        case 'charge.refunded': {
          const charge = event.data.object as Stripe.Charge
          console.log(`Charge refunded: ${charge.id}`)
          break
        }

        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // POST /webhooks/sms - Handle Twilio inbound SMS
    if (req.method === 'POST' && path === '/sms') {
      // Twilio sends form-urlencoded data
      const formData = await req.formData()
      const from = formData.get('From') as string
      const text = formData.get('Body') as string

      if (!from || !text) {
        return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/xml' },
        })
      }

      const phone = from.replace(/\D/g, '')

      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('phone', phone)
        .single()

      const rawMessage = text.trim().toUpperCase()
      const parts = rawMessage.split(/\s+/)
      const command = parts[0]

      let response = ''
      const parsedData: any = { command, args: parts.slice(1) }

      switch (command) {
        case 'PICK': {
          if (!user) {
            response = 'Phone not registered. Visit rgfl.app to link your phone.'
            break
          }

          const castawayName = parts.slice(1).join(' ')
          if (!castawayName) {
            response = 'Usage: PICK [castaway name]'
            break
          }

          const { data: castaway } = await supabaseAdmin
            .from('castaways')
            .select('id, name')
            .ilike('name', `%${castawayName}%`)
            .eq('status', 'active')
            .single()

          if (!castaway) {
            response = `Castaway "${castawayName}" not found or eliminated.`
            break
          }

          parsedData.castaway = castaway

          const { data: memberships } = await supabaseAdmin
            .from('league_members')
            .select('league_id')
            .eq('user_id', user.id)

          if (!memberships || memberships.length === 0) {
            response = 'You are not in any leagues.'
            break
          }

          const { data: episode } = await supabaseAdmin
            .from('episodes')
            .select('id, number, picks_lock_at')
            .gte('picks_lock_at', new Date().toISOString())
            .order('picks_lock_at', { ascending: true })
            .limit(1)
            .single()

          if (!episode) {
            response = 'No episode currently accepting picks.'
            break
          }

          let pickCount = 0
          for (const membership of memberships) {
            const { data: roster } = await supabaseAdmin
              .from('rosters')
              .select('id')
              .eq('league_id', membership.league_id)
              .eq('user_id', user.id)
              .eq('castaway_id', castaway.id)
              .is('dropped_at', null)
              .single()

            if (roster) {
              await supabaseAdmin
                .from('weekly_picks')
                .upsert({
                  league_id: membership.league_id,
                  user_id: user.id,
                  episode_id: episode.id,
                  castaway_id: castaway.id,
                  status: 'pending',
                  picked_at: new Date().toISOString(),
                }, {
                  onConflict: 'league_id,user_id,episode_id',
                })
              pickCount++
            }
          }

          response = `Picked ${castaway.name} for Episode ${episode.number} in ${pickCount} league(s).`
          break
        }

        case 'STATUS': {
          if (!user) {
            response = 'Phone not registered. Visit rgfl.app to link your phone.'
            break
          }

          const { data: picks } = await supabaseAdmin
            .from('weekly_picks')
            .select('castaways(name), leagues(name)')
            .eq('user_id', user.id)
            .order('picked_at', { ascending: false })
            .limit(5)

          if (!picks || picks.length === 0) {
            response = 'No recent picks found.'
          } else {
            response = 'Recent picks:\n' + picks.map((p: any) =>
              `${p.castaways?.name} - ${p.leagues?.name}`
            ).join('\n')
          }
          break
        }

        case 'TEAM': {
          if (!user) {
            response = 'Phone not registered. Visit rgfl.app to link your phone.'
            break
          }

          const { data: rosters } = await supabaseAdmin
            .from('rosters')
            .select('castaways(name, status), leagues(name)')
            .eq('user_id', user.id)
            .is('dropped_at', null)

          if (!rosters || rosters.length === 0) {
            response = 'No castaways on roster.'
          } else {
            response = 'Your team:\n' + rosters.map((r: any) =>
              `${r.castaways?.name} (${r.castaways?.status}) - ${r.leagues?.name}`
            ).join('\n')
          }
          break
        }

        case 'HELP':
          response = 'Commands:\nPICK [name] - Pick castaway\nSTATUS - View picks\nTEAM - View roster\nHELP - Show this'
          break

        default:
          response = 'Unknown command. Text HELP for options.'
      }

      await supabaseAdmin.from('sms_commands').insert({
        phone,
        user_id: user?.id || null,
        command,
        raw_message: text,
        parsed_data: parsedData,
        response_sent: response,
      })

      // Respond with TwiML to send SMS reply
      const escapeXml = (str: string) => str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')

      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(response)}</Message>
</Response>`

      return new Response(twiml, {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/xml' },
      })
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
