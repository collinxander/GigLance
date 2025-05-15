"use client"

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ArrowRight, Loader2, Check } from 'lucide-react'

interface Category {
  id: string
  name: string
}

export default function InterestsPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const params = useParams()
  const userType = params.userType as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Check user type
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single()

      if (!profile?.user_type || profile.user_type !== userType) {
        router.push('/onboarding')
        return
      }

      setUserId(user.id)
      
      // Fetch interest categories
      const { data: categoriesData, error } = await supabase
        .from('interest_categories')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching categories:', error)
      } else {
        setCategories(categoriesData || [])
      }

      setLoading(false)
    }

    checkSession()
  }, [supabase, router, userType])

  const saveInterests = async () => {
    if (!userId || selectedCategories.length === 0) return
    
    setSaving(true)
    try {
      // Update profile with selected interests
      const { error } = await supabase
        .from('profiles')
        .update({ 
          interests: selectedCategories
        })
        .eq('id', userId)

      if (error) throw error

      // Redirect to the next step in onboarding
      router.push(`/onboarding/${userType}/profile-setup`)
    } catch (error) {
      console.error('Error saving interests:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
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
            Select Your Interests
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {userType === 'client' 
              ? 'What type of work are you looking to hire for?' 
              : 'What type of work are you interested in doing?'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Categories</CardTitle>
            <CardDescription>
              Choose at least 3 categories that interest you most
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-start space-x-2">
                  <Checkbox 
                    id={category.id} 
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <Label 
                    htmlFor={category.id}
                    className="cursor-pointer"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => router.push('/onboarding')}
            >
              Back
            </Button>
            <Button 
              onClick={saveInterests}
              disabled={saving || selectedCategories.length < 3}
              className={selectedCategories.length >= 3 ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <div className="flex justify-center space-x-2">
          <span className="bg-purple-600 text-white w-3 h-3 rounded-full flex items-center justify-center text-xs">
            <Check className="h-2 w-2" />
          </span>
          <span className="bg-purple-600 text-white w-3 h-3 rounded-full flex items-center justify-center text-xs">
            <Check className="h-2 w-2" />
          </span>
          <span className="bg-white w-3 h-3 rounded-full" />
          <span className="bg-gray-300 w-3 h-3 rounded-full" />
        </div>
      </motion.div>
    </div>
  )
} 