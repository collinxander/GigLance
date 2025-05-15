'use client';

import { useState } from 'react';
import { useUser } from '@/lib/hooks/use-user';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Check, Loader2 } from 'lucide-react';

export default function SubscriptionPopup() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useUser();

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        window.location.href = '/login?redirect=/pricing';
        return;
      }

      // Use our dedicated test-subscription endpoint
      const response = await fetch('/api/stripe/test-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
          Upgrade to Pro
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Upgrade to GigLance Pro</DialogTitle>
          <DialogDescription>
            Get access to premium features and take your freelancing to the next level.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Pro Plan</h3>
              <div className="text-2xl font-bold">$9.99<span className="text-sm font-normal text-muted-foreground">/month</span></div>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Unlimited gig applications</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Featured profile visibility</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Priority support</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Early access to new gigs</span>
              </li>
            </ul>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>This is a test subscription. You can use the Stripe test card:</p>
              <p className="font-mono mt-1">4242 4242 4242 4242</p>
              <p className="mt-1">Any future date, any CVC, any ZIP code</p>
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row sm:justify-between">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubscribe} 
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Subscribe Now'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 