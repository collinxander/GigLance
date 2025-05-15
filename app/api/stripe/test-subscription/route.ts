import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

// Fixed price for our test subscription
const TEST_PRICE_AMOUNT = 999; // $9.99 in cents

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 400 }
      );
    }

    // Check if user already has a Stripe customer ID
    const supabase = createClient();
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, id')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json(
        { error: 'Error fetching user profile' },
        { status: 500 }
      );
    }

    let customerId = profile.stripe_customer_id;

    // If no customer ID exists, create a new customer
    if (!customerId) {
      const { data: userData } = await supabase
        .from('profiles')
        .select('full_name, id')
        .eq('id', userId)
        .single();

      const { data: authUser } = await supabase.auth.getUser();
      
      const customer = await stripe.customers.create({
        email: authUser.user?.email || 'unknown@example.com',
        name: userData?.full_name || 'GigLance User',
        metadata: {
          userId: userId
        }
      });
      
      customerId = customer.id;
      
      // Save the customer ID to the profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // First, check if a product and price for testing already exist
    let priceId;
    
    const existingProducts = await stripe.products.list({
      active: true,
      limit: 100
    });
    
    const testProduct = existingProducts.data.find(
      product => product.name === 'GigLance Pro (Test)'
    );
    
    if (testProduct) {
      // Use existing product
      const prices = await stripe.prices.list({
        product: testProduct.id,
        active: true
      });
      
      if (prices.data.length > 0) {
        priceId = prices.data[0].id;
      } else {
        // Create new price for existing product
        const price = await stripe.prices.create({
          product: testProduct.id,
          unit_amount: TEST_PRICE_AMOUNT,
          currency: 'usd',
          recurring: { interval: 'month' }
        });
        priceId = price.id;
      }
    } else {
      // Create new test product and price
      const product = await stripe.products.create({
        name: 'GigLance Pro (Test)',
        description: 'Test subscription for GigLance Pro features',
        metadata: {
          type: 'subscription',
          features: JSON.stringify([
            'Unlimited gig applications',
            'Featured profile visibility',
            'Priority support',
            'Early access to new gigs'
          ])
        }
      });
      
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: TEST_PRICE_AMOUNT,
        currency: 'usd',
        recurring: { interval: 'month' }
      });
      
      priceId = price.id;
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${headers().get('origin')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${headers().get('origin')}/payment/canceled`,
      metadata: {
        userId,
        planType: 'pro',
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Error creating checkout session' },
      { status: 500 }
    );
  }
} 