import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET() {
  try {
    // Test Stripe connection
    const balance = await stripe.balance.retrieve()
    
    return NextResponse.json({
      status: 'ok',
      message: 'Stripe is configured correctly',
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Set' : 'Missing',
      secretKey: process.env.STRIPE_SECRET_KEY ? 'Set' : 'Missing',
      balance: balance.available[0].amount,
      currency: balance.available[0].currency,
    })
  } catch (error: any) {
    console.error('Stripe configuration error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error.message,
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Set' : 'Missing',
        secretKey: process.env.STRIPE_SECRET_KEY ? 'Set' : 'Missing',
      },
      { status: 500 }
    )
  }
} 