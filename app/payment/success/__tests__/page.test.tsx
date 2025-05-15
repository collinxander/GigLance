import { render, screen } from '@testing-library/react'
import PaymentSuccessPage from '../page'
import { useSearchParams } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}))

describe('PaymentSuccessPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should display success message and payment ID', () => {
    // Mock search params
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: (param: string) => {
        if (param === 'payment_intent') return 'test-payment-intent'
        return null
      },
    })

    render(<PaymentSuccessPage />)

    // Check for success message
    expect(screen.getByText(/Payment Successful!/i)).toBeInTheDocument()
    
    // Check for payment ID
    expect(screen.getByText(/Payment ID: test-payment-intent/i)).toBeInTheDocument()
    
    // Check for email confirmation message
    expect(screen.getByText(/A confirmation email has been sent to your email address./i)).toBeInTheDocument()
  })

  it('should handle missing payment intent', () => {
    // Mock search params with no payment intent
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: (param: string) => null,
    })

    render(<PaymentSuccessPage />)

    // Check for success message
    expect(screen.getByText(/Payment Successful!/i)).toBeInTheDocument()
    
    // Check that payment ID is not displayed
    expect(screen.queryByText(/Payment ID:/i)).not.toBeInTheDocument()
  })
}) 