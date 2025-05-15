'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'

interface Review {
  id: string
  rating: number
  title: string
  content: string
  status: 'Pending' | 'Approved' | 'Rejected'
  created_at: string
  reviewer: {
    full_name: string
    avatar_url: string | null
  }
}

interface ReviewCardProps {
  review: Review
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        setIsAdmin(profile?.role === 'admin')
      }
    }

    checkAdminStatus()
  }, [supabase])

  const handleStatusChange = async (newStatus: 'Approved' | 'Rejected') => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: newStatus })
        .eq('id', review.id)

      if (error) throw error
    } catch (err) {
      console.error('Error updating review status:', err)
    }
  }

  return (
    <Card className={`transition-all duration-200 ${isExpanded ? 'shadow-lg' : ''}`}>
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{review.title}</CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
          <Badge
            variant={
              review.status === 'Approved'
                ? 'default'
                : review.status === 'Rejected'
                ? 'destructive'
                : 'secondary'
            }
          >
            {review.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {review.reviewer.avatar_url ? (
              <img
                src={review.reviewer.avatar_url}
                alt={review.reviewer.full_name}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-sm">
                  {review.reviewer.full_name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium">{review.reviewer.full_name}</p>
            </div>
          </div>

          <p className={`text-gray-600 ${!isExpanded && 'line-clamp-3'}`}>
            {review.content}
          </p>

          {review.content.length > 200 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}

          {isAdmin && review.status === 'Pending' && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleStatusChange('Approved')}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
              >
                Approve
              </button>
              <button
                onClick={() => handleStatusChange('Rejected')}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 