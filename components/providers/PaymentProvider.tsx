"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Payment {
  id: string
  gig_id: string
  client_id: string
  creative_id: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  payment_type: 'escrow' | 'milestone' | 'final'
  stripe_payment_id?: string
  stripe_transfer_id?: string
  created_at: string
  updated_at: string
}

interface Milestone {
  id: string
  gig_id: string
  title: string
  description?: string
  amount: number
  due_date?: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  payment_id?: string
  created_at: string
  updated_at: string
}

interface Escrow {
  id: string
  payment_id: string
  status: 'pending' | 'funded' | 'released' | 'refunded' | 'disputed'
  release_date?: string
  dispute_reason?: string
  created_at: string
  updated_at: string
}

interface PaymentContextType {
  payments: Payment[]
  milestones: Milestone[]
  escrows: Escrow[]
  loading: boolean
  error: string | null
  createPayment: (data: {
    gigId: string;
    amount: number;
    currency: string;
    paymentType: 'escrow' | 'milestone' | 'final';
  }) => Promise<void>
  createMilestone: (data: Partial<Milestone>) => Promise<void>
  releaseEscrow: (escrowId: string) => Promise<void>
  disputeEscrow: (escrowId: string, reason: string) => Promise<void>
  getPaymentHistory: (userId: string) => Promise<Payment[]>
  getMilestones: (gigId: string) => Promise<Milestone[]>
  getEscrow: (paymentId: string) => Promise<Escrow | null>
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient()
  const [payments, setPayments] = useState<Payment[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [escrows, setEscrows] = useState<Escrow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPayment = async (data: {
    gigId: string;
    amount: number;
    currency: string;
    paymentType: 'escrow' | 'milestone' | 'final';
  }) => {
    try {
      setLoading(true)
      
      // 1. Create a payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const { clientSecret } = await response.json()

      // 2. Initialize Stripe
      const stripe = await stripePromise
      if (!stripe) throw new Error('Stripe failed to initialize')

      // 3. Redirect to checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: clientSecret,
      })

      if (error) throw error

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Create a new milestone
  const createMilestone = async (data: Partial<Milestone>) => {
    try {
      setLoading(true)
      const { data: milestone, error } = await supabase
        .from('milestones')
        .insert([data])
        .select()
        .single()

      if (error) throw error
      setMilestones(prev => [...prev, milestone])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Release escrow funds
  const releaseEscrow = async (escrowId: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/release-escrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ escrowId }),
      })

      if (!response.ok) throw new Error('Failed to release escrow')

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Dispute escrow
  const disputeEscrow = async (escrowId: string, reason: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/dispute-escrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ escrowId, reason }),
      })

      if (!response.ok) throw new Error('Failed to dispute escrow')

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Get payment history
  const getPaymentHistory = async (userId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .or(`client_id.eq.${userId},creative_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPayments(data)
      return data
    } catch (err: any) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Get milestones for a gig
  const getMilestones = async (gigId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('gig_id', gigId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMilestones(data)
      return data
    } catch (err: any) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Get escrow for a payment
  const getEscrow = async (paymentId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('escrow')
        .select('*')
        .eq('payment_id', paymentId)
        .single()

      if (error) throw error
      return data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return (
    <PaymentContext.Provider
      value={{
        payments,
        milestones,
        escrows,
        loading,
        error,
        createPayment,
        createMilestone,
        releaseEscrow,
        disputeEscrow,
        getPaymentHistory,
        getMilestones,
        getEscrow,
      }}
    >
      {children}
    </PaymentContext.Provider>
  )
}

export function usePayment() {
  const context = useContext(PaymentContext)
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider')
  }
  return context
} 