import { NextRequest } from 'next/server'
import { POST } from '../route'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { Stripe } from 'stripe'

// Mock the dependencies
jest.mock('@supabase/auth-helpers-nextjs')
jest.mock('next/headers')
jest.mock('@/lib/stripe')

describe('POST /api/create-payment-intent', () => {
  let mockRequest: NextRequest
  let mockSupabaseClient: any
  let mockStripe: jest.Mocked<Stripe>

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Mock Supabase client
    mockSupabaseClient = {
      auth: {
        getUser: jest.fn(),
      },
    }
    ;(createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabaseClient)

    // Mock cookies
    ;(cookies as jest.Mock).mockReturnValue({})

    // Mock Stripe
    mockStripe = {
      paymentIntents: {
        create: jest.fn(),
      },
    } as unknown as jest.Mocked<Stripe>
    ;(stripe as jest.Mock).mockReturnValue(mockStripe)

    // Create mock request
    mockRequest = new NextRequest('http://localhost:3000/api/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({
        amount: 1000,
        currency: 'usd',
        paymentType: 'escrow',
        gigId: 'test-gig-id',
      }),
    })
  })

  it('should create a payment intent successfully', async () => {
    // Mock authenticated user
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
    })

    // Mock successful payment intent creation
    mockStripe.paymentIntents.create.mockResolvedValue({
      client_secret: 'test-client-secret',
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('clientSecret', 'test-client-secret')
    expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
      amount: 1000,
      currency: 'usd',
      metadata: {
        userId: 'test-user-id',
        gigId: 'test-gig-id',
        paymentType: 'escrow',
      },
    })
  })

  it('should return 401 for unauthenticated users', async () => {
    // Mock unauthenticated user
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toHaveProperty('error', 'Unauthorized')
    expect(mockStripe.paymentIntents.create).not.toHaveBeenCalled()
  })

  it('should return 400 for missing required fields', async () => {
    // Mock authenticated user
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
    })

    // Create request with missing fields
    const invalidRequest = new NextRequest('http://localhost:3000/api/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({
        amount: 1000,
        // Missing currency and paymentType
      }),
    })

    const response = await POST(invalidRequest)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty('error')
    expect(mockStripe.paymentIntents.create).not.toHaveBeenCalled()
  })

  it('should handle Stripe errors', async () => {
    // Mock authenticated user
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
    })

    // Mock Stripe error
    mockStripe.paymentIntents.create.mockRejectedValue(new Error('Stripe error'))

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toHaveProperty('error', 'Error creating payment intent')
  })
}) 