'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Briefcase,
  User,
  Clock,
  DollarSign,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"

interface Application {
  id: string
  gig_id: string
  creative_id: string
  cover_letter: string
  proposed_budget: string
  estimated_duration: string
  portfolio_url: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  gig: {
    title: string
    client_id: string
  }
  creative: {
    full_name: string
    avatar_url: string
  }
}

export default function ApplicationsPage() {
  const supabase = createClientComponentClient()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('received')

  useEffect(() => {
    fetchApplications()
  }, [activeTab])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Not authenticated')

      let query = supabase
        .from('applications')
        .select(`
          *,
          gig:gigs(title, client_id),
          creative:profiles(full_name, avatar_url)
        `)

      if (activeTab === 'received') {
        // For clients: show applications for their gigs
        query = query.eq('gig.client_id', user.id)
      } else {
        // For creatives: show their applications
        query = query.eq('creative_id', user.id)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleApplicationStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId)

      if (error) throw error

      // Refresh the applications list
      fetchApplications()
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Applications</h1>
        </div>

        <Tabs defaultValue="received" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="received">Received</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Error loading applications</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No applications received</h3>
                <p className="text-muted-foreground">Applications for your gigs will appear here</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {applications.map((application) => (
                  <Card key={application.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{application.gig.title}</CardTitle>
                          <CardDescription className="mt-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{application.creative.full_name}</span>
                            </div>
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            application.status === 'accepted'
                              ? 'default'
                              : application.status === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {application.cover_letter}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>{application.proposed_budget}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{application.estimated_duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(application.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={application.portfolio_url}
                            target="_blank"
                            className="text-primary hover:underline"
                          >
                            View Portfolio
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                    {application.status === 'pending' && (
                      <CardFooter className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApplicationStatus(application.id, 'rejected')}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApplicationStatus(application.id, 'accepted')}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Accept
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Error loading applications</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No applications sent</h3>
                <p className="text-muted-foreground">Your applications will appear here</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {applications.map((application) => (
                  <Card key={application.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{application.gig.title}</CardTitle>
                          <CardDescription className="mt-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>Applied {new Date(application.created_at).toLocaleDateString()}</span>
                            </div>
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            application.status === 'accepted'
                              ? 'default'
                              : application.status === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {application.cover_letter}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>{application.proposed_budget}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{application.estimated_duration}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/messages?gig=${application.gig_id}`}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Message Client
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 