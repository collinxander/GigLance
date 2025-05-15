"use client"

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

interface PaymentReceiptProps {
  paymentId: string
}

export function PaymentReceipt({ paymentId }: PaymentReceiptProps) {
  const [receipt, setReceipt] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const response = await fetch(`/api/payments/${paymentId}/receipt`)
        const data = await response.json()
        setReceipt(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchReceipt()
  }, [paymentId])

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/payments/${paymentId}/receipt/download`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receipt-${paymentId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) return <div>Loading receipt...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!receipt) return <div>No receipt found</div>

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Payment Receipt</CardTitle>
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Receipt Number</p>
              <p>{receipt.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p>{format(new Date(receipt.created_at), 'PPP')}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Amount</p>
              <p>{receipt.currency} {receipt.amount}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="capitalize">{receipt.status}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <p>{receipt.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">From</p>
              <p>{receipt.client_name}</p>
              <p className="text-sm text-muted-foreground">{receipt.client_email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">To</p>
              <p>{receipt.creative_name}</p>
              <p className="text-sm text-muted-foreground">{receipt.creative_email}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 