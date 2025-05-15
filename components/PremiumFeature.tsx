import { usePremiumAccess } from '@/hooks/usePremiumAccess'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Lock, AlertCircle } from 'lucide-react'

interface PremiumFeatureProps {
  children: React.ReactNode
  featureName: string
  description?: string
}

export function PremiumFeature({ children, featureName, description }: PremiumFeatureProps) {
  const { canAccessPremium, needsPaymentUpdate, isPremiumLoading } = usePremiumAccess()

  if (isPremiumLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    )
  }

  if (needsPaymentUpdate) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-medium">Payment Required</h3>
          </div>
          <p className="text-sm text-red-600">
            Your subscription is past due. Please update your payment method to continue using premium features.
          </p>
          <Button
            onClick={() => {
              window.location.href = '/account'
            }}
          >
            Update Payment Method
          </Button>
        </div>
      </Card>
    )
  }

  if (!canAccessPremium) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <Lock className="h-5 w-5" />
            <h3 className="font-medium">Premium Feature</h3>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              {description || `This ${featureName} is available with a premium subscription.`}
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = '/pricing'
            }}
          >
            Upgrade to Premium
          </Button>
        </div>
      </Card>
    )
  }

  return <>{children}</>
} 