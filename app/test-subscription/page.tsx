"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { PaymentForm } from '@/components/PaymentForm'
import type { Appearance } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function TestSubscriptionPage() {
  const [clientSecret, setClientSecret] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubscribe = async () => {
    try {
      setLoading(true)
      setError('')
      console.log('Starting subscription process...')

      const response = await fetch('/api/stripe/test-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'test-user', // Replace with actual user ID
        }),
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription')
      }

      if (data.error) {
        throw new Error(data.error)
      }

      if (!data.clientSecret) {
        throw new Error('No client secret received')
      }

      setClientSecret(data.clientSecret)
    } catch (error: any) {
      console.error('Subscription error:', error)
      setError(error.message || 'Failed to start subscription')
    } finally {
      setLoading(false)
    }
  }

  const appearance: Appearance = {
    theme: 'night',
    variables: {
      colorPrimary: '#8B5CF6',
      colorBackground: '#1F2937',
      colorText: '#F9FAFB',
      colorDanger: '#EF4444',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">GigLance Pro</h2>
          <p className="mt-2 text-gray-400">
            Test subscription for $9.99/month
          </p>
        </div>

        <div className="mt-8 bg-white/5 rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Features</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Unlimited gig applications</li>
              <li>• Featured profile visibility</li>
              <li>• Priority support</li>
              <li>• Early access to new gigs</li>
            </ul>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          {!clientSecret ? (
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full bg-purple-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-purple-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Subscribe Now - $9.99/month'}
            </button>
          ) : (
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance,
              }}
            >
              <PaymentForm />
            </Elements>
          )}

          <div className="mt-4 text-sm text-gray-400">
            <p>Test card number: 4242 4242 4242 4242</p>
            <p>Any future date, any CVC, any ZIP code</p>
          </div>
        </div>
      </div>
    </div>
  )
} 