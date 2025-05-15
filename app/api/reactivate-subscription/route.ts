import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const subscriptionId = searchParams.get('subscriptionId')

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Missing subscription ID' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single()

    if (subscriptionError || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Reactivate subscription in Stripe
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: false,
    })

    // Update subscription in database
    await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: false,
      })
      .eq('id', subscriptionId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reactivating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to reactivate subscription' },
      { status: 500 }
    )
  }
} 