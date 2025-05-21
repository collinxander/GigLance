"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Image, Heart, MessageCircle, Share2, MoreVertical, Search } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Post {
  id: string
  content: string
  media_urls: string[]
  created_at: string
  user: {
    id: string
    full_name: string
    avatar_url: string
    role: string
  }
  likes_count: number
  comments_count: number
  is_liked: boolean
}

export default function FeedPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState('')
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('feed')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) throw sessionError
      
      if (!session) {
        router.push('/login')
        return
      }

      fetchPosts()
    } catch (error) {
      console.error('Error checking session:', error)
    }
  }

  const fetchPosts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:profiles(id, full_name, avatar_url, role),
          likes:post_likes(user_id),
          comments:post_comments(count)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedPosts = data.map(post => ({
        ...post,
        likes_count: post.likes?.length || 0,
        comments_count: post.comments?.[0]?.count || 0,
        is_liked: post.likes?.some(like => like.user_id === session.user.id) || false
      }))

      setPosts(formattedPosts)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPost.trim() && mediaFiles.length === 0) return

    setUploading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session found')

      // Upload media files if any
      const mediaUrls = []
      for (const file of mediaFiles) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('post-media')
          .upload(`${session.user.id}/${fileName}`, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('post-media')
          .getPublicUrl(`${session.user.id}/${fileName}`)

        mediaUrls.push(publicUrl)
      }

      // Create post
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          content: newPost,
          media_urls: mediaUrls,
          user_id: session.user.id
        })

      if (postError) throw postError

      setNewPost('')
      setMediaFiles([])
      fetchPosts()
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const post = posts.find(p => p.id === postId)
      if (!post) return

      if (post.is_liked) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .match({ post_id: postId, user_id: session.user.id })
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: session.user.id })
      }

      fetchPosts()
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMediaFiles(Array.from(e.target.files))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Feed</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search creatives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/50 border-white/10 text-white"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            <form onSubmit={handleCreatePost} className="bg-white/5 rounded-lg p-4 space-y-4">
              <Textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share your work or thoughts..."
                className="bg-black/50 border-white/10 text-white"
                rows={3}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Image className="h-5 w-5 text-gray-400 hover:text-white" />
                  </label>
                  {mediaFiles.length > 0 && (
                    <span className="text-sm text-gray-400">
                      {mediaFiles.length} file(s) selected
                    </span>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={uploading || (!newPost.trim() && mediaFiles.length === 0)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Post'
                  )}
                </Button>
              </div>
            </form>

            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-white/5 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Report</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                      onClick={() => handleLike(post.id)}
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
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            {/* Discover content will be added here */}
            <div className="text-center text-gray-400">
              Discover new creatives and trending work coming soon...
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 