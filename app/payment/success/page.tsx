"use client"

import { useEffect, Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { usePayment } from '@/components/providers/PaymentProvider'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Loader2 } from 'lucide-react'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const { getPaymentHistory } = usePayment()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const refreshPaymentHistory = async () => {
      try {
        setIsLoading(true)
        const paymentIntent = searchParams.get('payment_intent')
        
        if (!paymentIntent) {
          setError("No payment intent found")
          return
        }
        
        // First, get the user from auth
        const { data, error: userError } = await supabase.auth.getUser()
        
        if (userError || !data.user) {
          console.error("Error getting user:", userError)
          setError("Authentication error")
          return
        }
        
        // Only after confirming user exists, get payment history
        await getPaymentHistory(data.user.id)
        
      } catch (err) {
        console.error("Error in payment success:", err)
        setError("Failed to process payment confirmation")
      } finally {
        setIsLoading(false)
      }
    }
    
    refreshPaymentHistory()
  }, [searchParams, supabase, getPaymentHistory])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-red-500">Payment Processing Error</CardTitle>
          <CardDescription>
            There was an issue confirming your payment. Please contact support.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <CardTitle>Payment Successful!</CardTitle>
          </div>
          <CardDescription>
            Thank you for your payment. You will receive a confirmation email shortly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Payment ID: {searchParams.get('payment_intent')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
} 