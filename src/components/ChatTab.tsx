'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Send, Trash2 } from 'lucide-react'

interface Message {
  id: string
  role: string
  content: string
}

interface Conversation {
  id: string
  title: string
}

export default function ChatTab() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.id)
    }
  }, [selectedConv])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    const projectId = getSelectedProjectId()
    if (!projectId) return

    try {
      const res = await fetch(`/api/conversations?projectId=${projectId}`)
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
        if (data.length > 0 && !selectedConv) {
          setSelectedConv(data[0])
        }
      }
    } catch (error) {
      console.error('Fetch conversations error:', error)
    }
  }

  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/messages?conversationId=${convId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Fetch messages error:', error)
    }
  }

  const createConversation = async () => {
    const projectId = getSelectedProjectId()
    if (!projectId) return

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })

      if (res.ok) {
        const newConv = await res.json()
        setConversations([newConv, ...conversations])
        setSelectedConv(newConv)
        setMessages([])
      }
    } catch (error) {
      console.error('Create conversation error:', error)
    }
  }

  const deleteConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' })
      if (res.ok) {
        const newConvs = conversations.filter((c) => c.id !== id)
        setConversations(newConvs)
        if (selectedConv?.id === id) {
          setSelectedConv(newConvs[0] || null)
        }
      }
    } catch (error) {
      console.error('Delete conversation error:', error)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || !selectedConv || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    const tempUserMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      conversationId: selectedConv.id,
      createdAt: new Date(),
    }

    setMessages((prev) => [...prev, tempUserMsg])

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConv.id,
          role: 'user',
          content: userMessage,
        }),
      })

      const chatMessages = [...messages, tempUserMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatMessages }),
      })

      if (!res.ok || !res.body) throw new Error('Stream failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      const tempAssistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        conversationId: selectedConv.id,
        createdAt: new Date(),
      }

      setMessages((prev) => [...prev, tempAssistantMsg])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        assistantContent += chunk

        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempAssistantMsg.id ? { ...m, content: assistantContent } : m
          )
        )
      }

      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConv.id,
          role: 'assistant',
          content: assistantContent,
        }),
      })
    } catch (error) {
      console.error('Send message error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSelectedProjectId = () => {
    const sidebar = document.querySelector('[class*="bg-primary/10"]')
    return sidebar?.closest('[data-project-id]')?.getAttribute('data-project-id') || 
           document.querySelector('.p-3.rounded-lg.bg-primary\\/10')?.closest('div')?.getAttribute('data-project-id') ||
           localStorage.getItem('selectedProjectId')
  }

  return (
    <div className="h-full flex">
      <div className="w-64 border-r border-white/10 flex flex-col p-4">
        <Button onClick={createConversation} className="mb-4">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
        <div className="flex-1 overflow-y-auto space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`p-3 rounded-lg cursor-pointer group ${
                selectedConv?.id === conv.id
                  ? 'bg-primary/10 border border-primary/20'
                  : 'hover:bg-white/5'
              }`}
              onClick={() => setSelectedConv(conv)}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-white truncate flex-1">{conv.title}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteConversation(conv.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-secondary text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={loading}
            />
            <Button onClick={sendMessage} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}