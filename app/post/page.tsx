'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ArrowLeft, Briefcase, FileText, DollarSign, Building2, MapPin, Clock, Tag, AlertCircle, CheckCircle2, Plus, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const categories = [
  { id: 'web-development', name: 'Web Development' },
  { id: 'design', name: 'Design & Creative' },
  { id: 'writing', name: 'Writing & Translation' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'video', name: 'Video & Animation' },
  { id: 'music', name: 'Music & Audio' },
  { id: 'programming', name: 'Programming' },
  { id: 'business', name: 'Business' },
]

const durationOptions = [
  { id: 'less-than-week', name: 'Less than a week' },
  { id: '1-2-weeks', name: '1-2 weeks' },
  { id: '2-4-weeks', name: '2-4 weeks' },
  { id: '1-3-months', name: '1-3 months' },
  { id: '3-6-months', name: '3-6 months' },
  { id: 'more-than-6-months', name: 'More than 6 months' },
]

export default function PostGig() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    category: '',
    location: '',
    duration: '',
    skills: [] as string[],
    locationType: 'remote',
    paymentType: 'hourly',
    minRate: '',
    maxRate: '',
    isNegotiable: false,
  })
  const [newSkill, setNewSkill] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters'
    }

    if (!formData.budget.trim()) {
      newErrors.budget = 'Budget is required'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }

    if (!formData.duration) {
      newErrors.duration = 'Duration is required'
    }

    if (formData.skills.length === 0) {
      newErrors.skills = 'At least one skill is required'
    }

    if (formData.paymentType === 'hourly' && (!formData.minRate || !formData.maxRate)) {
      newErrors.rate = 'Both minimum and maximum rates are required for hourly payment'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('You must be logged in to post a gig')
      }

      const { data: gig, error } = await supabase
        .from('gigs')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            budget: formData.budget,
            category: formData.category,
            location: formData.location,
            duration: formData.duration,
            skills: formData.skills,
            location_type: formData.locationType,
            payment_type: formData.paymentType,
            min_rate: formData.minRate,
            max_rate: formData.maxRate,
            is_negotiable: formData.isNegotiable,
            client_id: user.id,
            status: 'open'
          }
        ])
        .select()
        .single()

      if (error) throw error

      setSubmitSuccess(true)
      setTimeout(() => {
        router.push('/gigs')
      }, 2000)
    } catch (error) {
      console.error('Error submitting form:', error)
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to post gig. Please try again.'
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleAddSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }))
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/gigs" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to dashboard</span>
          </Link>
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <span className="font-bold">GigLance</span>
          </div>
          <div className="w-[100px]"></div> {/* Spacer to balance the layout */}
        </div>
      </header>

      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Post a New Gig
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Share your opportunity with talented professionals and find the perfect match for your project.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {submitSuccess ? (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="text-center py-12">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Gig Posted Successfully!</h2>
                <p className="text-muted-foreground">Redirecting to gigs page...</p>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Gig Details</CardTitle>
                  <CardDescription>Provide the basic information about your gig</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Gig Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Website Development for Small Business"
                      className={errors.title ? 'border-destructive' : ''}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the gig in detail..."
                      rows={6}
                      className={errors.description ? 'border-destructive' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleChange({ target: { name: 'category', value } } as any)}
                      >
                        <SelectTrigger id="category" className={errors.category ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-sm text-destructive">{errors.category}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Select
                        value={formData.duration}
                        onValueChange={(value) => handleChange({ target: { name: 'duration', value } } as any)}
                      >
                        <SelectTrigger id="duration" className={errors.duration ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {durationOptions.map(option => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.duration && (
                        <p className="text-sm text-destructive">{errors.duration}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Location & Budget</CardTitle>
                  <CardDescription>Specify where the work will be done and your budget</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Location Type</Label>
                    <RadioGroup
                      value={formData.locationType}
                      onValueChange={(value) => handleChange({ target: { name: 'locationType', value } } as any)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="remote" id="remote" />
                        <Label htmlFor="remote">Remote</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="on-site" id="on-site" />
                        <Label htmlFor="on-site">On-site</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hybrid" id="hybrid" />
                        <Label htmlFor="hybrid">Hybrid</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., Remote, New York, etc."
                      className={errors.location ? 'border-destructive' : ''}
                    />
                    {errors.location && (
                      <p className="text-sm text-destructive">{errors.location}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Type</Label>
                    <RadioGroup
                      value={formData.paymentType}
                      onValueChange={(value) => handleChange({ target: { name: 'paymentType', value } } as any)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hourly" id="hourly" />
                        <Label htmlFor="hourly">Hourly Rate</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fixed" id="fixed" />
                        <Label htmlFor="fixed">Fixed Price</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.paymentType === 'hourly' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="minRate">Minimum Rate ($)</Label>
                        <Input
                          id="minRate"
                          name="minRate"
                          type="number"
                          value={formData.minRate}
                          onChange={handleChange}
                          placeholder="e.g., 20"
                          className={errors.rate ? 'border-destructive' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxRate">Maximum Rate ($)</Label>
                        <Input
                          id="maxRate"
                          name="maxRate"
                          type="number"
                          value={formData.maxRate}
                          onChange={handleChange}
                          placeholder="e.g., 35"
                          className={errors.rate ? 'border-destructive' : ''}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget</Label>
                      <Input
                        id="budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        placeholder="e.g., $500-1000"
                        className={errors.budget ? 'border-destructive' : ''}
                      />
                      {errors.budget && (
                        <p className="text-sm text-destructive">{errors.budget}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                  <CardDescription>Add the skills required for this gig</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="skills">Add Skills</Label>
                    <div className="flex gap-2">
                      <Input
                        id="skills"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="e.g., React, Node.js, UI/UX Design"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddSkill()
                          }
                        }}
                      />
                      <Button type="button" onClick={handleAddSkill} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {errors.skills && (
                      <p className="text-sm text-destructive">{errors.skills}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <div
                        key={skill}
                        className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-primary hover:text-primary/80"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Posting...
                    </div>
                  ) : (
                    'Post Gig'
                  )}
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  )
} 