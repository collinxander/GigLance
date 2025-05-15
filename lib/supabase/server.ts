import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '../database.types';
import { cookies } from 'next/headers';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      'Missing Supabase environment variables. Please check your .env.local file.'
    );
  }

  return createSupabaseClient<Database>(
    supabaseUrl || 'https://gzdezyfnxtekbnuokgpg.supabase.co',
    supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZGV6eWZueHRla2JudW9rZ3BnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNzc4MDksImV4cCI6MjA2Mjg1MzgwOX0.sGAG7GVYj6B-kqOjCdz72IXaS5zM_N5ecTfTdu7ASp8',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  );
} 