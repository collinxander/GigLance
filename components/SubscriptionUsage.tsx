import { useSubscription } from '@/hooks/useSubscription'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AlertCircle } from 'lucide-react'

interface UsageMetric {
  name: string
  used: number
  limit: number
  unit: string
}

export function SubscriptionUsage() {
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
          <p>Error loading usage data</p>
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
            Subscribe to track your usage and access premium features.
          </p>
        </div>
      </Card>
    )
  }

  const usageMetrics: UsageMetric[] = [
    {
      name: 'Gig Posts',
      used: 2, // This should come from your database
      limit: subscription.plan.id === 'pro' || subscription.plan.id === 'enterprise' ? Infinity : 3,
      unit: 'posts',
    },
    {
      name: 'Gig Applications',
      used: 15, // This should come from your database
      limit: Infinity,
      unit: 'applications',
    },
    {
      name: 'Team Members',
      used: 1, // This should come from your database
      limit: subscription.plan.id === 'enterprise' ? 10 : 1,
      unit: 'members',
    },
  ]

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Usage</h3>
          <p className="text-sm text-gray-500">
            Track your subscription usage and limits
          </p>
        </div>

        <div className="space-y-4">
          {usageMetrics.map((metric) => (
            <div key={metric.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{metric.name}</span>
                <span className="text-sm text-gray-500">
                  {metric.used} / {metric.limit === Infinity ? '∞' : metric.limit} {metric.unit}
                </span>
              </div>
              <Progress
                value={
                  metric.limit === Infinity
                    ? 0
                    : (metric.used / metric.limit) * 100
                }
                className="h-2"
              />
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
} 