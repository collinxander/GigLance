"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Verify the payment was successful (optional)
    const verifyPayment = async () => {
      try {
        if (!sessionId) {
          // No session ID, redirect to home
          setTimeout(() => router.push('/'), 5000)
          return
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error verifying payment:', error)
        setLoading(false)
      }
    }

    verifyPayment()
  }, [sessionId, router])

  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <Card className="border-green-200 shadow-md">
        <CardHeader className="text-center border-b pb-6">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-700">Payment Successful!</CardTitle>
          <CardDescription>Your subscription has been activated.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-4">Thank you for subscribing to GigLance.</p>
              <p className="text-muted-foreground text-sm">
                You now have access to premium features to help you succeed in your freelancing journey.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button asChild className="w-full">
            <Link href="/account">Go to your account</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container max-w-md mx-auto py-16 px-4">
        <Card className="border-green-200 shadow-md">
          <CardHeader className="text-center border-b pb-6">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
            <CardTitle className="text-2xl">Processing Payment</CardTitle>
            <CardDescription>Please wait while we verify your payment...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
} 