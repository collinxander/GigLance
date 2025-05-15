import { test, expect } from '@playwright/test'

test.describe('Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || 'test@example.com')
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || 'testpassword')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should complete payment process', async ({ page }) => {
    // Navigate to a gig
    await page.goto('/gigs/test-gig-id')

    // Click payment button
    await page.click('button:has-text("Pay")')

    // Fill payment form
    await page.fill('input[name="cardNumber"]', '4242424242424242')
    await page.fill('input[name="expiry"]', '12/25')
    await page.fill('input[name="cvc"]', '123')
    await page.fill('input[name="name"]', 'Test User')

    // Submit payment
    await page.click('button:has-text("Pay Now")')

    // Wait for success page
    await page.waitForURL('/payment/success')

    // Verify success message
    await expect(page.locator('text=Payment Successful')).toBeVisible()
  })

  test('should handle payment failure', async ({ page }) => {
    // Navigate to a gig
    await page.goto('/gigs/test-gig-id')

    // Click payment button
    await page.click('button:has-text("Pay")')

    // Fill payment form with failing card
    await page.fill('input[name="cardNumber"]', '4000000000000002')
    await page.fill('input[name="expiry"]', '12/25')
    await page.fill('input[name="cvc"]', '123')
    await page.fill('input[name="name"]', 'Test User')

    // Submit payment
    await page.click('button:has-text("Pay Now")')

    // Verify error message
    await expect(page.locator('text=Your card was declined')).toBeVisible()
  })

  test('should handle escrow release', async ({ page }) => {
    // Navigate to payment history
    await page.goto('/payments')

    // Find an escrow payment
    const escrowPayment = page.locator('text=Escrow').first()
    await escrowPayment.click()

    // Click release button
    await page.click('button:has-text("Release Funds")')

    // Confirm release
    await page.click('button:has-text("Confirm")')

    // Verify success message
    await expect(page.locator('text=Funds released successfully')).toBeVisible()
  })
}) 