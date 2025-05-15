import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gzdezyfnxtekbnuokgpg.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'missing-key'

const supabase = createClient(
  supabaseUrl,
  supabaseKey
)

export async function sendSubscriptionEmail(
  userId: string,
  type: 'created' | 'canceled' | 'reactivated' | 'payment_failed',
  subscriptionDetails?: any
) {
  try {
    // Get user's email
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    if (!user?.email) {
      throw new Error('User email not found')
    }

    // Prepare email content based on type
    let subject = ''
    let content = ''

    switch (type) {
      case 'created':
        subject = 'Welcome to Your New Subscription!'
        content = `
          <h1>Welcome to ${subscriptionDetails.planName}!</h1>
          <p>Thank you for subscribing to our platform. Your subscription is now active.</p>
          <p>Plan: ${subscriptionDetails.planName}</p>
          <p>Next billing date: ${new Date(subscriptionDetails.currentPeriodEnd).toLocaleDateString()}</p>
        `
        break

      case 'canceled':
        subject = 'Subscription Cancellation Confirmation'
        content = `
          <h1>Subscription Cancellation Confirmed</h1>
          <p>Your subscription has been canceled and will end on ${new Date(subscriptionDetails.currentPeriodEnd).toLocaleDateString()}.</p>
          <p>You'll continue to have access to premium features until then.</p>
        `
        break

      case 'reactivated':
        subject = 'Subscription Reactivated'
        content = `
          <h1>Subscription Reactivated</h1>
          <p>Your subscription has been reactivated successfully.</p>
          <p>You'll continue to be billed on your regular schedule.</p>
        `
        break

      case 'payment_failed':
        subject = 'Payment Failed - Action Required'
        content = `
          <h1>Payment Failed</h1>
          <p>We were unable to process your latest payment.</p>
          <p>Please update your payment method to avoid service interruption.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/account">Update Payment Method</a>
        `
        break
    }

    // Send email using your preferred email service
    // This is an example using a hypothetical email service
    await fetch('https://api.email-service.com/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EMAIL_SERVICE_API_KEY}`,
      },
      body: JSON.stringify({
        to: user.email,
        subject,
        html: content,
      }),
    })

    // Log the email notification
    await supabase
      .from('email_notifications')
      .insert({
        user_id: userId,
        type,
        sent_at: new Date().toISOString(),
      })
  } catch (error) {
    console.error('Error sending subscription email:', error)
    // You might want to add this to your error tracking service
  }
} 