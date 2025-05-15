import { useSubscription } from '@/hooks/useSubscription'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, CreditCard, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

export function SubscriptionStatus() {
  const { subscription, loading, error, isSubscribed, isPastDue, isCanceled } = useSubscription()

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
          <p>Error loading subscription status</p>
        </div>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">No Active Subscription</h3>
          <p className="text-gray-500">
            Subscribe to unlock premium features and grow your business.
          </p>
          <Button asChild>
            <a href="/pricing">View Plans</a>
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">{subscription.plan.name}</h3>
            <p className="text-sm text-gray-500">{subscription.plan.description}</p>
          </div>
          <Badge
            variant={
              isSubscribed
                ? 'success'
                : isPastDue
                ? 'destructive'
                : isCanceled
                ? 'secondary'
                : 'default'
            }
          >
            {isSubscribed
              ? 'Active'
              : isPastDue
              ? 'Past Due'
              : isCanceled
              ? 'Canceled'
              : subscription.status}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>
              {isCanceled
                ? 'Access until'
                : 'Next billing date'}:{' '}
              {format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')}
            </span>
          </div>

          {isPastDue && (
            <div className="flex items-center space-x-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>Your subscription is past due. Please update your payment method.</span>
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          {isSubscribed && !isCanceled && (
            <Button
              variant="outline"
              onClick={() => {
                // Handle subscription cancellation
                window.location.href = `/api/cancel-subscription?subscriptionId=${subscription.id}`
              }}
            >
              Cancel Subscription
            </Button>
          )}

          {isPastDue && (
            <Button
              onClick={() => {
                // Handle payment method update
                window.location.href = `/api/update-payment-method?subscriptionId=${subscription.id}`
              }}
            >
              Update Payment Method
            </Button>
          )}

          {!isSubscribed && !isCanceled && (
            <Button
              onClick={() => {
                // Handle subscription reactivation
                window.location.href = `/api/reactivate-subscription?subscriptionId=${subscription.id}`
              }}
            >
              Reactivate Subscription
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
} 