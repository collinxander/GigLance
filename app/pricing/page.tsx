'use client'

import { useState } from 'react'
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, X } from 'lucide-react'

export default function PricingPage() {
  const [interval, setInterval] = useState<'month' | 'year'>('month')

  const toggleInterval = () => {
    setInterval(prev => prev === 'month' ? 'year' : 'month')
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-lg text-gray-600 mb-8">
          Select the perfect plan for your freelancing needs
        </p>
        <div className="flex items-center justify-center gap-4">
          <span className={interval === 'month' ? 'font-semibold' : 'text-gray-500'}>
            Monthly
          </span>
          <button
            onClick={toggleInterval}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                interval === 'year' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={interval === 'year' ? 'font-semibold' : 'text-gray-500'}>
            Yearly
            <span className="ml-2 text-sm text-green-600">Save 20%</span>
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`p-6 ${
              plan.popular
                ? 'border-2 border-primary shadow-lg scale-105'
                : 'border border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="bg-primary text-primary-foreground text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                Most Popular
              </div>
            )}
            <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
            <p className="text-gray-600 mb-4">{plan.description}</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">
                ${interval === 'year' ? (plan.price * 0.8 * 12).toFixed(2) : plan.price}
              </span>
              <span className="text-gray-600">/{interval}</span>
            </div>
            <ul className="space-y-4 mb-8">
              {plan.features.map((feature) => (
                <li key={feature.name} className="flex items-start gap-3">
                  {feature.included ? (
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <X className="h-5 w-5 text-gray-300 flex-shrink-0" />
                  )}
                  <div>
                    <span className="font-medium">{feature.name}</span>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              variant={plan.popular ? 'default' : 'outline'}
              onClick={() => {
                // Handle subscription
                window.location.href = `/api/create-subscription?plan=${plan.id}&interval=${interval}`
              }}
            >
              Get Started
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
} 