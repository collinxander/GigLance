'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Loader2 } from 'lucide-react';
import { Plan, useStripe } from '@/lib/hooks/use-stripe';
import { useUser } from '@/lib/hooks/use-user';

export default function PricingPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [interval, setInterval] = useState<'month' | 'year'>('month');
  const { getPlans, createCheckoutSession, loading } = useStripe();
  const { user } = useUser();

  useEffect(() => {
    const fetchPlans = async () => {
      const fetchedPlans = await getPlans();
      setPlans(fetchedPlans);
    };

    fetchPlans();
  }, [getPlans]);

  const handleSubscribe = async (priceId: string, planType: string) => {
    if (!user) {
      // Redirect to sign in page
      window.location.href = '/login?redirect=/pricing';
      return;
    }

    await createCheckoutSession(
      priceId,
      user.id,
      planType
    );
  };

  // Filter plans based on interval
  const filteredPlans = plans.filter(plan => 
    plan.interval === interval
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      <Tabs defaultValue="month" className="w-full max-w-3xl" onValueChange={(v) => setInterval(v as 'month' | 'year')}>
        <div className="flex justify-center">
          <TabsList>
            <TabsTrigger value="month">Monthly</TabsTrigger>
            <TabsTrigger value="year">Yearly <span className="ml-1 text-xs text-green-500">(Save 20%)</span></TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="month" className="w-full mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {filteredPlans.map((plan) => (
                <PricingCard 
                  key={plan.id}
                  plan={plan}
                  onSubscribe={handleSubscribe}
                  loading={loading}
                  isPopular={plan.metadata.popular === 'true'}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="year" className="w-full mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {filteredPlans.map((plan) => (
                <PricingCard 
                  key={plan.id}
                  plan={plan}
                  onSubscribe={handleSubscribe}
                  loading={loading}
                  isPopular={plan.metadata.popular === 'true'}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface PricingCardProps {
  plan: Plan;
  isPopular?: boolean;
  loading: boolean;
  onSubscribe: (priceId: string, planType: string) => void;
}

function PricingCard({ plan, isPopular, loading, onSubscribe }: PricingCardProps) {
  const features = plan.features;
  
  return (
    <Card className={`flex flex-col ${isPopular ? 'border-primary shadow-lg' : ''}`}>
      <CardHeader>
        {isPopular && (
          <div className="text-xs font-bold text-primary uppercase mb-2">Most Popular</div>
        )}
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-6">
          <span className="text-3xl font-bold">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: plan.currency,
            }).format(plan.amount / 100)}
          </span>
          <span className="text-muted-foreground">/{plan.interval}</span>
        </div>
        
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-4 w-4 text-primary mr-2 mt-1" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          variant={isPopular ? "default" : "outline"}
          disabled={loading}
          onClick={() => onSubscribe(plan.price_id, plan.metadata.type)}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Subscribe
        </Button>
      </CardFooter>
    </Card>
  );
} 