import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get customer's Stripe ID
    const { data: customer } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (!customer?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No Stripe customer found' },
        { status: 404 }
      )
    }

    // Get invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: customer.stripe_customer_id,
      limit: 10,
      status: 'paid',
    })

    // Get payment intents for failed payments
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customer.stripe_customer_id,
      limit: 10,
    })

    const billingHistory = [
      ...invoices.data.map(invoice => ({
        id: invoice.id,
        date: new Date(invoice.created * 1000).toISOString(),
        amount: invoice.amount_paid / 100, // Convert from cents to dollars
        status: 'succeeded',
        invoiceUrl: invoice.invoice_pdf,
      })),
      ...paymentIntents.data
        .filter(intent => String(intent.status) === 'failed')
        .map(intent => ({
          id: intent.id,
          date: new Date(intent.created * 1000).toISOString(),
          amount: intent.amount / 100,
          status: 'failed',
          invoiceUrl: null,
        })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json(billingHistory)
  } catch (error) {
    console.error('Error fetching billing history:', error)
    return NextResponse.json(
      { error: 'Error fetching billing history' },
      { status: 500 }
    )
  }
} 