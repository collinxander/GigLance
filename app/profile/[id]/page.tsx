'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ExternalLink, Star } from "lucide-react"
import PortfolioProjectCard from '@/components/PortfolioProjectCard'
import Image from 'next/image'

interface Profile {
  id: string
  full_name: string
  avatar_url: string
  bio: string
  skills: string[]
  location: string
  hourly_rate: number
  is_available: boolean
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

export default function PublicProfilePage({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchProfile()
    fetchProjects()
  }, [params.id])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params.id)
        .eq('visibility', 'public')
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('user_id', params.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive">Profile not found or is private</p>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="relative aspect-square w-full rounded-lg overflow-hidden">
            <Image
              src={profile.avatar_url || '/default-avatar.png'}
              alt={profile.full_name}
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold">{profile.full_name}</h1>
              <p className="text-muted-foreground">{profile.location}</p>
            </div>

            {profile.is_available && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                Available for Work
              </Badge>
            )}

            <div className="space-y-2">
              <h3 className="font-semibold">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Social Links</h3>
              <div className="space-y-2">
                {profile.social_links.github && (
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <a
                      href={profile.social_links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                )}
                {profile.social_links.linkedin && (
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <a
                      href={profile.social_links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                {profile.social_links.twitter && (
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <a
                      href={profile.social_links.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Twitter
                    </a>
                  </Button>
                )}
                {profile.social_links.website && (
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <a
                      href={profile.social_links.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Website
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Portfolio Projects</h2>
            <div className="grid grid-cols-1 gap-6">
              {projects.map((project) => (
                <PortfolioProjectCard
                  key={project.id}
                  project={project}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 