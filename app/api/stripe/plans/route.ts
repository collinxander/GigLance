import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET() {
  try {
    // Fetch all active subscription products
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });

    // Format the products and prices for the client
    const plans = products.data
      .filter(product => product.metadata.type === 'subscription')
      .map(product => {
        const price = product.default_price as any;
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price_id: price.id,
          amount: price.unit_amount,
          currency: price.currency,
          interval: price.recurring?.interval,
          features: product.metadata.features ? JSON.parse(product.metadata.features) : [],
          metadata: product.metadata,
        };
      })
      .sort((a, b) => {
        // Sort by price (lowest first)
        return a.amount - b.amount;
      });

    return NextResponse.json({ plans });
  } catch (error: any) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: error.message || 'Error fetching subscription plans' },
      { status: 500 }
    );
  }
} 