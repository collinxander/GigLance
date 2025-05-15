'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, Save, Upload, X, Plus } from "lucide-react"
import PortfolioProjectForm from '@/components/PortfolioProjectForm'
import PortfolioProjectCard from '@/components/PortfolioProjectCard'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import ReviewList from '@/components/ReviewList'
import ReviewForm from '@/components/ReviewForm'

interface Profile {
  id: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  skills: string[]
  portfolio_url: string | null
  location: string | null
  hourly_rate: number | null
  is_available: boolean
  visibility: 'public' | 'private' | 'connections'
  notification_preferences: {
    email: boolean
    new_messages: boolean
    application_updates: boolean
    gig_recommendations: boolean
  }
  social_links: {
    github: string
    linkedin: string
    twitter: string
    website: string
  }
}

interface PortfolioProject {
  id: string
  title: string
  description: string
  image_url: string
  project_url: string
  technologies: string[]
  featured: boolean
}

export default function ProfilePage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newSkill, setNewSkill] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProject, setEditingProject] = useState<PortfolioProject | undefined>()
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    fetchProfile()
    fetchProjects()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    try {
      setSaving(true)
      setError(null)

      // Upload avatar if changed
      let avatar_url = profile.avatar_url
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${profile.id}-${Math.random()}.${fileExt}`
        const { error: uploadError, data } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile)

        if (uploadError) throw uploadError
        avatar_url = data.path
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...profile,
          avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (error) throw error
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAddSkill = () => {
    if (!newSkill.trim() || !profile) return
    setProfile({
      ...profile,
      skills: [...profile.skills, newSkill.trim()]
    })
    setNewSkill('')
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    if (!profile) return
    setProfile({
      ...profile,
      skills: profile.skills.filter(skill => skill !== skillToRemove)
    })
  }

  const handleSaveProject = async (project: PortfolioProject) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (project.id) {
        // Update existing project
        const { error } = await supabase
          .from('portfolio_projects')
          .update(project)
          .eq('id', project.id)

        if (error) throw error
      } else {
        // Create new project
        const { error } = await supabase
          .from('portfolio_projects')
          .insert([{ ...project, user_id: user.id }])

        if (error) throw error
      }

      setShowProjectForm(false)
      setEditingProject(undefined)
      fetchProjects()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('portfolio_projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error
      fetchProjects()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Error loading profile</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <form onSubmit={handleProfileUpdate}>
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your profile information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback>{profile.full_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Label htmlFor="avatar">Profile Picture</Label>
                      <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profile.full_name || ''}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio || ''}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Skills</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill..."
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      />
                      <Button type="button" onClick={handleAddSkill}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location || ''}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      value={profile.hourly_rate || ''}
                      onChange={(e) => setProfile({ ...profile, hourly_rate: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="visibility">Profile Visibility</Label>
                    <Select
                      value={profile.visibility}
                      onValueChange={(value: 'public' | 'private' | 'connections') =>
                        setProfile({ ...profile, visibility: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="connections">Connections Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_available"
                      checked={profile.is_available}
                      onCheckedChange={(checked) =>
                        setProfile({ ...profile, is_available: checked })
                      }
                    />
                    <Label htmlFor="is_available">Available for Work</Label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account settings and notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email_notifications">Email Notifications</Label>
                      <Switch
                        id="email_notifications"
                        checked={profile.notification_preferences.email}
                        onCheckedChange={(checked) =>
                          setProfile({
                            ...profile,
                            notification_preferences: {
                              ...profile.notification_preferences,
                              email: checked
                            }
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="new_messages">New Messages</Label>
                      <Switch
                        id="new_messages"
                        checked={profile.notification_preferences.new_messages}
                        onCheckedChange={(checked) =>
                          setProfile({
                            ...profile,
                            notification_preferences: {
                              ...profile.notification_preferences,
                              new_messages: checked
                            }
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="application_updates">Application Updates</Label>
                      <Switch
                        id="application_updates"
                        checked={profile.notification_preferences.application_updates}
                        onCheckedChange={(checked) =>
                          setProfile({
                            ...profile,
                            notification_preferences: {
                              ...profile.notification_preferences,
                              application_updates: checked
                            }
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="gig_recommendations">Gig Recommendations</Label>
                      <Switch
                        id="gig_recommendations"
                        checked={profile.notification_preferences.gig_recommendations}
                        onCheckedChange={(checked) =>
                          setProfile({
                            ...profile,
                            notification_preferences: {
                              ...profile.notification_preferences,
                              gig_recommendations: checked
                            }
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={saving} onClick={handleProfileUpdate}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Management</CardTitle>
                <CardDescription>
                  Add and manage your portfolio items
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Portfolio Projects</h3>
                  <Button onClick={() => setShowProjectForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Project
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project) => (
                    <PortfolioProjectCard
                      key={project.id}
                      project={project}
                      onEdit={(project) => {
                        setEditingProject(project)
                        setShowProjectForm(true)
                      }}
                      onDelete={handleDeleteProject}
                      isEditable
                    />
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={saving} onClick={handleProfileUpdate}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Reviews</h2>
              <Button onClick={() => setShowReviewForm(true)}>
                Write a Review
              </Button>
            </div>

            <ReviewList creativeId={profile?.id || ''} />

            {showReviewForm && (
              <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Write a Review</DialogTitle>
                    <DialogDescription>
                      Share your experience working with this creative
                    </DialogDescription>
                  </DialogHeader>
                  <ReviewForm
                    creativeId={profile?.id || ''}
                    projectId={undefined} // You can pass a specific project ID if needed
                    onReviewSubmitted={() => {
                      setShowReviewForm(false)
                      // Refresh reviews
                      const reviewList = document.querySelector('[data-review-list]')
                      if (reviewList) {
                        reviewList.dispatchEvent(new Event('refresh'))
                      }
                    }}
                  />
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showProjectForm} onOpenChange={setShowProjectForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProject ? 'Edit Project' : 'Add New Project'}
            </DialogTitle>
          </DialogHeader>
          <PortfolioProjectForm
            project={editingProject}
            onSubmit={handleSaveProject}
            onCancel={() => {
              setShowProjectForm(false)
              setEditingProject(undefined)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
} 