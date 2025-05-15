'use client'

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Star } from "lucide-react"
import Image from "next/image"

interface PortfolioProject {
  id: string
  title: string
  description: string
  image_url: string
  project_url: string
  technologies: string[]
  featured: boolean
}

interface PortfolioProjectCardProps {
  project: PortfolioProject
  onEdit?: (project: PortfolioProject) => void
  onDelete?: (projectId: string) => void
  isEditable?: boolean
}

export default function PortfolioProjectCard({
  project,
  onEdit,
  onDelete,
  isEditable = false
}: PortfolioProjectCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="relative p-0">
        <div className="aspect-video relative">
          <Image
            src={project.image_url}
            alt={project.title}
            fill
            className="object-cover"
          />
        </div>
        {project.featured && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              Featured
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <Badge key={tech} variant="outline">
              {tech}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <a
            href={project.project_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1"
          >
            <ExternalLink className="h-4 w-4" />
            View Project
          </a>
        </Button>
        {isEditable && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(project)}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete?.(project.id)}
            >
              Delete
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
} 