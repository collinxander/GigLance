"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

interface EscrowPaymentProps {
  gigId: string
  amount: number
  onSuccess?: () => void
}

interface CommissionSettings {
  percentage: number
  min_amount: number
  max_amount: number
}

export default function EscrowPayment({ gigId, amount, onSuccess }: EscrowPaymentProps) {
  const [loading, setLoading] = useState(false)
  const [commissionSettings, setCommissionSettings] = useState<CommissionSettings | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchCommissionSettings()
  }, [])

  const fetchCommissionSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('commission_settings')
        .select('*')
        .single()

      if (error) throw error
      setCommissionSettings(data)
    } catch (error) {
      console.error('Error fetching commission settings:', error)
    }
  }

  const calculateCommission = (amount: number) => {
    if (!commissionSettings) return 0
    const commission = amount * (commissionSettings.percentage / 100)
    return Math.min(Math.max(commission, commissionSettings.min_amount), commissionSettings.max_amount)
  }

  const handlePayment = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login?redirect=/gigs/' + gigId)
        return
      }

      const commissionAmount = calculateCommission(amount)

      // Here you would typically integrate with a payment processor
      // For now, we'll just create the escrow record
      const { error } = await supabase
        .from('escrow')
        .insert({
          gig_id: gigId,
          amount: amount,
          commission_amount: commissionAmount,
          status: 'pending',
        })

      if (error) throw error

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error creating escrow:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!commissionSettings) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  const commissionAmount = calculateCommission(amount)
  const totalAmount = amount + commissionAmount

  return (
    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="h-5 w-5 text-purple-500" />
        <h3 className="text-lg font-semibold text-white">Secure Payment</h3>
      </div>

      <div className="space-y-4">
        <div className="bg-black/50 rounded-lg p-4">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Gig Amount</span>
            <span>${amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Platform Fee ({commissionSettings.percentage}%)</span>
            <span>${commissionAmount.toFixed(2)}</span>
          </div>
          <div className="border-t border-white/10 my-2"></div>
          <div className="flex justify-between text-base font-semibold text-white">
            <span>Total</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-black/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">How it works</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Payment is held securely in escrow</li>
            <li>• Funds are released upon project completion</li>
            <li>• Platform fee is {commissionSettings.percentage}%</li>
            <li>• Dispute resolution available if needed</li>
          </ul>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-purple-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-purple-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : `Pay $${totalAmount.toFixed(2)}`}
        </button>
      </div>
    </div>
  )
} 