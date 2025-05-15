'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Search, Loader2 } from "lucide-react"
import Link from "next/link"

interface Conversation {
  id: string
  other_user: {
    id: string
    full_name: string
    avatar_url: string
  }
  last_message?: {
    content: string
    created_at: string
  }
  unread_count: number
}

export default function Messages() {
  const supabase = createClientComponentClient()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [totalUnread, setTotalUnread] = useState(0)

  useEffect(() => {
    fetchConversations()

    // Subscribe to new messages
    const subscription = supabase
      .channel('conversations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
      }, () => {
        fetchConversations()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          other_user:profiles!conversations_participant2_id_fkey(id, full_name, avatar_url),
          last_message:messages(content, created_at),
          unread_count:messages(count)
        `)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false })
        .limit(5)

      if (error) throw error

      const conversationsWithUnread = (data || []).map(conv => ({
        id: conv.id,
        other_user: {
          id: conv.other_user[0].id,
          full_name: conv.other_user[0].full_name,
          avatar_url: conv.other_user[0].avatar_url
        },
        last_message: conv.last_message?.[0] ? {
          content: conv.last_message[0].content,
          created_at: conv.last_message[0].created_at
        } : undefined,
        unread_count: conv.unread_count?.[0]?.count || 0
      }))

      setConversations(conversationsWithUnread)
      setTotalUnread(conversationsWithUnread.reduce((sum, conv) => sum + conv.unread_count, 0))
    } catch (err) {
      console.error('Error fetching conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.other_user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <MessageSquare className="h-5 w-5" />
          {totalUnread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
            >
              {totalUnread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Messages</DropdownMenuLabel>
        <div className="px-2 py-1.5">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No conversations found</p>
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <DropdownMenuItem key={conversation.id} asChild>
                <Link href={`/messages?conversation=${conversation.id}`} className="flex items-start gap-3 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={conversation.other_user.avatar_url} />
                    <AvatarFallback>
                      {conversation.other_user.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{conversation.other_user.full_name}</p>
                      {conversation.unread_count > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                    {conversation.last_message && (
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.last_message.content}
                      </p>
                    )}
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/messages" className="text-primary">
            View all messages
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 