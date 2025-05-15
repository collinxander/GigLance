import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { headers } from 'next/headers';
import { NextResponse } from "next/server";
import { createClient } from '@/lib/supabase/server';

// Mark this route as dynamically rendered
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_missing'
    );
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`);
    return new NextResponse("Invalid signature", { status: 400 });
  }
  
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  // Get customer details from session
  const customerId = session.customer as string;
  const userId = session.metadata?.userId;
  
  if (!userId) {
    throw new Error('No userId found in session metadata');
  }
  
  const supabase = createClient();
  
  // Update user record with Stripe customer ID and payment status
  const { error } = await supabase
    .from('profiles')
    .update({
      stripe_customer_id: customerId,
      payment_status: 'paid'
    })
    .eq('id', userId);
  
  if (error) {
    throw new Error(`Error updating user payment status: ${error.message}`);
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const status = subscription.status;
  const priceId = subscription.items.data[0]?.price.id;
  
  const supabase = createClient();
  
  // Find user by customer ID and update subscription details
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  
  if (userError || !user) {
    throw new Error(`Error finding user with customer ID ${customerId}`);
  }
  
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: status,
      subscription_price_id: priceId,
      subscription_id: subscription.id
    })
    .eq('id', user.id);
  
  if (error) {
    throw new Error(`Error updating user subscription: ${error.message}`);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  const supabase = createClient();
  
  // Find user by customer ID and update subscription details
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  
  if (userError || !user) {
    throw new Error(`Error finding user with customer ID ${customerId}`);
  }
  
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'canceled',
      subscription_price_id: null,
      subscription_id: null
    })
    .eq('id', user.id);
  
  if (error) {
    throw new Error(`Error updating user subscription: ${error.message}`);
  }
} 