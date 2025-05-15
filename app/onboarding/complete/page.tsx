"use client"

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2, Check, ThumbsUp, Briefcase, Search } from 'lucide-react'
import Link from 'next/link'

interface Gig {
  id: string
  title: string
  description: string
  budget: number
  category: string
}

interface UserProfile {
  id: string
  user_type: string
  interests: string[]
  full_name: string | null
}

export default function OnboardingCompletePage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [recommendedGigs, setRecommendedGigs] = useState<Gig[]>([])
  const [categories, setCategories] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        // Get user profile with interests
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, user_type, interests, full_name')
          .eq('id', user.id)
          .single()

        if (profileError || !profileData) {
          throw profileError || new Error('Profile not found')
        }

        setProfile(profileData)

        // Get interest categories for mapping IDs to names
        const { data: categoriesData } = await supabase
          .from('interest_categories')
          .select('id, name')

        const categoryMap: Record<string, string> = {}
        if (categoriesData) {
          categoriesData.forEach(cat => {
            categoryMap[cat.id] = cat.name
          })
        }
        setCategories(categoryMap)

        // Get recommended gigs if the user is a creative
        if (profileData.user_type === 'creative' && profileData.interests?.length > 0) {
          const { data: gigs } = await supabase
            .from('gigs')
            .select('*')
            .in('category', profileData.interests)
            .order('created_at', { ascending: false })
            .limit(3)

          setRecommendedGigs(gigs || [])
        }

        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, router])

  const getInterestNames = () => {
    if (!profile?.interests || !categories) return []
    
    return profile.interests
      .map(id => categories[id])
      .filter(Boolean)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 px-4 bg-gradient-to-b from-background to-purple-950/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto space-y-8"
      >
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
            You're All Set!
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Your profile is complete and ready to go
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome to GigLance, {profile?.full_name || 'there'}!</CardTitle>
            <CardDescription>
              {profile?.user_type === 'client' 
                ? 'Here\'s what you can do next to find the perfect creative for your projects'
                : 'Here\'s what you can do next to find your next gig'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Your Interests</h3>
              <div className="flex flex-wrap gap-2">
                {getInterestNames().map(name => (
                  <div key={name} className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm">
                    {name}
                  </div>
                ))}
              </div>
            </div>

            {profile?.user_type === 'creative' && recommendedGigs.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Recommended Gigs</h3>
                <div className="space-y-4">
                  {recommendedGigs.map(gig => (
                    <div key={gig.id} className="border rounded-lg p-4 hover:border-purple-400 transition-colors">
                      <h4 className="font-medium">{gig.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {gig.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">${gig.budget.toFixed(2)}</span>
                        <Link href={`/gigs/${gig.id}`}>
                          <Button size="sm" variant="outline">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Next Steps</h3>
              <div className="grid gap-3">
                {profile?.user_type === 'client' ? (
                  <>
                    <Link href="/post">
                      <div className="flex items-center border rounded-lg p-4 hover:border-purple-400 transition-colors">
                        <Briefcase className="h-5 w-5 mr-3 text-purple-600" />
                        <div>
                          <h4 className="font-medium">Post Your First Gig</h4>
                          <p className="text-sm text-muted-foreground">Tell creatives about your project</p>
                        </div>
                      </div>
                    </Link>
                    <Link href="/creatives">
                      <div className="flex items-center border rounded-lg p-4 hover:border-purple-400 transition-colors">
                        <Search className="h-5 w-5 mr-3 text-purple-600" />
                        <div>
                          <h4 className="font-medium">Browse Creative Profiles</h4>
                          <p className="text-sm text-muted-foreground">Find talent that matches your needs</p>
                        </div>
                      </div>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/gigs">
                      <div className="flex items-center border rounded-lg p-4 hover:border-purple-400 transition-colors">
                        <Search className="h-5 w-5 mr-3 text-purple-600" />
                        <div>
                          <h4 className="font-medium">Browse Available Gigs</h4>
                          <p className="text-sm text-muted-foreground">Find projects that match your skills</p>
                        </div>
                      </div>
                    </Link>
                    <Link href="/profile">
                      <div className="flex items-center border rounded-lg p-4 hover:border-purple-400 transition-colors">
                        <ThumbsUp className="h-5 w-5 mr-3 text-purple-600" />
                        <div>
                          <h4 className="font-medium">Complete Your Portfolio</h4>
                          <p className="text-sm text-muted-foreground">Add projects to showcase your work</p>
                        </div>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button 
              onClick={() => router.push('/gigs')} 
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
} 