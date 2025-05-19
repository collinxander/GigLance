"use client"

import { useState, Suspense, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Briefcase,
  Search,
  Bell,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Star,
  Clock,
  DollarSign,
  MapPin,
  Filter,
  ChevronDown,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from 'framer-motion'
import { supabase, handleSupabaseError } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Script from 'next/script'

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/gigs'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [recaptchaReady, setRecaptchaReady] = useState(false)

  useEffect(() => {
    // Initialize reCAPTCHA
    const loadRecaptcha = () => {
      if (typeof window !== 'undefined' && window.grecaptcha) {
        window.grecaptcha.ready(() => {
          setRecaptchaReady(true)
        })
      }
    }

    // Check if reCAPTCHA is already loaded
    if (typeof window !== 'undefined' && window.grecaptcha) {
      loadRecaptcha()
    } else {
      // If not loaded, wait for the script to load
      const checkRecaptcha = setInterval(() => {
        if (typeof window !== 'undefined' && window.grecaptcha) {
          loadRecaptcha()
          clearInterval(checkRecaptcha)
        }
      }, 100)

      // Clear interval after 10 seconds to prevent infinite checking
      setTimeout(() => clearInterval(checkRecaptcha), 10000)
    }
  }, [])

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session check error:', sessionError)
          setError('Error checking session. Please try again.')
          return
        }

        if (session) {
          // Check if user has completed onboarding
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', session.user.id)
            .single()

          if (profileError) {
            console.error('Profile check error:', profileError)
            setError('Error checking profile. Please try again.')
            return
          }

          if (!profile?.onboarding_completed) {
            router.push('/onboarding')
          } else {
            router.push(redirectTo)
          }
        }
      } catch (error) {
        console.error('Error checking session:', error)
        setError('An unexpected error occurred. Please try again.')
      } finally {
        setCheckingSession(false)
      }
    }

    checkSession()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push(redirectTo)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, redirectTo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Verify reCAPTCHA
      if (!recaptchaReady) {
        throw new Error('reCAPTCHA is not ready. Please refresh the page and try again.')
      }

      let recaptchaToken
      try {
        recaptchaToken = await window.grecaptcha.execute(
          process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
          { action: 'login' }
        )
      } catch (recaptchaError) {
        console.error('reCAPTCHA error:', recaptchaError)
        throw new Error('reCAPTCHA verification failed. Please refresh the page and try again.')
      }

      if (!recaptchaToken) {
        throw new Error('reCAPTCHA verification failed. Please try again.')
      }

      // Attempt to sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signInError) {
        console.error('Sign in error:', signInError)
        const { error: handledError } = handleSupabaseError(signInError)
        throw new Error(handledError)
      }

      if (!data.session) {
        throw new Error('No session created. Please try again.')
      }

      // Check if user has completed onboarding
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', data.session.user.id)
        .single()

      if (profileError) {
        console.error('Profile check error:', profileError)
        throw new Error('Error checking profile. Please try again.')
      }

      if (!profile?.onboarding_completed) {
        router.push('/onboarding')
      } else {
        router.push(redirectTo)
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo}`,
        },
      })

      if (error) {
        console.error('Google sign in error:', error)
        const { error: handledError } = handleSupabaseError(error)
        throw new Error(handledError)
      }
    } catch (err: any) {
      console.error('Google sign in error:', err)
      setError(err.message)
      setGoogleLoading(false)
    }
  }

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
        strategy="beforeInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined' && window.grecaptcha) {
            window.grecaptcha.ready(() => {
              setRecaptchaReady(true)
            })
          }
        }}
      />
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {checkingSession ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-purple-500 mb-4" />
              <p className="text-gray-400">Checking session...</p>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                  Welcome Back
                </h1>
                <p className="text-gray-400">
                  Sign in to your GigLance account
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                  {error}
                </div>
              )}

              {!loading && (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading || loading}
                    className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-white/10 rounded-lg text-white bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {googleLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#FFC107"/>
                        <path d="M3.15302 7.3455L6.43852 9.755C7.32752 7.554 9.48052 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15902 2 4.82802 4.1685 3.15302 7.3455Z" fill="#FF3D00"/>
                        <path d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.6095 17.5455 13.3575 18 12 18C9.399 18 7.19052 16.3415 6.35802 14.027L3.09753 16.5395C4.75202 19.778 8.11402 22 12 22Z" fill="#4CAF50"/>
                        <path d="M21.8055 10.0415H21V10H12V14H17.6515C17.2555 15.1185 16.536 16.083 15.608 16.7855C15.6085 16.785 15.609 16.785 15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#1976D2"/>
                      </svg>
                    )}
                    <span>Sign in with Google</span>
                  </button>

                  <div className="relative flex items-center justify-center">
                    <div className="absolute border-b border-white/10 w-full"></div>
                    <div className="relative px-4 bg-black text-gray-400 text-sm">OR</div>
                  </div>
                </div>
              )}

              {!loading && (
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="sr-only">
                        Email address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          className="block w-full pl-10 pr-3 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Email address"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="password" className="sr-only">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          required
                          className="block w-full pl-10 pr-10 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Password"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                          }
                          disabled={loading}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign in</span>
                          <ArrowRight className="h-5 w-5" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-400">
                      Don't have an account?{' '}
                      <Link
                        href="/signup"
                        className="font-medium text-purple-400 hover:text-purple-300 transition-colors duration-300"
                      >
                        Sign up
                      </Link>
                    </p>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-purple-500 mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
