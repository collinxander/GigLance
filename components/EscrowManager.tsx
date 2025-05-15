"use client"

import { useState } from 'react'
import { usePayment } from '@/components/providers/PaymentProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'

interface EscrowManagerProps {
  paymentId: string
  isClient: boolean
  isCreative: boolean
}

export default function EscrowManager({ paymentId, isClient, isCreative }: EscrowManagerProps) {
  const { escrows, loading, error, releaseEscrow, disputeEscrow } = usePayment()
  const [disputeReason, setDisputeReason] = useState('')
  const [isDisputing, setIsDisputing] = useState(false)

  const escrow = escrows.find(e => e.payment_id === paymentId)

  const handleRelease = async () => {
    if (!escrow) return
    try {
      await releaseEscrow(escrow.id)
    } catch (err) {
      console.error('Failed to release escrow:', err)
    }
  }

  const handleDispute = async () => {
    if (!escrow || !disputeReason) return
    try {
      await disputeEscrow(escrow.id, disputeReason)
      setDisputeReason('')
      setIsDisputing(false)
    } catch (err) {
      console.error('Failed to dispute escrow:', err)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'funded':
        return <Badge className="bg-blue-500">Funded</Badge>
      case 'released':
        return <Badge className="bg-green-500">Released</Badge>
      case 'disputed':
        return <Badge className="bg-red-500">Disputed</Badge>
      case 'refunded':
        return <Badge className="bg-gray-500">Refunded</Badge>
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>
    }
  }

  if (!escrow) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Escrow Status</CardTitle>
            <CardDescription>
              {escrow.status === 'funded' && 'Funds are held in escrow'}
              {escrow.status === 'released' && 'Funds have been released'}
              {escrow.status === 'disputed' && 'This escrow is under dispute'}
              {escrow.status === 'refunded' && 'Funds have been refunded'}
              {escrow.status === 'pending' && 'Waiting for funds to be deposited'}
            </CardDescription>
          </div>
          {getStatusBadge(escrow.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {escrow.release_date && (
            <div className="text-sm">
              <span className="font-medium">Released on:</span>
              <span className="ml-2">
                {format(new Date(escrow.release_date), "PPP")}
              </span>
            </div>
          )}
          {escrow.dispute_reason && (
            <div className="text-sm">
              <span className="font-medium">Dispute reason:</span>
              <p className="mt-1 text-muted-foreground">{escrow.dispute_reason}</p>
            </div>
          )}
        </div>
      </CardContent>
      {escrow.status === 'funded' && (
        <CardFooter className="flex flex-col space-y-4">
          {isClient && (
            <Button
              className="w-full"
              onClick={handleRelease}
              disabled={loading}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Release Funds
            </Button>
          )}
          {isCreative && !isDisputing && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsDisputing(true)}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Dispute Escrow
            </Button>
          )}
          {isDisputing && (
            <div className="w-full space-y-4">
              <Textarea
                placeholder="Enter reason for dispute..."
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full"
              />
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDisputing(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleDispute}
                  disabled={!disputeReason || loading}
                >
                  Submit Dispute
                </Button>
              </div>
            </div>
          )}
        </CardFooter>
      )}
      {error && (
        <div className="p-4 border-t">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </Card>
  )
} 