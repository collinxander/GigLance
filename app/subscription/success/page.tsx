"use client"

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function SubscriptionSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const saveSubscriptionDetails = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        
        // This is where you'd typically save any additional subscription details from the checkout session
        // For now, we're just recording the success
        
        console.log('Subscription successful for user:', user.id)
      } catch (error) {
        console.error('Error saving subscription details:', error)
      }
    }
    
    if (searchParams.get('success')) {
      saveSubscriptionDetails()
    }
  }, [searchParams, supabase])

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <CardTitle>Subscription Active!</CardTitle>
          </div>
          <CardDescription>
            Thank you for subscribing to our premium plan. Your subscription is now active.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            You now have access to all premium features including unlimited gig applications, 
            priority support, and featured profile listing.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={() => router.push('/dashboard')}
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  )
} 