import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'
import { env } from './env'

if (!env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'giglance-auth-token',
      storage: {
        getItem: (key) => {
          try {
            const value = localStorage.getItem(key)
            return value ? JSON.parse(value) : null
          } catch (error) {
            console.error('Error reading from localStorage:', error)
            return null
          }
        },
        setItem: (key, value) => {
          try {
            localStorage.setItem(key, JSON.stringify(value))
          } catch (error) {
            console.error('Error writing to localStorage:', error)
          }
        },
        removeItem: (key) => {
          try {
            localStorage.removeItem(key)
          } catch (error) {
            console.error('Error removing from localStorage:', error)
          }
        },
      },
    },
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

  if (error.message?.includes('Password should be at least')) {
    return {
      error: 'Password should be at least 10 characters. Password should contain at least one character of each',
      status: 400
    }
  }

  if (error.message?.includes('Email rate limit exceeded')) {
    return {
      error: 'Too many attempts. Please try again later.',
      status: 429
    }
  }

  if (error.message?.includes('Network error')) {
    return {
      error: 'Network error. Please check your connection.',
      status: 503
    }
  }

  return {
    error: error.message || 'An unexpected error occurred',
    status: error.status || 500
  }
} 