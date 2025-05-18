// Environment variables with fallbacks
export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gzdezyfnxtekbnuokgpg.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZGV6eWZueHRla2JudW9rZ3BnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNzc4MDksImV4cCI6MjA2Mjg1MzgwOX0.sGAG7GVYj6B-kqOjCdz72IXaS5zM_N5ecTfTdu7ASp8',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'missing-service-role-key',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'missing-stripe-secret-key',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'missing-stripe-publishable-key',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_missing'
}; 