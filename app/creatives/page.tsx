'use client'

import { useState, useEffect } from "react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  MapPin,
  DollarSign,
  Star,
  Clock,
  Filter,
  ChevronDown,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"

interface Creative {
  id: string
  full_name: string
  avatar_url: string
  bio: string
  skills: string[]
  location: string
  hourly_rate: number
  is_available: boolean
  portfolio_url: string
  rating: number
  completed_projects: number
  created_at: string
}

interface Filters {
  skills: string[]
  location: string[]
  availability: boolean | null
  minRate: number
  maxRate: number
  minRating: number
  hasPortfolio: boolean | null
}

export default function CreativesPage() {
  const supabase = createClientComponentClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<Filters>({
    skills: [],
    location: [],
    availability: null,
    minRate: 0,
    maxRate: 200,
    minRating: 0,
    hasPortfolio: null,
  })
  const [sortBy, setSortBy] = useState("rating")
  const [creatives, setCreatives] = useState<Creative[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCreatives()
  }, [searchQuery, selectedFilters, sortBy])

  const fetchCreatives = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('profiles')
        .select('*')

      // Apply search
      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%,skills.cs.{${searchQuery}}`)
      }

      // Apply filters
      if (selectedFilters.skills.length > 0) {
        query = query.contains('skills', selectedFilters.skills)
      }
      if (selectedFilters.location.length > 0) {
        query = query.in('location', selectedFilters.location)
      }
      if (selectedFilters.availability !== null) {
        query = query.eq('is_available', selectedFilters.availability)
      }
      if (selectedFilters.minRate > 0) {
        query = query.gte('hourly_rate', selectedFilters.minRate)
      }
      if (selectedFilters.maxRate < 200) {
        query = query.lte('hourly_rate', selectedFilters.maxRate)
      }
      if (selectedFilters.minRating > 0) {
        query = query.gte('rating', selectedFilters.minRating)
      }
      if (selectedFilters.hasPortfolio !== null) {
        if (selectedFilters.hasPortfolio) {
          query = query.not('portfolio_url', 'is', null)
        } else {
          query = query.is('portfolio_url', null)
        }
      }

      // Apply sorting
      if (sortBy === 'rating') {
        query = query.order('rating', { ascending: false })
      } else if (sortBy === 'rate_asc') {
        query = query.order('hourly_rate', { ascending: true })
      } else if (sortBy === 'rate_desc') {
        query = query.order('hourly_rate', { ascending: false })
      } else if (sortBy === 'projects') {
        query = query.order('completed_projects', { ascending: false })
      }

      const { data, error } = await query

      if (error) throw error
      setCreatives(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (filter: keyof Filters, value: any) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filter]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Find Creatives</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Search for talented creatives and find the perfect match for your project
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Filters</CardTitle>
                  <CardDescription>Refine your search</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Skills Filter */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Skills</h4>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          Select Skills
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        {["Web Development", "Design", "Writing", "Marketing", "Video", "Music", "Programming", "Business"].map((skill) => (
                          <DropdownMenuCheckboxItem
                            key={skill}
                            checked={selectedFilters.skills.includes(skill)}
                            onCheckedChange={() => {
                              const newSkills = selectedFilters.skills.includes(skill)
                                ? selectedFilters.skills.filter(s => s !== skill)
                                : [...selectedFilters.skills, skill]
                              handleFilterChange('skills', newSkills)
                            }}
                          >
                            {skill}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Separator />

                  {/* Location Filter */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Location</h4>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          Select Location
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        {["Remote", "US", "Europe", "Asia", "Australia", "Africa"].map((location) => (
                          <DropdownMenuCheckboxItem
                            key={location}
                            checked={selectedFilters.location.includes(location)}
                            onCheckedChange={() => {
                              const newLocations = selectedFilters.location.includes(location)
                                ? selectedFilters.location.filter(l => l !== location)
                                : [...selectedFilters.location, location]
                              handleFilterChange('location', newLocations)
                            }}
                          >
                            {location}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Separator />

                  {/* Hourly Rate Filter */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Hourly Rate</h4>
                    <div className="space-y-4">
                      <Slider
                        defaultValue={[selectedFilters.minRate, selectedFilters.maxRate]}
                        max={200}
                        step={10}
                        onValueChange={(value) => {
                          handleFilterChange('minRate', value[0])
                          handleFilterChange('maxRate', value[1])
                        }}
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>${selectedFilters.minRate}/hr</span>
                        <span>${selectedFilters.maxRate}/hr</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Availability Filter */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Availability</h4>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          Select Availability
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuCheckboxItem
                          checked={selectedFilters.availability === true}
                          onCheckedChange={(checked) => handleFilterChange('availability', checked ? true : null)}
                        >
                          Available Now
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={selectedFilters.availability === false}
                          onCheckedChange={(checked) => handleFilterChange('availability', checked ? false : null)}
                        >
                          Not Available
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Separator />

                  {/* Portfolio Filter */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Portfolio</h4>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          Portfolio Options
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuCheckboxItem
                          checked={selectedFilters.hasPortfolio === true}
                          onCheckedChange={(checked) => handleFilterChange('hasPortfolio', checked ? true : null)}
                        >
                          Has Portfolio
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Search and Sort Bar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by name, skills, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Sort by: {sortBy === 'rating' ? 'Rating' : 
                              sortBy === 'rate_asc' ? 'Rate (Low to High)' :
                              sortBy === 'rate_desc' ? 'Rate (High to Low)' :
                              'Projects'}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSortBy('rating')}>
                      Rating
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('rate_asc')}>
                      Rate (Low to High)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('rate_desc')}>
                      Rate (High to Low)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('projects')}>
                      Projects Completed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Creatives Grid */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading creatives...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-500">{error}</p>
                </div>
              ) : creatives.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No creatives found</h3>
                  <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {creatives.map((creative) => (
                    <Card key={creative.id} className="overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={creative.avatar_url} />
                              <AvatarFallback>{creative.full_name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle>{creative.full_name}</CardTitle>
                              <CardDescription>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{creative.location}</span>
                                </div>
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant={creative.is_available ? "default" : "secondary"}>
                            {creative.is_available ? "Available" : "Unavailable"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {creative.bio}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {creative.skills.map((skill) => (
                              <Badge key={skill} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span>${creative.hourly_rate}/hr</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-muted-foreground" />
                              <span>{creative.rating.toFixed(1)} ({creative.completed_projects} projects)</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-4">
                        <div className="flex items-center justify-between w-full">
                          <Button variant="outline" size="sm" asChild>
                            <a href={creative.portfolio_url} target="_blank" rel="noopener noreferrer">
                              View Portfolio
                            </a>
                          </Button>
                          <Button size="sm">
                            Contact
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 