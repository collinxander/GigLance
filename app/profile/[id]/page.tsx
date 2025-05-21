"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Edit2, UserPlus, UserMinus, Image, Link2, MapPin, Briefcase, X } from 'lucide-react'
import { motion } from 'framer-motion'

interface Profile {
  id: string
  full_name: string
  avatar_url: string
  bio: string
  location: string
  website: string
  company: string
  job_title: string
  role: string
  skills: string[]
  followers_count: number
  following_count: number
  is_following: boolean
}

interface Post {
  id: string
  content: string
  media_urls: string[]
  created_at: string
  likes_count: number
  comments_count: number
  is_liked: boolean
}

interface Follow {
  follower_id: string
}

interface Like {
  user_id: string
}

export default function ProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: '',
    bio: '',
    location: '',
    website: '',
    company: '',
    job_title: '',
    skills: [] as string[]
  })
  const [newSkill, setNewSkill] = useState('')
  const [isCurrentUser, setIsCurrentUser] = useState(false)
  const [activeTab, setActiveTab] = useState('posts')

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

      setIsCurrentUser(session.user.id === params.id)
      fetchProfile()
      fetchPosts()
    } catch (error) {
      console.error('Error checking session:', error)
    }
  }

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          followers:follows!follows_following_id_fkey(count),
          following:follows!follows_follower_id_fkey(count),
          is_following:follows!follows_follower_id_fkey(follower_id)
        `)
        .eq('id', params.id)
        .single()

      if (error) throw error

      const profileData = {
        ...data,
        followers_count: data.followers?.[0]?.count || 0,
        following_count: data.following?.[0]?.count || 0,
        is_following: data.is_following?.some((f: Follow) => f.follower_id === session.user.id) || false
      }

      setProfile(profileData)
      setEditForm({
        full_name: profileData.full_name,
        bio: profileData.bio || '',
        location: profileData.location || '',
        website: profileData.website || '',
        company: profileData.company || '',
        job_title: profileData.job_title || '',
        skills: profileData.skills || []
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
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
          likes:post_likes(user_id),
          comments:post_comments(count)
        `)
        .eq('user_id', params.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedPosts = data.map(post => ({
        ...post,
        likes_count: post.likes?.length || 0,
        comments_count: post.comments?.[0]?.count || 0,
        is_liked: post.likes?.some((like: Like) => like.user_id === session.user.id) || false
      }))

      setPosts(formattedPosts)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !profile) return

      if (profile.is_following) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .match({ follower_id: session.user.id, following_id: profile.id })
      } else {
        // Follow
        await supabase
          .from('follows')
          .insert({ follower_id: session.user.id, following_id: profile.id })
      }

      fetchProfile()
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          bio: editForm.bio,
          location: editForm.location,
          website: editForm.website,
          company: editForm.company,
          job_title: editForm.job_title,
          skills: editForm.skills
        })
        .eq('id', session.user.id)

      if (error) throw error

      setIsEditing(false)
      fetchProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !editForm.skills.includes(newSkill.trim())) {
      setEditForm(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setEditForm(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white/5 rounded-lg p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback>
                  {profile.full_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                {isEditing ? (
                  <Input
                    value={editForm.full_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                    className="bg-black/50 border-white/10 text-white"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-white">{profile.full_name}</h1>
                )}
                <p className="text-gray-400">{profile.role}</p>
              </div>
            </div>
            {!isCurrentUser ? (
              <Button
                onClick={handleFollow}
                variant={profile.is_following ? "outline" : "default"}
                className={profile.is_following ? "border-white/10" : "bg-purple-600 hover:bg-purple-700"}
              >
                {profile.is_following ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-2" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant="outline"
                className="border-white/10"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Bio</label>
                <Textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  className="bg-black/50 border-white/10 text-white"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                  <Input
                    value={editForm.location}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    className="bg-black/50 border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Website</label>
                  <Input
                    value={editForm.website}
                    onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                    className="bg-black/50 border-white/10 text-white"
                  />
                </div>
              </div>

              {profile.role === 'hiring' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
                    <Input
                      value={editForm.company}
                      onChange={(e) => setEditForm(prev => ({ ...prev, company: e.target.value }))}
                      className="bg-black/50 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Job Title</label>
                    <Input
                      value={editForm.job_title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, job_title: e.target.value }))}
                      className="bg-black/50 border-white/10 text-white"
                    />
                  </div>
                </div>
              )}

              {profile.role === 'creative' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Skills</label>
                  <div className="flex items-center space-x-2 mb-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      className="bg-black/50 border-white/10 text-white"
                    />
                    <Button
                      onClick={handleAddSkill}
                      variant="outline"
                      className="border-white/10"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editForm.skills.map((skill) => (
                      <div
                        key={skill}
                        className="flex items-center space-x-1 bg-white/10 rounded-full px-3 py-1"
                      >
                        <span className="text-sm text-white">{skill}</span>
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleUpdateProfile}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {profile.bio && <p className="text-gray-300">{profile.bio}</p>}
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                {profile.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {profile.location}
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center">
                    <Link2 className="h-4 w-4 mr-1" />
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white"
                    >
                      {profile.website}
                    </a>
                  </div>
                )}
                {profile.company && (
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-1" />
                    {profile.company}
                  </div>
                )}
              </div>

              {profile.role === 'creative' && profile.skills && profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-white/10 rounded-full px-3 py-1 text-sm text-white"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center space-x-6 pt-4 border-t border-white/10">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{profile.followers_count}</div>
              <div className="text-sm text-gray-400">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{profile.following_count}</div>
              <div className="text-sm text-gray-400">Following</div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 rounded-lg p-4 space-y-4"
              >
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

                <div className="flex items-center space-x-6 text-sm text-gray-400">
                  <div>{new Date(post.created_at).toLocaleDateString()}</div>
                  <div>{post.likes_count} likes</div>
                  <div>{post.comments_count} comments</div>
                </div>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <div className="bg-white/5 rounded-lg p-6 space-y-6">
              <h2 className="text-xl font-semibold text-white">About</h2>
              
              <div className="space-y-4">
                {profile.role === 'creative' && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill) => (
                          <span
                            key={skill}
                            className="bg-white/10 rounded-full px-3 py-1 text-sm text-white"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {profile.role === 'hiring' && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Company</h3>
                      <p className="text-white">{profile.company}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Job Title</h3>
                      <p className="text-white">{profile.job_title}</p>
                    </div>
                  </>
                )}

                {profile.location && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Location</h3>
                    <p className="text-white">{profile.location}</p>
                  </div>
                )}

                {profile.website && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Website</h3>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300"
                    >
                      {profile.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 