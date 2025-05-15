"use client"

import { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'

export function PaymentForm() {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
    })

    if (submitError) {
      setError(submitError.message ?? 'An error occurred')
    }

    setProcessing(false)
  }

  return (
    <form onSubmit={handleSubmit} role="form">
      <PaymentElement />
      {error && <div className="text-red-500 mt-2">{error}</div>}
      <Button
        type="submit"
        disabled={processing}
        className="w-full mt-4"
      >
        {processing ? 'Processing...' : 'Pay Now'}
      </Button>
    </form>
  )
} 