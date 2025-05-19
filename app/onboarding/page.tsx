"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, User, Briefcase, Palette, Building2 } from 'lucide-react'

type UserRole = 'creative' | 'hiring'

interface OnboardingForm {
  role: UserRole
  fullName: string
  bio: string
  skills: string[]
  location: string
  website?: string
  company?: string
  jobTitle?: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<OnboardingForm>({
    role: 'creative',
    fullName: '',
    bio: '',
    skills: [],
    location: '',
    website: '',
    company: '',
    jobTitle: ''
  })
  const [currentSkill, setCurrentSkill] = useState('')

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) throw sessionError
      
      if (!session) {
        router.push('/login')
        return
      }

      // Check if user has already completed onboarding
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .single()

      if (profileError) throw profileError

      if (profile?.onboarding_completed) {
        router.push('/feed')
        return
      }

      setLoading(false)
    } catch (error) {
      console.error('Error checking session:', error)
      setError('An error occurred. Please try again.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!session) throw new Error('No session found')

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role: formData.role,
          full_name: formData.fullName,
          bio: formData.bio,
          skills: formData.skills,
          location: formData.location,
          website: formData.website,
          company: formData.company,
          job_title: formData.jobTitle,
          onboarding_completed: true
        })
        .eq('id', session.user.id)

      if (updateError) throw updateError

      router.push('/feed')
    } catch (error: any) {
      console.error('Error saving profile:', error)
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, currentSkill.trim()]
      })
      setCurrentSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to GigLance</h1>
          <p className="text-gray-400">Let's set up your profile</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label className="text-white">I am a...</Label>
            <RadioGroup
              value={formData.role}
              onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="creative"
                  id="creative"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="creative"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-white/10 p-4 hover:bg-white/5 peer-data-[state=checked]:border-purple-500 [&:has([data-state=checked])]:border-purple-500 cursor-pointer"
                >
                  <Palette className="h-6 w-6 mb-2 text-purple-500" />
                  <div className="text-center">
                    <div className="font-semibold text-white">Creative</div>
                    <div className="text-sm text-gray-400">I want to find work</div>
                  </div>
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="hiring"
                  id="hiring"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="hiring"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-white/10 p-4 hover:bg-white/5 peer-data-[state=checked]:border-purple-500 [&:has([data-state=checked])]:border-purple-500 cursor-pointer"
                >
                  <Building2 className="h-6 w-6 mb-2 text-purple-500" />
                  <div className="text-center">
                    <div className="font-semibold text-white">Hiring</div>
                    <div className="text-sm text-gray-400">I want to hire creatives</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-white">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="mt-1 bg-black/50 border-white/10 text-white"
                required
              />
            </div>

            <div>
              <Label htmlFor="bio" className="text-white">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="mt-1 bg-black/50 border-white/10 text-white"
                placeholder="Tell us about yourself..."
                required
              />
            </div>

            <div>
              <Label htmlFor="location" className="text-white">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="mt-1 bg-black/50 border-white/10 text-white"
                placeholder="City, Country"
                required
              />
            </div>

            {formData.role === 'creative' && (
              <div>
                <Label htmlFor="skills" className="text-white">Skills</Label>
                <div className="mt-1 flex gap-2">
                  <Input
                    id="skills"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    className="bg-black/50 border-white/10 text-white"
                    placeholder="Add a skill"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addSkill()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addSkill}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Add
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-sm text-white"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-gray-400 hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.role === 'hiring' && (
              <>
                <div>
                  <Label htmlFor="company" className="text-white">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="mt-1 bg-black/50 border-white/10 text-white"
                    placeholder="Your company name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="jobTitle" className="text-white">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="mt-1 bg-black/50 border-white/10 text-white"
                    placeholder="Your role in the company"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="website" className="text-white">Website (Optional)</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="mt-1 bg-black/50 border-white/10 text-white"
                placeholder="https://yourwebsite.com"
                type="url"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Complete Setup'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
