import { ReactNode } from 'react'
import { PaymentContext } from '../providers/PaymentProvider'

const mockPaymentContext = {
  isLoading: false,
  error: null,
  handlePayment: jest.fn(),
  handleEscrowRelease: jest.fn(),
  refreshPaymentHistory: jest.fn(),
}

export function TestWrapper({ children }: { children: ReactNode }) {
  return (
    <PaymentContext.Provider value={mockPaymentContext}>
      {children}
    </PaymentContext.Provider>
  )
} 