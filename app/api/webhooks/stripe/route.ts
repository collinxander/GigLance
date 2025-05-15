import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )

    const supabase = createRouteHandlerClient({ cookies })

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const customerId = subscription.customer as string
        const userId = subscription.metadata.userId

        // Update subscription status in database
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            plan_id: subscription.metadata.planId,
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            cancel_at_period_end: (subscription as any).cancel_at_period_end,
          })

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const userId = subscription.metadata.userId

        // Update subscription status in database
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            cancel_at_period_end: true,
          })
          .eq('user_id', userId)

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        const customerId = invoice.customer as string

        // Get customer details
        const { data: customer } = await supabase
          .from('customers')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (customer) {
          // Record successful payment
          await supabase
            .from('payments')
            .insert({
              user_id: customer.user_id,
              amount: invoice.amount_paid,
              currency: invoice.currency,
              status: 'succeeded',
              stripe_invoice_id: invoice.id,
            })
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const customerId = invoice.customer as string

        // Get customer details
        const { data: customer } = await supabase
          .from('customers')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (customer) {
          // Record failed payment
          await supabase
            .from('payments')
            .insert({
              user_id: customer.user_id,
              amount: invoice.amount_due,
              currency: invoice.currency,
              status: 'failed',
              stripe_invoice_id: invoice.id,
            })

          // Update subscription status
          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
            })
            .eq('user_id', customer.user_id)
        }

        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 400 }
    )
  }
} 