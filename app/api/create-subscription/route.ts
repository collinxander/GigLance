import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const planId = searchParams.get('plan')
    const interval = searchParams.get('interval') as 'month' | 'year'

    if (!planId || !interval) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan' },
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

    // Create or get Stripe customer
    const { data: customer } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let stripeCustomerId = customer?.stripe_customer_id

    if (!stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      })
      stripeCustomerId = stripeCustomer.id

      await supabase
        .from('customers')
        .insert({
          user_id: user.id,
          stripe_customer_id: stripeCustomerId,
        })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.nextUrl.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/pricing`,
      metadata: {
        userId: user.id,
        planId: plan.id,
        interval,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Error creating subscription' },
      { status: 500 }
    )
  }
} 