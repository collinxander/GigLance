import { useSubscription } from '@/hooks/useSubscription'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Download, Receipt } from 'lucide-react'
import { format } from 'date-fns'

interface BillingRecord {
  id: string
  date: string
  amount: number
  status: 'succeeded' | 'failed' | 'pending'
  invoiceUrl?: string
}

export function SubscriptionBilling() {
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
          <p>Error loading billing history</p>
        </div>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">No Billing History</h3>
          <p className="text-sm text-gray-500">
            Subscribe to start tracking your billing history.
          </p>
        </div>
      </Card>
    )
  }

  // This should come from your database
  const billingHistory: BillingRecord[] = [
    {
      id: '1',
      date: '2024-03-20',
      amount: 9.99,
      status: 'succeeded',
      invoiceUrl: 'https://example.com/invoice/1',
    },
    {
      id: '2',
      date: '2024-02-20',
      amount: 9.99,
      status: 'succeeded',
      invoiceUrl: 'https://example.com/invoice/2',
    },
    {
      id: '3',
      date: '2024-01-20',
      amount: 9.99,
      status: 'succeeded',
      invoiceUrl: 'https://example.com/invoice/3',
    },
  ]

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Billing History</h3>
          <p className="text-sm text-gray-500">
            View and download your past invoices
          </p>
        </div>

        <div className="space-y-4">
          {billingHistory.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between py-4 border-b last:border-0"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {format(new Date(record.date), 'MMMM d, yyyy')}
                </p>
                <p className="text-sm text-gray-500">
                  ${record.amount.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <span
                  className={`text-sm ${
                    record.status === 'succeeded'
                      ? 'text-green-600'
                      : record.status === 'failed'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  }`}
                >
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </span>

                {record.invoiceUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      window.open(record.invoiceUrl, '_blank')
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = '/account'
            }}
          >
            <Receipt className="h-4 w-4 mr-2" />
            Manage Billing
          </Button>
        </div>
      </div>
    </Card>
  )
} 