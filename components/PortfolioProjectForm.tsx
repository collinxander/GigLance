'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save, X } from "lucide-react"

interface PortfolioProject {
  id: string
  title: string
  description: string
  image_url: string
  project_url: string
  technologies: string[]
  featured: boolean
}

interface PortfolioProjectFormProps {
  project?: Omit<PortfolioProject, 'id'> & { id?: string }
  onSubmit: (project: PortfolioProject) => Promise<void>
  onCancel: () => void
}

export default function PortfolioProjectForm({ project, onSubmit, onCancel }: PortfolioProjectFormProps) {
  const [formData, setFormData] = useState<Omit<PortfolioProject, 'id'> & { id?: string }>(project || {
    title: '',
    description: '',
    image_url: '',
    project_url: '',
    technologies: [],
    featured: false
  })
  const [newTechnology, setNewTechnology] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData as PortfolioProject)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTechnology = () => {
    if (!newTechnology.trim()) return
    setFormData(prev => ({
      ...prev,
      technologies: [...prev.technologies, newTechnology.trim()]
    }))
    setNewTechnology('')
  }

  const handleRemoveTechnology = (techToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(tech => tech !== techToRemove)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Project Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          type="url"
          value={formData.image_url}
          onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
          placeholder="https://example.com/image.jpg"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="project_url">Project URL</Label>
        <Input
          id="project_url"
          type="url"
          value={formData.project_url}
          onChange={(e) => setFormData(prev => ({ ...prev, project_url: e.target.value }))}
          placeholder="https://example.com/project"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Technologies</Label>
        <div className="flex gap-2">
          <Input
            value={newTechnology}
            onChange={(e) => setNewTechnology(e.target.value)}
            placeholder="Add a technology..."
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTechnology())}
          />
          <Button type="button" onClick={handleAddTechnology}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.technologies.map((tech) => (
            <Badge key={tech} variant="secondary">
              {tech}
              <button
                type="button"
                onClick={() => handleRemoveTechnology(tech)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="featured"
          checked={formData.featured}
          onCheckedChange={(checked) =>
            setFormData(prev => ({ ...prev, featured: checked }))
          }
        />
        <Label htmlFor="featured">Featured Project</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Project
            </>
          )}
        </Button>
      </div>
    </form>
  )
} 