import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

// Fixed price for our test subscription
const TEST_PRICE_AMOUNT = 999; // $9.99 in cents

export async function POST(req: Request) {
  try {
    console.log('Received subscription request');
    
    const { userId } = await req.json();
    console.log('User ID:', userId);

    if (!userId) {
      console.error('Missing user ID');
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 400 }
      );
    }

    // Create a test customer if needed
    const customer = await stripe.customers.create({
      email: 'test@example.com',
      name: 'Test User',
    });
    console.log('Created customer:', customer.id);

    // Create a price for the subscription
    const price = await stripe.prices.create({
      unit_amount: 999, // $9.99
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      product_data: {
        name: 'GigLance Pro Monthly',
      },
    });
    console.log('Created price:', price.id);

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 999, // $9.99
      currency: 'usd',
      customer: customer.id,
      payment_method_types: ['card'],
      setup_future_usage: 'off_session',
    });
    console.log('Created payment intent:', paymentIntent.id);

    // Create a subscription with the new price
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      payment_behavior: 'default_incomplete',
      payment_settings: { 
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription'
      },
    });
    console.log('Created subscription:', subscription.id);

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      subscriptionId: subscription.id
    });
  } catch (error: any) {
    console.error('Error creating test subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
} 