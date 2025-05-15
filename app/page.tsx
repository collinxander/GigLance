'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Briefcase, Star, Users, Rocket, Shield, ChevronRight, Search, Filter, MapPin, DollarSign, Clock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const features = [
  {
    title: 'Find Perfect Gigs',
    description: 'Browse through thousands of gigs that match your skills and preferences.',
    icon: Briefcase,
  },
  {
    title: 'Connect with Clients',
    description: 'Build relationships with clients and grow your professional network.',
    icon: Users,
  },
  {
    title: 'Fast Payments',
    description: 'Get paid quickly and securely through our trusted payment system.',
    icon: Rocket,
  },
  {
    title: 'Secure Platform',
    description: 'Work with confidence on our secure and reliable platform.',
    icon: Shield,
  },
]

interface Category {
  name: string
  count: number
}

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [popularCategories, setPopularCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const prefersReducedMotion = useReducedMotion()
  const supabase = createClientComponentClient()

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
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('gigs')
          .select('category')
          .eq('status', 'open')

        if (error) throw error

        // Count occurrences of each category
        const categoryCounts = data.reduce((acc: { [key: string]: number }, gig) => {
          acc[gig.category] = (acc[gig.category] || 0) + 1
          return acc
        }, {})

        // Convert to array and sort by count
        const categories = Object.entries(categoryCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6) // Get top 6 categories

        setPopularCategories(categories)
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const animationProps = {
    initial: prefersReducedMotion ? {} : { opacity: 0, y: 20 },
    animate: prefersReducedMotion ? {} : { opacity: 1, y: 0 },
    transition: { duration: 0.8 }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center">
        {/* Animated background */}
        {!prefersReducedMotion && (
          <div
            className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-indigo-900/20"
            style={{
              backgroundImage: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.15) 0%, transparent 50%)`,
              willChange: 'background-image',
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10 container px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            {...animationProps}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
              GIGLANCE
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Turn your skills into paychecks. Connect with freelance gigs and side jobs that match your expertise.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for gigs, skills, or keywords..."
                  className="pl-12 py-6 text-lg"
                />
                <Button className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  Search
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/gigs"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105"
              >
                <span className="relative z-10">Find Gigs</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link
                href="/post"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-foreground border-2 border-border rounded-lg overflow-hidden transition-all duration-300 hover:scale-105"
              >
                <span className="relative z-10">Post a Gig</span>
                <div className="absolute inset-0 bg-muted opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        {!prefersReducedMotion && (
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronRight className="h-6 w-6 text-muted-foreground rotate-90" />
          </motion.div>
        )}
      </div>

      {/* Popular Categories Section */}
      <div className="py-24 bg-muted/50">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div
            {...animationProps}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Popular Categories
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore our most popular categories and find the perfect gig for you
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="h-6 bg-muted rounded w-1/3"></div>
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            ) : (
              popularCategories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/gigs?category=${category.name.toLowerCase()}`}>
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-semibold">{category.name}</h3>
                          <span className="text-muted-foreground">{category.count} gigs</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div
            {...animationProps}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Everything You Need
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform provides all the tools and features you need to succeed
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative p-6 bg-card rounded-2xl border hover:border-primary/50 transition-all duration-300">
                  <feature.icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-muted/50">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div
            {...animationProps}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join GigLance today and start your journey to success
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="px-8">
                  Sign up for free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/gigs">
                <Button size="lg" variant="outline" className="px-8">
                  Browse Gigs
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
