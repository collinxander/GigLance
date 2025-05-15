'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@/components/providers/ChatProvider'
import { format } from 'date-fns'
import { Paperclip, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export function ChatWindow() {
  const { currentConversation, messages, sendMessage } = useChat()
  const [newMessage, setNewMessage] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!newMessage.trim() && attachments.length === 0) return

    setIsSending(true)
    try {
      await sendMessage(newMessage, attachments)
      setNewMessage('')
      setAttachments([])
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  if (!currentConversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Select a conversation to start chatting</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Avatar>
          <AvatarImage src={currentConversation.other_user?.avatar_url || undefined} />
          <AvatarFallback>
            {currentConversation.other_user?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{currentConversation.other_user?.full_name}</h3>
          <p className="text-sm text-muted-foreground">
            {currentConversation.gig_id ? 'Gig Discussion' : 'Direct Message'}
          </p>
        </div>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3 max-w-[80%]',
                message.sender_id === currentConversation.client_id ? 'ml-auto' : 'mr-auto'
              )}
            >
              {message.sender_id !== currentConversation.client_id && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentConversation.other_user?.avatar_url || undefined} />
                  <AvatarFallback>
                    {currentConversation.other_user?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'rounded-lg p-3',
                  message.sender_id === currentConversation.client_id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.file_attachments && message.file_attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.file_attachments.map((file) => (
                      <a
                        key={file.id}
                        href={`/api/messages/${message.id}/attachments/${file.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm hover:underline"
                      >
                        <Paperclip className="h-4 w-4" />
                        {file.file_name}
                      </a>
                    ))}
                  </div>
                )}
                <span className="text-xs opacity-70 mt-1 block">
                  {format(new Date(message.created_at), 'h:mm a')}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="p-4 border-t">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 text-sm"
              >
                <Paperclip className="h-4 w-4" />
                <span className="truncate max-w-[200px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleSend}
            disabled={isSending || (!newMessage.trim() && attachments.length === 0)}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
} 