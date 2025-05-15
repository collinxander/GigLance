'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { useRouter } from 'next/navigation'

interface SaveGigButtonProps {
  gigId: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export default function SaveGigButton({ gigId, variant = 'outline', size = 'sm' }: SaveGigButtonProps) {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkIfSaved()
  }, [gigId])

  const checkIfSaved = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsSaved(false)
        return
      }

      const { data } = await supabase
        .from('saved_gigs')
        .select('id')
        .eq('gig_id', gigId)
        .eq('user_id', user.id)
        .single()

      setIsSaved(!!data)
    } catch (error) {
      console.error('Error checking saved status:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      if (isSaved) {
        // Unsave the gig
        await supabase
          .from('saved_gigs')
          .delete()
          .eq('gig_id', gigId)
          .eq('user_id', user.id)
      } else {
        // Save the gig
        await supabase
          .from('saved_gigs')
          .insert({
            gig_id: gigId,
            user_id: user.id
          })
      }

      setIsSaved(!isSaved)
      router.refresh()
    } catch (error) {
      console.error('Error toggling save:', error)
    }
  }

  if (loading) {
    return (
      <Button variant={variant} size={size} disabled>
        <Bookmark className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleSave}
      className={isSaved ? 'text-primary' : ''}
    >
      {isSaved ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
    </Button>
  )
} 