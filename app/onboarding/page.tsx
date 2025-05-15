"use client"

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Briefcase, Paintbrush, Loader2 } from 'lucide-react'

export default function OnboardingPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Check if user has already completed onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      if (profile?.onboarding_completed) {
        router.push('/gigs')
        return
      }

      setUserId(user.id)
      setLoading(false)
    }

    checkSession()
  }, [supabase, router])

  const selectUserType = async (type: 'client' | 'creative') => {
    if (!userId) return
    
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: type })
        .eq('id', userId)

      if (error) throw error

      // Redirect to the next step
      router.push(`/onboarding/${type}/interests`)
    } catch (error) {
      console.error('Error selecting user type:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-purple-950/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full space-y-8"
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
            Welcome to GigLance
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Let's set up your account in just a few steps
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <motion.div
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="h-full transition-all cursor-pointer hover:border-purple-500 hover:shadow-md">
              <CardHeader className="text-center">
                <Briefcase className="h-12 w-12 mx-auto text-purple-500" />
                <CardTitle className="mt-2">I'm hiring talent</CardTitle>
                <CardDescription>
                  I want to post gigs and find creatives for my projects
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="mr-2 text-green-500">✓</span>
                    Post unlimited gigs
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-green-500">✓</span>
                    Browse creative profiles
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-green-500">✓</span>
                    Secure payment system
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant="outline"
                  disabled={saving}
                  onClick={() => selectUserType('client')}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Briefcase className="h-4 w-4 mr-2" />
                  )}
                  Continue as Client
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="h-full transition-all cursor-pointer hover:border-indigo-500 hover:shadow-md">
              <CardHeader className="text-center">
                <Paintbrush className="h-12 w-12 mx-auto text-indigo-500" />
                <CardTitle className="mt-2">I'm a creative</CardTitle>
                <CardDescription>
                  I want to find gigs and work on exciting projects
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="mr-2 text-green-500">✓</span>
                    Apply to relevant gigs
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-green-500">✓</span>
                    Showcase your portfolio
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-green-500">✓</span>
                    Get paid on time
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant="outline"
                  disabled={saving}
                  onClick={() => selectUserType('creative')}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Paintbrush className="h-4 w-4 mr-2" />
                  )}
                  Continue as Creative
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
