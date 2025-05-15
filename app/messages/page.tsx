'use client'

import { ChatProvider } from '@/components/providers/ChatProvider'
import { ConversationList } from '@/components/chat/ConversationList'
import { ChatWindow } from '@/components/chat/ChatWindow'

export default function MessagesPage() {
  return (
    <ChatProvider>
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="w-80">
          <ConversationList />
        </div>
        <div className="flex-1">
          <ChatWindow />
        </div>
      </div>
    </ChatProvider>
  )
} 