"use client"

import { useEffect } from 'react'
import { usePayment } from '@/components/providers/PaymentProvider'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Download, Receipt } from 'lucide-react'
import { format } from 'date-fns'

interface PaymentHistoryProps {
  userId: string
}

export default function PaymentHistory({ userId }: PaymentHistoryProps) {
  const { payments, loading, error, getPaymentHistory } = usePayment()

  useEffect(() => {
    getPaymentHistory(userId)
  }, [userId])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>
      case 'processing':
        return <Badge className="bg-blue-500">Processing</Badge>
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>
      case 'refunded':
        return <Badge className="bg-gray-500">Refunded</Badge>
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>
    }
  }

  const getPaymentTypeBadge = (type: string) => {
    switch (type) {
      case 'escrow':
        return <Badge variant="outline">Escrow</Badge>
      case 'milestone':
        return <Badge variant="outline">Milestone</Badge>
      case 'final':
        return <Badge variant="outline">Final Payment</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Payment History</h2>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Payments</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading payments...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="mt-2 text-muted-foreground">No payments found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {payments.map((payment) => (
                <Card key={payment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>Payment #{payment.id.slice(0, 8)}</CardTitle>
                        <CardDescription>
                          {format(new Date(payment.created_at), "PPP")}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getPaymentTypeBadge(payment.payment_type)}
                        {getStatusBadge(payment.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Amount:</span>
                        <span className="ml-2">
                          {payment.currency} {payment.amount.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Type:</span>
                        <span className="ml-2 capitalize">{payment.payment_type}</span>
                      </div>
                    </div>
                  </CardContent>
                  {payment.status === 'completed' && (
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Receipt
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {payments
            .filter(payment => payment.status === 'completed')
            .map((payment) => (
              <Card key={payment.id}>
                {/* Same card structure as above */}
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {payments
            .filter(payment => payment.status === 'pending' || payment.status === 'processing')
            .map((payment) => (
              <Card key={payment.id}>
                {/* Same card structure as above */}
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  )
} 