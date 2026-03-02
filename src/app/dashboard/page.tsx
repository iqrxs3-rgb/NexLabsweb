'use client'

import { useState, useEffect } from 'react'
import ChatTab from '@/components/ChatTab'
import CodeTab from '@/components/CodeTab'
import ImagesTab from '@/components/ImagesTab'
import VoiceTab from '@/components/VoiceTab'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('chat')

  useEffect(() => {
    const handleTabChange = () => {
      const tab = document.querySelector('[data-state="active"]')?.getAttribute('value')
      if (tab) setActiveTab(tab)
    }

    const observer = new MutationObserver(handleTabChange)
    const tabsList = document.querySelector('[role="tablist"]')
    
    if (tabsList) {
      observer.observe(tabsList, { attributes: true, subtree: true })
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div className="h-full">
      {activeTab === 'chat' && <ChatTab />}
      {activeTab === 'code' && <CodeTab />}
      {activeTab === 'images' && <ImagesTab />}
      {activeTab === 'voice' && <VoiceTab />}
    </div>
  )
}