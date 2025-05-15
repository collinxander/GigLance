export type SubscriptionFeature = {
  name: string
  description: string
  included: boolean
}

export type SubscriptionPlan = {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  description: string
  features: SubscriptionFeature[]
  stripePriceId: string
  popular?: boolean
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    interval: 'month',
    description: 'Perfect for freelancers just getting started',
    stripePriceId: 'price_basic_monthly', // Replace with your Stripe price ID
    features: [
      {
        name: 'Unlimited Gig Applications',
        description: 'Apply to as many gigs as you want',
        included: true,
      },
      {
        name: 'Post 3 Gigs',
        description: 'Post up to 3 gigs per month',
        included: true,
      },
      {
        name: 'Basic Profile',
        description: 'Standard profile with basic customization',
        included: true,
      },
      {
        name: 'Priority Support',
        description: 'Email support within 48 hours',
        included: false,
      },
      {
        name: 'Advanced Analytics',
        description: 'Detailed performance metrics',
        included: false,
      },
      {
        name: 'Featured Listings',
        description: 'Get your gigs featured in search results',
        included: false,
      },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    interval: 'month',
    description: 'For serious freelancers who want to grow',
    stripePriceId: 'price_pro_monthly', // Replace with your Stripe price ID
    popular: true,
    features: [
      {
        name: 'Unlimited Gig Applications',
        description: 'Apply to as many gigs as you want',
        included: true,
      },
      {
        name: 'Unlimited Gig Posts',
        description: 'Post unlimited gigs',
        included: true,
      },
      {
        name: 'Enhanced Profile',
        description: 'Premium profile with advanced customization',
        included: true,
      },
      {
        name: 'Priority Support',
        description: 'Email support within 24 hours',
        included: true,
      },
      {
        name: 'Advanced Analytics',
        description: 'Detailed performance metrics',
        included: true,
      },
      {
        name: 'Featured Listings',
        description: 'Get your gigs featured in search results',
        included: true,
      },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49.99,
    interval: 'month',
    description: 'For agencies and large teams',
    stripePriceId: 'price_enterprise_monthly', // Replace with your Stripe price ID
    features: [
      {
        name: 'Unlimited Gig Applications',
        description: 'Apply to as many gigs as you want',
        included: true,
      },
      {
        name: 'Unlimited Gig Posts',
        description: 'Post unlimited gigs',
        included: true,
      },
      {
        name: 'Team Management',
        description: 'Manage multiple team members',
        included: true,
      },
      {
        name: 'Priority Support',
        description: '24/7 priority support with dedicated account manager',
        included: true,
      },
      {
        name: 'Advanced Analytics',
        description: 'Detailed performance metrics and team insights',
        included: true,
      },
      {
        name: 'Featured Listings',
        description: 'Premium placement in search results',
        included: true,
      },
      {
        name: 'API Access',
        description: 'Access to our API for custom integrations',
        included: true,
      },
      {
        name: 'Custom Branding',
        description: 'White-label solutions for your team',
        included: true,
      },
    ],
  },
] 