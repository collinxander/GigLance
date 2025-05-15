import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

export type Plan = {
  id: string;
  name: string;
  description: string;
  price_id: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  metadata: Record<string, string>;
};

export function useStripe() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const getPlans = async (): Promise<Plan[]> => {
    try {
      setLoading(true);
      const response = await fetch('/api/stripe/plans');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch plans');
      }
      
      return data.plans;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch subscription plans',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (
    priceId: string,
    userId: string,
    planType: string,
    successUrl?: string,
    cancelUrl?: string
  ) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId,
          planType,
          successUrl,
          cancelUrl,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start checkout process',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createPortalSession = async (userId: string, returnUrl?: string) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, returnUrl }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session');
      }
      
      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to access billing portal',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getPlans,
    createCheckoutSession,
    createPortalSession,
  };
} 