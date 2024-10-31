'use client'

import { useState, useRef, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import { useChatStore } from '@/lib/stores/chat'
import { useAgentsStore } from '@/lib/stores/agents'

export function MessageInput() {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const addMessage = useChatStore((state) => state.addMessage)
  const setTyping = useChatStore((state) => state.setTyping)
  const { startProcessing } = useAgentsStore()

  const handleSubmit = () => {
    if (!message.trim()) return

    // Add user message
    addMessage({
      role: 'user',
      content: message.trim(),
    })

    // Clear input and start processing
    setMessage('')
    setTyping(true)
    startProcessing(message.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  return (
    <div className="border-t p-4">
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          placeholder="Type your message..."
          className="min-h-[60px] max-h-[200px] resize-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          size="icon"
          className="h-[60px] w-[60px]"
          onClick={handleSubmit}
          disabled={!message.trim()}
        >
          <Send className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </div>
  )
}