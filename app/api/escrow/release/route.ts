import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { paymentId } = await req.json()

    // Get escrow details
    const { data: escrow } = await supabase
      .from('escrow')
      .select('*')
      .eq('payment_id', paymentId)
      .single()

    if (!escrow) {
      return NextResponse.json(
        { error: 'Escrow not found' },
        { status: 404 }
      )
    }

    // Check if user is authorized to release escrow
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (payment.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to release this escrow' },
        { status: 403 }
      )
    }

    // Release the payment to the creative
    const transfer = await stripe.transfers.create({
      amount: payment.amount,
      currency: payment.currency,
      destination: payment.creative_stripe_account_id,
      transfer_group: paymentId,
    })

    // Update escrow status
    await supabase
      .from('escrow')
      .update({ 
        status: 'released',
        released_at: new Date().toISOString()
      })
      .eq('payment_id', paymentId)

    // Update payment status
    await supabase
      .from('payments')
      .update({ 
        status: 'released',
        transfer_id: transfer.id
      })
      .eq('id', paymentId)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Escrow release error:', err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
} 