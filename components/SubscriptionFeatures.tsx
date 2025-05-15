import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans'
import { Card } from '@/components/ui/card'
import { Check, X } from 'lucide-react'

interface Feature {
  name: string
  included: boolean
}

interface PlanFeatures {
  [key: string]: Feature[]
}

const planFeatures: PlanFeatures = {
  basic: [
    { name: 'Unlimited Gig Applications', included: true },
    { name: 'Post 3 Gigs', included: true },
    { name: 'Basic Profile', included: true },
    { name: 'Email Support', included: true },
    { name: 'Unlimited Gig Posts', included: false },
    { name: 'Enhanced Profile', included: false },
    { name: 'Priority Support', included: false },
    { name: 'Team Management', included: false },
    { name: 'API Access', included: false },
  ],
  pro: [
    { name: 'Unlimited Gig Applications', included: true },
    { name: 'Post 3 Gigs', included: true },
    { name: 'Basic Profile', included: true },
    { name: 'Email Support', included: true },
    { name: 'Unlimited Gig Posts', included: true },
    { name: 'Enhanced Profile', included: true },
    { name: 'Priority Support', included: true },
    { name: 'Team Management', included: false },
    { name: 'API Access', included: false },
  ],
  enterprise: [
    { name: 'Unlimited Gig Applications', included: true },
    { name: 'Post 3 Gigs', included: true },
    { name: 'Basic Profile', included: true },
    { name: 'Email Support', included: true },
    { name: 'Unlimited Gig Posts', included: true },
    { name: 'Enhanced Profile', included: true },
    { name: 'Priority Support', included: true },
    { name: 'Team Management', included: true },
    { name: 'API Access', included: true },
  ],
}

export function SubscriptionFeatures() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {SUBSCRIPTION_PLANS.map((plan) => (
        <Card key={plan.id} className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">{plan.name}</h3>
              <p className="text-sm text-gray-500">{plan.description}</p>
            </div>

            <div className="space-y-2">
              {planFeatures[plan.id].map((feature) => (
                <div key={feature.name} className="flex items-center space-x-2">
                  {feature.included ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm">{feature.name}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <p className="text-2xl font-bold">${plan.price}/mo</p>
              <p className="text-sm text-gray-500">
                {plan.features.length} features included
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
} 