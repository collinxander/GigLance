"use client"

import { useState } from 'react'
import { usePayment } from '@/components/providers/PaymentProvider'
import { Button } from '@/components/ui/button'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { PaymentForm } from './PaymentForm'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentButtonProps {
  gigId: string
  amount: number
  currency?: string
  paymentType?: 'escrow' | 'milestone' | 'final'
}

export function PaymentButton({
  gigId,
  amount,
  currency = 'USD',
  paymentType = 'escrow'
}: PaymentButtonProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const { loading, error } = usePayment()

  const handlePayment = async () => {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gigId,
          amount,
          currency,
          paymentType,
        }),
      })

      const data = await response.json()
      setClientSecret(data.clientSecret)
    } catch (err) {
      console.error('Payment failed:', err)
    }
  }

  if (clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <PaymentForm />
      </Elements>
    )
  }

  return (
    <div>
      <Button
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? 'Processing...' : `Pay ${currency} ${amount}`}
      </Button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
} 