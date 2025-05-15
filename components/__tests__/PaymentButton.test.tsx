import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PaymentButton } from '../PaymentButton'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

// Mock Stripe
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({
    elements: jest.fn(),
  })),
}))

// Mock fetch
global.fetch = jest.fn()

describe('PaymentButton', () => {
  const mockProps = {
    gigId: 'test-gig-id',
    amount: 1000,
    currency: 'usd',
    paymentType: 'escrow' as const,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('should render payment button', () => {
    render(<PaymentButton {...mockProps} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should show loading state when clicked', async () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ clientSecret: 'test-client-secret' }),
      })
    )

    render(<PaymentButton {...mockProps} />)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)
    
    expect(button).toBeDisabled()
    expect(screen.getByText(/Processing/i)).toBeInTheDocument()
  })

  it('should show payment form when client secret is received', async () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ clientSecret: 'test-client-secret' }),
      })
    )

    render(<PaymentButton {...mockProps} />)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByTestId('payment-form')).toBeInTheDocument()
    })
  })

  it('should show error message when payment fails', async () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Payment failed' }),
      })
    )

    render(<PaymentButton {...mockProps} />)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText(/Payment failed/i)).toBeInTheDocument()
    })
  })

  it('should handle network errors', async () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    )

    render(<PaymentButton {...mockProps} />)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText(/An error occurred/i)).toBeInTheDocument()
    })
  })
}) 