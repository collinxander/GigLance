'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, Send } from "lucide-react"

interface ApplicationFormProps {
  gigId: string
  gigTitle: string
  trigger?: React.ReactNode
}

export default function ApplicationForm({ gigId, gigTitle, trigger }: ApplicationFormProps) {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    coverLetter: '',
    proposedBudget: '',
    estimatedDuration: '',
    portfolioUrl: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Check if user has already applied
      const { data: existingApplication } = await supabase
        .from('applications')
        .select('id')
        .eq('gig_id', gigId)
        .eq('creative_id', user.id)
        .single()

      if (existingApplication) {
        throw new Error('You have already applied to this gig')
      }

      // Create the application
      const { error: applicationError } = await supabase
        .from('applications')
        .insert({
          gig_id: gigId,
          creative_id: user.id,
          cover_letter: formData.coverLetter,
          proposed_budget: formData.proposedBudget,
          estimated_duration: formData.estimatedDuration,
          portfolio_url: formData.portfolioUrl,
          status: 'pending'
        })

      if (applicationError) throw applicationError

      // Create a conversation between the client and creative
      const { data: gig } = await supabase
        .from('gigs')
        .select('client_id')
        .eq('id', gigId)
        .single()

      if (!gig) throw new Error('Gig not found')

      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          gig_id: gigId,
          participant1_id: user.id,
          participant2_id: gig.client_id,
        })
        .select()
        .single()

      if (conversationError) throw conversationError

      // Send initial message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          content: `I've applied to your gig "${gigTitle}". Let's discuss the details!`
        })

      if (messageError) throw messageError

      setIsOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Apply Now</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Apply for {gigTitle}</DialogTitle>
          <DialogDescription>
            Submit your application to be considered for this gig. Make sure to highlight your relevant experience and skills.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="coverLetter" className="text-sm font-medium">
              Cover Letter
            </label>
            <Textarea
              id="coverLetter"
              placeholder="Tell us why you're the best fit for this gig..."
              value={formData.coverLetter}
              onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
              required
              className="min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="proposedBudget" className="text-sm font-medium">
                Proposed Budget
              </label>
              <Input
                id="proposedBudget"
                type="text"
                placeholder="e.g., $500"
                value={formData.proposedBudget}
                onChange={(e) => setFormData(prev => ({ ...prev, proposedBudget: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="estimatedDuration" className="text-sm font-medium">
                Estimated Duration
              </label>
              <Input
                id="estimatedDuration"
                type="text"
                placeholder="e.g., 2 weeks"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="portfolioUrl" className="text-sm font-medium">
              Portfolio URL
            </label>
            <Input
              id="portfolioUrl"
              type="url"
              placeholder="https://your-portfolio.com"
              value={formData.portfolioUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Application
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 