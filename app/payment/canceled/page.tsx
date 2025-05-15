'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';
import Link from 'next/link';

export default function PaymentCanceledPage() {
  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <Card className="border-gray-200 shadow-md">
        <CardHeader className="text-center border-b pb-6">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-gray-500" />
          </div>
          <CardTitle className="text-2xl">Payment Canceled</CardTitle>
          <CardDescription>Your subscription has not been activated.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="mb-4">You've canceled the payment process.</p>
            <p className="text-muted-foreground text-sm">
              No charges were made to your account. You can try again whenever you're ready.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button asChild className="w-full">
            <Link href="/pricing">Return to Pricing</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 