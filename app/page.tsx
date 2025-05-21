'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Briefcase, Star, Users, Rocket, Shield, ChevronRight, Search, Filter, MapPin, DollarSign, Clock, LucideIcon, TrendingUp, Award, Zap } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Testimonial {
  id: string
  quote: string
  author: string
  role: string
  rating: number
  created_at: string
}

interface Feature {
  id: string
  icon: string
  title: string
  description: string
  created_at: string
}

interface Category {
  name: string
  count: number
}

interface SupabaseGig {
  id: string
  title: string
  budget: string
  category: string
  location: string
  duration: string
  client: {
    full_name: string
    avatar_url: string
  }
}

interface Stats {
  activeGigs: number
  activeGiglancers: number
  successRate: number
}

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [popularCategories, setPopularCategories] = useState<Category[]>([])
  const [trendingGigs, setTrendingGigs] = useState<SupabaseGig[]>([])
  const [stats, setStats] = useState<Stats>({ activeGigs: 0, activeGiglancers: 0, successRate: 0 })
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const prefersReducedMotion = useReducedMotion()
  const supabase = createClientComponentClient()
  const [isHovered, setIsHovered] = useState(false)

  // Map of icon names to Lucide icons
  const iconMap: { [key: string]: LucideIcon } = {
    Briefcase,
    Users,
    Rocket,
    Shield,
    TrendingUp,
    Award,
    Zap,
    Star,
    Search,
    Filter,
    MapPin,
    DollarSign,
    Clock,
    ChevronRight,
    ArrowRight
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (prefersReducedMotion) return
    setMousePosition({ x: e.clientX, y: e.clientY })
  }, [prefersReducedMotion])

  useEffect(() => {
    if (prefersReducedMotion) return
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove, prefersReducedMotion])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const { data: categoryData, error: categoryError } = await supabase
          .from('gigs')
          .select('category')
          .eq('status', 'open')

        if (categoryError) throw categoryError

        // Count occurrences of each category
        const categoryCounts = categoryData.reduce((acc: { [key: string]: number }, gig) => {
          acc[gig.category] = (acc[gig.category] || 0) + 1
          return acc
        }, {})

        // Convert to array and sort by count
        const categories = Object.entries(categoryCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6) // Get top 6 categories

        setPopularCategories(categories)

        // Fetch trending gigs
        const { data: gigsData, error: gigsError } = await supabase
          .from('gigs')
          .select(`
            id,
            title,
            budget,
            category,
            location,
            duration,
            client:profiles!inner(full_name, avatar_url)
          `)
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(3)

        if (gigsError) throw gigsError

        // Fetch statistics
        const { data: statsData, error: statsError } = await supabase
          .from('gigs')
          .select('status, completed_at')
          .eq('status', 'open')

        const { data: completedGigs, error: completedError } = await supabase
          .from('gigs')
          .select('status, completed_at')
          .eq('status', 'completed')

        const { data: giglancers, error: giglancersError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_type', 'creative')
          .eq('is_active', true)

        if (statsError || completedError || giglancersError) throw statsError || completedError || giglancersError

        // Calculate success rate
        const totalGigs = (statsData?.length || 0) + (completedGigs?.length || 0)
        const successRate = totalGigs > 0 
          ? Math.round((completedGigs?.length || 0) / totalGigs * 100)
          : 0

        setStats({
          activeGigs: statsData?.length || 0,
          activeGiglancers: giglancers?.length || 0,
          successRate
        })

        // Fetch testimonials
        const { data: testimonialsData, error: testimonialsError } = await supabase
          .from('testimonials')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3)

        if (testimonialsError) throw testimonialsError
        setTestimonials(testimonialsData || [])

        // Fetch features
        const { data: featuresData, error: featuresError } = await supabase
          .from('features')
          .select('*')
          .order('created_at', { ascending: true })

        if (featuresError) throw featuresError
        setFeatures(featuresData || [])
        
        // Transform the data to match the TrendingGig interface
        const transformedGigs = (gigsData || []).map(gig => ({
          id: String(gig.id),
          title: String(gig.title),
          budget: String(gig.budget),
          category: String(gig.category),
          location: String(gig.location),
          duration: String(gig.duration),
          client: {
            full_name: String(gig.client[0]?.full_name || ''),
            avatar_url: String(gig.client[0]?.avatar_url || '')
          }
        }))

        setTrendingGigs(transformedGigs)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/gigs?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const animationProps = {
    initial: prefersReducedMotion ? {} : { opacity: 0, y: 20 },
    animate: prefersReducedMotion ? {} : { opacity: 1, y: 0 },
    transition: { duration: 0.8 }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6">
              Your Gateway to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                GigLance Success
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Connect with top clients, showcase your skills, and build your giglance career with GigLance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-300"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                Get Started
                <ArrowRight
                  className={`ml-2 h-5 w-5 transition-transform duration-300 ${
                    isHovered ? "translate-x-1" : ""
                  }`}
                />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-6 py-3 border border-border text-base font-medium rounded-lg text-foreground bg-background hover:bg-accent/50 transition-colors duration-300"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search Section */}
      <div className="py-12 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for gigs, skills, or keywords..."
                className="pl-10 py-6 text-lg bg-background border-input text-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700"
              >
                Search
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-6 rounded-lg bg-card border shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-500/10">
                  <TrendingUp className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.activeGigs.toLocaleString()}</p>
                  <p className="text-muted-foreground">Active Gigs</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-6 rounded-lg bg-card border shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-500/10">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.activeGiglancers.toLocaleString()}</p>
                  <p className="text-muted-foreground">Active Giglancers</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-6 rounded-lg bg-card border shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-500/10">
                  <Award className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.successRate}%</p>
                  <p className="text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Popular Categories */}
      <div className="py-12 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Popular Categories
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse through our most active categories and find the perfect gig for your skills.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center text-muted-foreground">Loading categories...</div>
            ) : (
              popularCategories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link
                    href={`/gigs?category=${encodeURIComponent(category.name)}`}
                    className="block p-6 rounded-lg bg-card border hover:border-purple-500/50 transition-colors duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-foreground">
                        {category.name}
                      </h3>
                      <span className="text-muted-foreground">{category.count} gigs</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-purple-500 mt-2" />
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Trending Gigs */}
      <div className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Trending Gigs
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Check out the latest and most popular gigs on our platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center text-muted-foreground">Loading trending gigs...</div>
            ) : (
              trendingGigs.map((gig, index) => (
                <motion.div
                  key={gig.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link
                    href={`/gigs/${gig.id}`}
                    className="block p-6 rounded-lg bg-card border hover:border-purple-500/50 transition-colors duration-300"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                          {gig.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{gig.category}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {gig.budget}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        {gig.location}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {gig.duration}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform provides all the tools and features you need to build a successful giglance career.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              <div className="col-span-full text-center text-muted-foreground">Loading features...</div>
            ) : (
              features.map((feature, index) => {
                const Icon = iconMap[feature.icon]
                return (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="p-6 rounded-lg bg-card border hover:border-purple-500/50 transition-colors duration-300"
                  >
                    <div className="text-purple-500 mb-4">
                      {Icon && <Icon className="h-6 w-6" aria-hidden="true" />}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </motion.div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Trusted by Giglancers Worldwide
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of successful giglancers who have found their dream projects on GigLance.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full text-center text-muted-foreground">Loading testimonials...</div>
            ) : (
              testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 rounded-lg bg-card border"
                >
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.quote}"</p>
                  <div>
                    <p className="text-foreground font-semibold">{testimonial.author}</p>
                    <p className="text-muted-foreground">{testimonial.role}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-b from-background to-purple-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Start Your GigLance Journey?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join our community of talented giglancers and start finding your dream projects today.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-300"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
