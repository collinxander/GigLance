'use client'

import { useState } from 'react'
import { useChat } from '@/components/providers/ChatProvider'
import { format } from 'date-fns'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export function ConversationList() {
  const { conversations, currentConversation, setCurrentConversation, unreadCount } = useChat()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = conversations.filter(conversation => {
    const searchLower = searchQuery.toLowerCase()
    return (
      conversation.other_user?.full_name.toLowerCase().includes(searchLower) ||
      conversation.gig_id?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="flex flex-col h-full border-r">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Conversations list */}
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setCurrentConversation(conversation)}
              className={cn(
                'w-full p-4 hover:bg-muted/50 transition-colors',
                currentConversation?.id === conversation.id && 'bg-muted'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={conversation.other_user?.avatar_url || undefined} />
                    <AvatarFallback>
                      {conversation.other_user?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold truncate">
                      {conversation.other_user?.full_name}
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(conversation.last_message_at), 'MMM d')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.gig_id ? 'Gig Discussion' : 'Direct Message'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
} 