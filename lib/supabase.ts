import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'
import { env } from './env'

export const supabase = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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