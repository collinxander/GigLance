'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Briefcase,
  Search,
  Filter,
  ChevronDown,
  Bookmark,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Building2,
  Loader2,
  AlertCircle,
  SlidersHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import ApplicationForm from "@/components/ApplicationForm"
import SaveGigButton from "@/components/SaveGigButton"

interface Gig {
  id: string
  title: string
  description: string
  budget: string
  category: string
  location: string
  duration: string
  skills: string[]
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  client_id: string
  created_at: string
  updated_at: string
  client?: {
    full_name: string
    avatar_url: string
  }
}

interface Filters {
  category: string[]
  duration: string[]
  location: string[]
  budget: string[]
}

const categories = [
  "Web Development",
  "Design",
  "Writing",
  "Marketing",
  "Video & Animation",
  "Music & Audio",
  "Programming",
  "Business"
]

const durations = [
  "Less than a week",
  "1-2 weeks",
  "2-4 weeks",
  "1-3 months",
  "3-6 months",
  "More than 6 months"
]

const locations = [
  "Remote",
  "On-site",
  "Hybrid"
]

const budgets = [
  "Under $500",
  "$500-$1000",
  "$1000-$2000",
  "$2000-$5000",
  "Over $5000"
]

export default function GigsPage() {
  const supabase = createClientComponentClient()
  const [activeTab, setActiveTab] = useState("discover")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<Filters>({
    category: [],
    duration: [],
    location: [],
    budget: [],
  })
  const [sortBy, setSortBy] = useState("newest")
  const [gigs, setGigs] = useState<Gig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGigs()
  }, [searchQuery, selectedFilters, sortBy])

  const fetchGigs = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('gigs')
        .select(`
          *,
          client:profiles(full_name, avatar_url)
        `)
        .eq('status', 'open')

      // Apply search
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      // Apply filters
      if (selectedFilters.category.length > 0) {
        query = query.in('category', selectedFilters.category)
      }
      if (selectedFilters.duration.length > 0) {
        query = query.in('duration', selectedFilters.duration)
      }
      if (selectedFilters.location.length > 0) {
        query = query.in('location', selectedFilters.location)
      }
      if (selectedFilters.budget.length > 0) {
        query = query.in('budget', selectedFilters.budget)
      }

      // Apply sorting
      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false })
      } else if (sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true })
      }

      const { data, error } = await query

      if (error) throw error
      setGigs(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (category: keyof Filters, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }))
  }

  const clearFilters = () => {
    setSelectedFilters({
      category: [],
      duration: [],
      location: [],
      budget: [],
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">GigLance</span>
            </div>

            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search for gigs, skills, or people" 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {Object.values(selectedFilters).some(f => f.length > 0) && (
                      <Badge variant="secondary" className="ml-2">
                        {Object.values(selectedFilters).reduce((acc, curr) => acc + curr.length, 0)}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Gigs</SheetTitle>
                    <SheetDescription>
                      Select your preferences to find the perfect gig
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Category</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {categories.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`category-${category}`}
                              checked={selectedFilters.category.includes(category)}
                              onChange={() => handleFilterChange("category", category)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <label htmlFor={`category-${category}`}>{category}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-medium">Duration</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {durations.map((duration) => (
                          <div key={duration} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`duration-${duration}`}
                              checked={selectedFilters.duration.includes(duration)}
                              onChange={() => handleFilterChange("duration", duration)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <label htmlFor={`duration-${duration}`}>{duration}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-medium">Location</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {locations.map((location) => (
                          <div key={location} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`location-${location}`}
                              checked={selectedFilters.location.includes(location)}
                              onChange={() => handleFilterChange("location", location)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <label htmlFor={`location-${location}`}>{location}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-medium">Budget</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {budgets.map((budget) => (
                          <div key={budget} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`budget-${budget}`}
                              checked={selectedFilters.budget.includes(budget)}
                              onChange={() => handleFilterChange("budget", budget)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <label htmlFor={`budget-${budget}`}>{budget}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={clearFilters}>
                        Clear All
                      </Button>
                      <Button className="flex-1">
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Sort by: {sortBy === 'newest' ? 'Newest' : 'Oldest'}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy('newest')}>
                    Newest
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                    Oldest
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <Tabs defaultValue="discover" className="space-y-6" onValueChange={setActiveTab}>
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="discover">Discover</TabsTrigger>
                <TabsTrigger value="applied">Applied</TabsTrigger>
                <TabsTrigger value="saved">Saved</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="discover" className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Error loading gigs</h3>
                  <p className="text-muted-foreground">{error}</p>
                </div>
              ) : gigs.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No gigs found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {gigs.map((gig) => (
                    <Card key={gig.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="line-clamp-2">{gig.title}</CardTitle>
                            <CardDescription className="mt-1">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                <span>{gig.client?.full_name || 'Anonymous'}</span>
                              </div>
                            </CardDescription>
                          </div>
                          <SaveGigButton gigId={gig.id} />
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {gig.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {gig.skills.map((skill) => (
                              <Badge key={skill} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span>{gig.budget}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{gig.duration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{gig.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{new Date(gig.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-4">
                        <div className="flex items-center justify-between w-full">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/gigs/${gig.id}`}>
                              View Details
                            </Link>
                          </Button>
                          <ApplicationForm
                            gigId={gig.id}
                            gigTitle={gig.title}
                            trigger={
                              <Button size="sm">
                                Apply Now
                              </Button>
                            }
                          />
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="applied">
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                <p className="text-muted-foreground">Start applying to gigs to see them here</p>
              </div>
            </TabsContent>

            <TabsContent value="saved">
              <div className="text-center py-12">
                <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No saved gigs</h3>
                <p className="text-muted-foreground">Save gigs you're interested in to view them later</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
} 