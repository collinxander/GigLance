"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: string
  features: {
    profile_views: number | string
    portfolio_items: number | string
    search_visibility: string
    messaging: boolean
    analytics: boolean | string
    custom_domain: boolean
  }
}

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price')

      if (error) throw error
      setPlans(data || [])
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (planId: string) => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login?redirect=/subscription')
        return
      }

      // Here you would typically integrate with a payment processor
      // For now, we'll just create the subscription
      const { error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: planId,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })

      if (error) throw error

      router.push('/dashboard')
    } catch (error) {
      console.error('Error subscribing:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Choose Your Plan
        </h2>
        <p className="mt-4 text-lg text-gray-400">
          Select the perfect plan for your creative journey
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border ${
              selectedPlan === plan.id
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-white/10 bg-white/5'
            } p-8 shadow-lg transition-all duration-300 hover:scale-105`}
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
              <p className="mt-4 text-4xl font-bold text-white">
                ${plan.price}
                <span className="text-lg text-gray-400">/month</span>
              </p>
            </div>

            <ul className="mt-8 space-y-4">
              <li className="flex items-center text-gray-300">
                <Check className="h-5 w-5 text-purple-500 mr-2" />
                {typeof plan.features.profile_views === 'number'
                  ? `${plan.features.profile_views} profile views`
                  : 'Unlimited profile views'}
              </li>
              <li className="flex items-center text-gray-300">
                <Check className="h-5 w-5 text-purple-500 mr-2" />
                {typeof plan.features.portfolio_items === 'number'
                  ? `${plan.features.portfolio_items} portfolio items`
                  : 'Unlimited portfolio items'}
              </li>
              <li className="flex items-center text-gray-300">
                <Check className="h-5 w-5 text-purple-500 mr-2" />
                {plan.features.search_visibility} search visibility
              </li>
              {plan.features.messaging && (
                <li className="flex items-center text-gray-300">
                  <Check className="h-5 w-5 text-purple-500 mr-2" />
                  Direct messaging
                </li>
              )}
              {plan.features.analytics && (
                <li className="flex items-center text-gray-300">
                  <Check className="h-5 w-5 text-purple-500 mr-2" />
                  {plan.features.analytics === 'advanced' ? 'Advanced' : 'Basic'} analytics
                </li>
              )}
              {plan.features.custom_domain && (
                <li className="flex items-center text-gray-300">
                  <Check className="h-5 w-5 text-purple-500 mr-2" />
                  Custom portfolio domain
                </li>
              )}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading}
              className={`mt-8 w-full rounded-lg px-4 py-2 text-center font-semibold ${
                selectedPlan === plan.id
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-white/10 text-white hover:bg-white/20'
              } transition-colors duration-300`}
            >
              {loading ? 'Processing...' : 'Subscribe Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
} 