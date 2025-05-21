"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowRight, Briefcase, MapPin, DollarSign, Star, CheckCircle2 } from "lucide-react"
import { supabase, handleSupabaseError } from '@/lib/supabase'

function OnboardingContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    hourlyRate: '',
    skills: '',
    bio: '',
  })

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session check error:', sessionError)
          setError('Error checking session. Please try again.')
          return
        }

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

        if (profileError) {
          console.error('Profile check error:', profileError)
          setError('Error checking profile. Please try again.')
          return
        }

        if (profile?.onboarding_completed) {
          router.push('/feed')
        }
      } catch (error) {
        console.error('Error checking session:', error)
        setError('An unexpected error occurred. Please try again.')
      } finally {
        setCheckingSession(false)
      }
    }

    checkSession()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        throw new Error('Error getting session. Please try again.')
      }

      if (!session) {
        router.push('/login')
        return
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          title: formData.title,
          location: formData.location,
          hourly_rate: parseFloat(formData.hourlyRate),
          skills: formData.skills.split(',').map(skill => skill.trim()),
          bio: formData.bio,
          onboarding_completed: true,
        })
        .eq('id', session.user.id)

      if (updateError) {
        console.error('Profile update error:', updateError)
        throw new Error('Error updating profile. Please try again.')
      }

      router.push('/feed')
    } catch (err: any) {
      console.error('Onboarding error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4))
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  if (checkingSession) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-purple-500 mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="animate-fade-in">
          <h2 className="mt-6 text-center text-3xl font-bold text-white">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Tell us about yourself to get started
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-400 animate-fade-in">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex items-center ${
                step < currentStep
                  ? 'text-purple-500'
                  : step === currentStep
                  ? 'text-white'
                  : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step < currentStep
                    ? 'border-purple-500 bg-purple-500'
                    : step === currentStep
                    ? 'border-purple-500'
                    : 'border-gray-400'
                }`}
              >
                {step < currentStep ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <span>{step}</span>
                )}
              </div>
              {step < 4 && (
                <div
                  className={`w-16 h-0.5 ${
                    step < currentStep ? 'bg-purple-500' : 'bg-gray-400'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                  Professional Title
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g. Senior Web Developer"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g. San Francisco, CA"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-300 mb-2">
                  Hourly Rate (USD)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="hourlyRate"
                    name="hourlyRate"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="block w-full pl-10 pr-3 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g. 50.00"
                    value={formData.hourlyRate}
                    onChange={(e) =>
                      setFormData({ ...formData, hourlyRate: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-300 mb-2">
                  Skills (comma-separated)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Star className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="skills"
                    name="skills"
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g. React, Node.js, TypeScript"
                    value={formData.skills}
                    onChange={(e) =>
                      setFormData({ ...formData, skills: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  required
                  rows={4}
                  className="block w-full px-3 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Tell us about yourself and your experience..."
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors duration-300"
              >
                Back
              </button>
            )}
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={loading}
                className="ml-auto px-4 py-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors duration-300"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="ml-auto flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Completing profile...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Profile</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Onboarding() {
  return <OnboardingContent />
}
