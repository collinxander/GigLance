import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Mark this route as dynamically rendered
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirect') || '/gigs'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gzdezyfnxtekbnuokgpg.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'missing-key',
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    await supabase.auth.exchangeCodeForSession(code)
    
    // Check if this is a new user or if onboarding is not completed
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, onboarding_completed')
        .eq('id', user.id)
        .single()
        
      if (profileError || !profile) {
        // New user from Google auth - create initial profile
        // and redirect to onboarding
        const { data: metadata } = await supabase.auth.getSession()
        
        if (metadata.session?.user.app_metadata.provider === 'google') {
          // Create profile for new Google user
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: user.user_metadata.full_name || '',
              avatar_url: user.user_metadata.avatar_url || null,
              onboarding_completed: false,
            })
            
          if (insertError) {
            console.error('Error creating profile:', insertError)
          }
        } else {
          // Fallback for non-Google users: create a basic profile
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: user.user_metadata.full_name || '',
              avatar_url: user.user_metadata.avatar_url || null,
              onboarding_completed: false,
            })
            
          if (insertError) {
            console.error('Error creating profile:', insertError)
          }
        }
        
        // Always redirect new users to onboarding
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
        
      if (!profile.onboarding_completed) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL(redirectTo, request.url))
} 