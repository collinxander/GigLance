import { Metadata } from 'next';
import PricingPlans from '@/components/pricing/pricing-plans';

export const metadata: Metadata = {
  title: 'GigLance - Pricing & Plans',
  description: 'Subscribe to a plan and get access to premium features.',
};

export default function PricingPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Pricing Plans</h1>
        <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
          Choose the right plan for your freelancing needs. Upgrade anytime to get more features and benefits.
        </p>
      </div>
      
      <PricingPlans />
    </div>
  );
} 