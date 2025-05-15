import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase environment variables. Please check your .env.local file.'
  )
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://gzdezyfnxtekbnuokgpg.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZGV6eWZueHRla2JudW9rZ3BnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNzc4MDksImV4cCI6MjA2Mjg1MzgwOX0.sGAG7GVYj6B-kqOjCdz72IXaS5zM_N5ecTfTdu7ASp8',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any) {
  console.error('Supabase error:', error)
  
  // Handle specific error cases
  if (error.message?.includes('Invalid login credentials')) {
    return {
      error: 'Invalid email or password',
      status: 401
    }
  }
  
  if (error.message?.includes('Email not confirmed')) {
    return {
      error: 'Please verify your email address',
      status: 401
    }
  }

  return {
    error: error.message || 'An unexpected error occurred',
    status: error.status || 500
  }
} 