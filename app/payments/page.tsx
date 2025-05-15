"use client"

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import PaymentHistory from '@/components/PaymentHistory'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function PaymentsPage() {
  const supabase = createClientComponentClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        setUserId(user?.id || null)
      } catch (err: any) {
        setError(err.message)
      }
    }

    getUser()
  }, [])

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Please sign in to view your payments</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="history" className="space-y-6">
        <TabsList>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <PaymentHistory userId={userId} />
        </TabsContent>

        <TabsContent value="receipts">
          <Card>
            <CardHeader>
              <CardTitle>Payment Receipts</CardTitle>
              <CardDescription>
                Download receipts for your completed payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentHistory userId={userId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 