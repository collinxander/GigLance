import { useSubscription } from '@/hooks/useSubscription'
import { Card } from '@/components/ui/card'
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'

interface Limit {
  name: string
  value: number | string
  exceeded: boolean
}

export function SubscriptionLimits() {
  const { subscription, loading, error } = useSubscription()

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <p>Error loading subscription limits</p>
        </div>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">No Active Subscription</h3>
          <p className="text-sm text-gray-500">
            Subscribe to access premium features and higher limits.
          </p>
        </div>
      </Card>
    )
  }

  const limits: Limit[] = [
    {
      name: 'Gig Posts',
      value: subscription.plan.id === 'pro' || subscription.plan.id === 'enterprise' ? 'Unlimited' : '3 per month',
      exceeded: false,
    },
    {
      name: 'Gig Applications',
      value: 'Unlimited',
      exceeded: false,
    },
    {
      name: 'Team Members',
      value: subscription.plan.id === 'enterprise' ? '10' : '1',
      exceeded: false,
    },
    {
      name: 'API Requests',
      value: subscription.plan.id === 'enterprise' ? '10,000 per day' : 'Not available',
      exceeded: false,
    },
    {
      name: 'Priority Support',
      value: subscription.plan.id === 'pro' || subscription.plan.id === 'enterprise' ? 'Available' : 'Not available',
      exceeded: false,
    },
  ]

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Subscription Limits</h3>
          <p className="text-sm text-gray-500">
            Your current plan limits and restrictions
          </p>
        </div>

        <div className="space-y-4">
          {limits.map((limit) => (
            <div
              key={limit.name}
              className="flex items-center justify-between py-4 border-b last:border-0"
            >
              <div className="flex items-center space-x-3">
                {limit.exceeded ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                <div>
                  <p className="text-sm font-medium">{limit.name}</p>
                  <p className="text-sm text-gray-500">{limit.value}</p>
                </div>
              </div>

              {limit.exceeded && (
                <span className="text-sm text-red-600">Limit exceeded</span>
              )}
            </div>
          ))}
        </div>

        {subscription.plan.id !== 'enterprise' && (
          <div className="pt-4">
            <p className="text-sm text-gray-500">
              Need higher limits?{' '}
              <a
                href="/pricing"
                className="text-primary hover:underline"
              >
                Upgrade your plan
              </a>
            </p>
          </div>
        )}
      </div>
    </Card>
  )
} 