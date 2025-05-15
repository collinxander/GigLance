import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PaymentForm } from '../PaymentForm'
import { useStripe, useElements } from '@stripe/react-stripe-js'

// Mock Stripe hooks
jest.mock('@stripe/react-stripe-js', () => ({
  useStripe: jest.fn(),
  useElements: jest.fn(),
  PaymentElement: () => <div data-testid="payment-element">Payment Element</div>,
}))

describe('PaymentForm', () => {
  const mockStripe = {
    confirmPayment: jest.fn(),
  }

  const mockElements = {
    getElement: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useStripe as jest.Mock).mockReturnValue(mockStripe)
    ;(useElements as jest.Mock).mockReturnValue(mockElements)
  })

  it('should render payment form', () => {
    render(<PaymentForm />)
    expect(screen.getByTestId('payment-element')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should handle successful payment submission', async () => {
    mockStripe.confirmPayment.mockResolvedValueOnce({
      error: null,
      paymentIntent: { status: 'succeeded' },
    })

    render(<PaymentForm />)
    const form = screen.getByRole('form')
    const submitButton = screen.getByRole('button')

    fireEvent.submit(form)

    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/Processing/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(mockStripe.confirmPayment).toHaveBeenCalled()
    })
  })

  it('should handle payment error', async () => {
    const errorMessage = 'Your card was declined'
    mockStripe.confirmPayment.mockResolvedValueOnce({
      error: { message: errorMessage },
      paymentIntent: null,
    })

    render(<PaymentForm />)
    const form = screen.getByRole('form')

    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('should handle missing Stripe instance', () => {
    ;(useStripe as jest.Mock).mockReturnValue(null)

    render(<PaymentForm />)
    const form = screen.getByRole('form')

    fireEvent.submit(form)

    expect(screen.getByText(/Unable to process payment/i)).toBeInTheDocument()
  })

  it('should handle missing Elements instance', () => {
    ;(useElements as jest.Mock).mockReturnValue(null)

    render(<PaymentForm />)
    const form = screen.getByRole('form')

    fireEvent.submit(form)

    expect(screen.getByText(/Unable to process payment/i)).toBeInTheDocument()
  })
}) 