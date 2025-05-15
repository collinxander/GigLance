import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans'
import { Stripe } from 'stripe'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session ID' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    })

    if (!session.subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string,
      {
        expand: ['customer', 'default_payment_method'],
      }
    ) as Stripe.Subscription

    // Find the plan details
    const plan = SUBSCRIPTION_PLANS.find(
      p => p.stripePriceId === subscription.items.data[0].price.id
    )

    return NextResponse.json({
      planName: plan?.name || 'Unknown Plan',
      status: subscription.status,
      currentPeriodStart: (subscription as any).current_period_start,
      currentPeriodEnd: (subscription as any).current_period_end,
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
      paymentMethod: subscription.default_payment_method
        ? {
            type: (subscription.default_payment_method as Stripe.PaymentMethod).type,
            last4: (subscription.default_payment_method as Stripe.PaymentMethod).card?.last4,
          }
        : null,
    })
  } catch (error) {
    console.error('Error fetching subscription details:', error)
    return NextResponse.json(
      { error: 'Error fetching subscription details' },
      { status: 500 }
    )
  }
} 