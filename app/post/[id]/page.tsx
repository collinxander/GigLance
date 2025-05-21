"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Heart, MessageCircle, Share2, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

interface Post {
  id: string
  content: string
  media_urls: string[]
  created_at: string
  user: {
    id: string
    full_name: string
    avatar_url: string
  }
  likes_count: number
  comments_count: number
  is_liked: boolean
}

interface Comment {
  id: string
  content: string
  created_at: string
  user: {
    id: string
    full_name: string
    avatar_url: string
  }
}

export default function PostPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    checkSession()
  }, [params.id])

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      fetchPost()
      fetchComments()
    } catch (error) {
      console.error('Error checking session:', error)
    }
  }

  const fetchPost = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:profiles(id, full_name, avatar_url),
          likes:post_likes(user_id),
          comments:post_comments(count)
        `)
        .eq('id', params.id)
        .single()

      if (error) throw error

      const formattedPost = {
        ...data,
        likes_count: data.likes?.length || 0,
        comments_count: data.comments?.[0]?.count || 0,
        is_liked: data.likes?.some((like: { user_id: string }) => like.user_id === session.user.id) || false
      }

      setPost(formattedPost)
    } catch (error) {
      console.error('Error fetching post:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          user:profiles(id, full_name, avatar_url)
        `)
        .eq('post_id', params.id)
        .order('created_at', { ascending: true })

      if (error) throw error

      setComments(data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleLike = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !post) return

      if (post.is_liked) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .match({ post_id: post.id, user_id: session.user.id })
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({ post_id: post.id, user_id: session.user.id })
      }

      fetchPost()
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: params.id,
          user_id: session.user.id,
          content: newComment.trim()
        })

      if (error) throw error

      setNewComment('')
      fetchComments()
      fetchPost()
    } catch (error) {
      console.error('Error posting comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Post not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-lg p-6 space-y-6"
        >
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={post.user.avatar_url} />
              <AvatarFallback>
                {post.user.full_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-white">{post.user.full_name}</div>
              <div className="text-sm text-gray-400">
                {new Date(post.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          <p className="text-white">{post.content}</p>

          {post.media_urls && post.media_urls.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {post.media_urls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Post media ${index + 1}`}
                  className="rounded-lg w-full h-48 object-cover"
                />
              ))}
            </div>
          )}

          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 ${
                post.is_liked ? 'text-red-500' : 'text-gray-400'
              }`}
            >
              <Heart className="h-5 w-5" />
              <span>{post.likes_count}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-400">
              <MessageCircle className="h-5 w-5" />
              <span>{post.comments_count}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-400">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        <div className="bg-white/5 rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold text-white">Comments</h2>

          <form onSubmit={handleComment} className="space-y-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="bg-black/50 border-white/10 text-white"
              rows={3}
            />
            <Button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post Comment'
              )}
            </Button>
          </form>

          <div className="space-y-6">
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex space-x-3"
              >
                <Avatar>
                  <AvatarImage src={comment.user.avatar_url} />
                  <AvatarFallback>
                    {comment.user.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white">
                      {comment.user.full_name}
                    </span>
                    <span className="text-sm text-gray-400">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300">{comment.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 