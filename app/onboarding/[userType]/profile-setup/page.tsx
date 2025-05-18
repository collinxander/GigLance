"use client"

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, Loader2, Check } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function ProfileSetupPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const params = useParams()
  const userType = params.userType as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [fullName, setFullName] = useState('')
  
  // Form state
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [isAvailable, setIsAvailable] = useState(true)
  const [hourlyRate, setHourlyRate] = useState(userType === 'creative' ? 0 : undefined)
  const [skills, setSkills] = useState('')
  const [website, setWebsite] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [github, setGithub] = useState('')
  const [twitter, setTwitter] = useState('')

  // Add new state variables for looking_for and wants_critique
  const [lookingFor, setLookingFor] = useState<string[]>([])
  const [wantsCritique, setWantsCritique] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Check user type and interests
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type, interests, full_name, avatar_url, looking_for, wants_critique')
        .eq('id', user.id)
        .single()

      if (!profile?.user_type || profile.user_type !== userType || !profile.interests || profile.interests.length === 0) {
        router.push('/onboarding')
        return
      }

      setUserId(user.id)
      setFullName(profile.full_name || '')
      setAvatarUrl(profile.avatar_url)
      setLookingFor(profile.looking_for || [])
      setWantsCritique(profile.wants_critique || false)
      setLoading(false)
    }

    checkSession()
  }, [supabase, router, userType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    
    setSaving(true)
    try {
      // Upload avatar if changed
      let newAvatarUrl = avatarUrl
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const filePath = `${userId}/avatar.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, {
            upsert: true,
          })

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
        newAvatarUrl = data.publicUrl
      }

      // Process skills
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean)

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({ 
          bio,
          location,
          is_available: isAvailable,
          hourly_rate: hourlyRate,
          skills: skillsArray,
          social_links: {
            github,
            linkedin,
            twitter,
            website,
          },
          avatar_url: newAvatarUrl,
          looking_for: lookingFor,
          wants_critique: wantsCritique,
          onboarding_completed: true
        })
        .eq('id', userId)

      if (error) throw error

      // Redirect to completion page
      router.push('/onboarding/complete')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }
    const file = e.target.files[0]
    setAvatarFile(file)
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
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
            Complete Your Profile
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {userType === 'client' 
              ? 'Help creatives understand your projects better' 
              : 'Showcase your skills and experience to clients'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Fill in your details to complete your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  {avatarFile ? (
                    <AvatarImage src={URL.createObjectURL(avatarFile)} />
                  ) : (
                    <>
                      <AvatarImage src={avatarUrl || undefined} />
                      <AvatarFallback>{fullName?.[0]}</AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div className="space-y-2">
                  <Label htmlFor="avatar">Profile Picture</Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio"
                  placeholder={
                    userType === 'client' 
                      ? 'Tell creatives about your company or projects' 
                      : 'Tell clients about your experience and expertise'
                  }
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  Write a short bio (max 500 characters)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    placeholder="e.g. New York, NY" 
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                </div>

                {userType === 'creative' && (
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input 
                      id="hourlyRate" 
                      type="number" 
                      min="0" 
                      step="0.01"
                      value={hourlyRate || 0}
                      onChange={e => setHourlyRate(parseFloat(e.target.value))}
                    />
                  </div>
                )}
              </div>

              {userType === 'creative' && (
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills</Label>
                  <Input 
                    id="skills" 
                    placeholder="e.g. JavaScript, React, UI Design (comma separated)" 
                    value={skills}
                    onChange={e => setSkills(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter your skills separated by commas
                  </p>
                </div>
              )}

              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>
                    {userType === 'client' 
                      ? 'Open to new projects' 
                      : 'Available for work'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {userType === 'client' 
                      ? 'Show creatives you\'re actively looking for help' 
                      : 'Show clients you\'re available for new opportunities'}
                  </p>
                </div>
                <Switch
                  checked={isAvailable}
                  onCheckedChange={setIsAvailable}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input 
                      id="website" 
                      placeholder="https://your-website.com"
                      value={website}
                      onChange={e => setWebsite(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input 
                      id="linkedin" 
                      placeholder="https://linkedin.com/in/username"
                      value={linkedin}
                      onChange={e => setLinkedin(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub</Label>
                    <Input 
                      id="github" 
                      placeholder="https://github.com/username"
                      value={github}
                      onChange={e => setGithub(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input 
                      id="twitter" 
                      placeholder="https://twitter.com/username"
                      value={twitter}
                      onChange={e => setTwitter(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lookingFor">What are you looking for?</Label>
                <Input
                  id="lookingFor"
                  placeholder="e.g., gigs, collaborations, inspiration"
                  value={lookingFor.join(', ')}
                  onChange={(e) => setLookingFor(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="wantsCritique"
                  checked={wantsCritique}
                  onCheckedChange={setWantsCritique}
                />
                <Label htmlFor="wantsCritique">Would you like to receive critique on your work?</Label>
              </div>

              <div className="pt-4 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/onboarding/${userType}/interests`)}
                >
                  Back
                </Button>
                <Button 
                  type="submit"
                  disabled={saving}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving
                    </>
                  ) : (
                    <>
                      Finish Setup
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-2">
          <span className="bg-purple-600 text-white w-3 h-3 rounded-full flex items-center justify-center text-xs">
            <Check className="h-2 w-2" />
          </span>
          <span className="bg-purple-600 text-white w-3 h-3 rounded-full flex items-center justify-center text-xs">
            <Check className="h-2 w-2" />
          </span>
          <span className="bg-purple-600 text-white w-3 h-3 rounded-full flex items-center justify-center text-xs">
            <Check className="h-2 w-2" />
          </span>
          <span className="bg-gray-300 w-3 h-3 rounded-full" />
        </div>
      </motion.div>
    </div>
  )
} 