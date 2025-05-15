import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}))

// Mock Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
            },
          },
        },
      }),
    },
  }),
  createRouteHandlerClient: () => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'test-user-id',
            },
          },
        },
      }),
    },
  }),
}))

// Mock Stripe
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: () => Promise.resolve({
    elements: jest.fn(),
    confirmPayment: jest.fn(),
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        client_secret: 'test-client-secret',
      }),
    },
  }),
}))

// Mock Stripe React components
jest.mock('@stripe/react-stripe-js', () => ({
  useStripe: () => ({
    confirmPayment: jest.fn().mockResolvedValue({
      error: null,
      paymentIntent: { status: 'succeeded' },
    }),
  }),
  useElements: () => ({
    getElement: jest.fn(),
  }),
  PaymentElement: () => <div data-testid="payment-element">Payment Element</div>,
  Elements: ({ children }) => <>{children}</>,
}))

// Mock console.error to prevent test output pollution
console.error = jest.fn()

// Extend expect matchers
expect.extend({
  toBeInTheDocument(received) {
    const pass = received !== null
    return {
      pass,
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be in the document`,
    }
  },
  toBeDisabled(received) {
    const pass = received.disabled === true
    return {
      pass,
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be disabled`,
    }
  },
}) 