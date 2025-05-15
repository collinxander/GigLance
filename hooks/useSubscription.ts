import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans'

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'unpaid' | 'incomplete' | 'incomplete_expired'

export interface Subscription {
  id: string
  status: SubscriptionStatus
  planId: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  plan: typeof SUBSCRIPTION_PLANS[0]
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setSubscription(null)
          setLoading(false)
          return
        }

        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (subscriptionError) {
          if (subscriptionError.code === 'PGRST116') {
            // No subscription found
            setSubscription(null)
          } else {
            throw subscriptionError
          }
        } else if (subscriptionData) {
          const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscriptionData.plan_id)
          if (!plan) {
            throw new Error('Invalid subscription plan')
          }

          setSubscription({
            id: subscriptionData.id,
            status: subscriptionData.status as SubscriptionStatus,
            planId: subscriptionData.plan_id,
            currentPeriodEnd: subscriptionData.current_period_end,
            cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
            plan,
          })
        }

        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch subscription'))
        setLoading(false)
      }
    }

    fetchSubscription()

    // Subscribe to subscription changes
    const subscription = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
        },
        () => {
          fetchSubscription()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const isSubscribed = subscription?.status === 'active' || subscription?.status === 'trialing'
  const isPastDue = subscription?.status === 'past_due'
  const isCanceled = subscription?.status === 'canceled' || subscription?.cancelAtPeriodEnd

  return {
    subscription,
    loading,
    error,
    isSubscribed,
    isPastDue,
    isCanceled,
  }
} 