'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { RealtimeChannel } from '@supabase/supabase-js'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  status: 'sent' | 'delivered' | 'read'
  created_at: string
  file_attachments?: FileAttachment[]
}

interface FileAttachment {
  id: string
  message_id: string
  file_name: string
  file_type: string
  file_size: number
  storage_path: string
  created_at: string
}

interface Conversation {
  id: string
  client_id: string
  creative_id: string
  gig_id: string | null
  last_message_at: string
  created_at: string
  updated_at: string
  other_user?: {
    id: string
    full_name: string
    avatar_url: string | null
  }
}

interface ChatContextType {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  sendMessage: (content: string, files?: File[]) => Promise<void>
  startConversation: (creativeId: string, gigId?: string) => Promise<string>
  setCurrentConversation: (conversation: Conversation | null) => void
  markAsRead: (messageId: string) => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  // Fetch conversations
  useEffect(() => {
    fetchConversations()
  }, [])

  // Set up real-time subscription
  useEffect(() => {
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const channel = supabase
        .channel('messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${currentConversation?.id}`
          },
          (payload) => {
            const newMessage = payload.new as Message
            setMessages(prev => [...prev, newMessage])
            markAsRead(newMessage.id)
          }
        )
        .subscribe()

      setChannel(channel)
    }

    setupSubscription()

    return () => {
      channel?.unsubscribe()
    }
  }, [currentConversation?.id])

  // Fetch unread count
  useEffect(() => {
    fetchUnreadCount()
  }, [])

  const fetchConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          other_user:users!conversations_creative_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .order('last_message_at', { ascending: false })

      if (error) throw error

      setConversations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          file_attachments(*)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error

      setMessages(data)
      markAllAsRead(conversationId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages')
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { count, error } = await supabase
        .from('message_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) throw error

      setUnreadCount(count || 0)
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
    }
  }

  const startConversation = async (creativeId: string, gigId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('conversations')
        .insert([
          {
            client_id: user.id,
            creative_id: creativeId,
            gig_id: gigId
          }
        ])
        .select()
        .single()

      if (error) throw error

      await fetchConversations()
      return data.id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start conversation')
      throw err
    }
  }

  const sendMessage = async (content: string, files?: File[]) => {
    try {
      if (!currentConversation) throw new Error('No active conversation')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Insert message
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: currentConversation.id,
            sender_id: user.id,
            content
          }
        ])
        .select()
        .single()

      if (messageError) throw messageError

      // Upload files if any
      if (files && files.length > 0) {
        const fileAttachments = await Promise.all(
          files.map(async (file) => {
            const filePath = `${user.id}/${currentConversation.id}/${file.name}`
            const { error: uploadError } = await supabase.storage
              .from('message-attachments')
              .upload(filePath, file)

            if (uploadError) throw uploadError

            return {
              message_id: message.id,
              file_name: file.name,
              file_type: file.type,
              file_size: file.size,
              storage_path: filePath
            }
          })
        )

        const { error: attachmentError } = await supabase
          .from('file_attachments')
          .insert(fileAttachments)

        if (attachmentError) throw attachmentError
      }

      // Update messages list
      setMessages(prev => [...prev, message])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
      throw err
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('message_notifications')
        .update({ is_read: true })
        .eq('message_id', messageId)

      if (error) throw error

      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark message as read:', err)
    }
  }

  const markAllAsRead = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('message_notifications')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)

      if (error) throw error

      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all messages as read:', err)
    }
  }

  const value = {
    conversations,
    currentConversation,
    messages,
    unreadCount,
    isLoading,
    error,
    sendMessage,
    startConversation,
    setCurrentConversation,
    markAsRead
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
} 