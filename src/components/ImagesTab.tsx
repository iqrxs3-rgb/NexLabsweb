'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'

interface GeneratedImage {
  id: string
  prompt: string
  url: string
  createdAt: string
}

export default function ImagesTab() {
  const [prompt, setPrompt] = useState('')
  const [size, setSize] = useState('1024x1024')
  const [generating, setGenerating] = useState(false)
  const [currentImage, setCurrentImage] = useState('')
  const [history, setHistory] = useState<GeneratedImage[]>([])

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    const projectId = getSelectedProjectId()
    if (!projectId) return

    try {
      const res = await fetch(`/api/image/history?projectId=${projectId}`)
      if (res.ok) {
        const data = await res.json()
        setHistory(data)
      }
    } catch (error) {
      console.error('Fetch history error:', error)
    }
  }

  const generateImage = async () => {
    if (!prompt.trim() || generating) return
    setGenerating(true)

    try {
      const encodedPrompt = encodeURIComponent(prompt)
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${size.split('x')[0]}&height=${size.split('x')[1]}&nologo=true`
      
      setCurrentImage(imageUrl)

      const projectId = getSelectedProjectId()
      if (projectId) {
        await fetch('/api/image/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            prompt,
            url: imageUrl,
          }),
        })
        fetchHistory()
      }
    } catch (error) {
      console.error('Generate image error:', error)
    } finally {
      setGenerating(false)
    }
  }

  const getSelectedProjectId = () => {
    return localStorage.getItem('selectedProjectId') || ''
  }

  return (
    <div className="h-full flex">
      <div className="flex-1 flex flex-col p-6">
        <div className="max-w-2xl mx-auto w-full space-y-4">
          <Textarea
            placeholder="Describe the image you want to generate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="resize-none"
          />

          <div className="flex gap-4">
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="512x512">512x512</SelectItem>
                <SelectItem value="1024x1024">1024x1024</SelectItem>
                <SelectItem value="1024x768">1024x768</SelectItem>
                <SelectItem value="768x1024">768x1024</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={generateImage} disabled={generating || !prompt.trim()} className="flex-1">
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Image'
              )}
            </Button>
          </div>

          {currentImage && (
            <div className="mt-6 rounded-lg overflow-hidden border border-white/10">
              <Image
                src={currentImage}
                alt={prompt}
                width={1024}
                height={1024}
                className="w-full h-auto"
                unoptimized
              />
            </div>
          )}
        </div>
      </div>

      <div className="w-80 border-l border-white/10 p-4 overflow-y-auto">
        <h3 className="text-sm font-semibold text-white mb-4">History</h3>
        <div className="space-y-3">
          {history.map((img) => (
            <div
              key={img.id}
              className="cursor-pointer rounded-lg overflow-hidden border border-white/10 hover:border-primary/50 transition-colors"
              onClick={() => {
                setCurrentImage(img.url)
                setPrompt(img.prompt)
              }}
            >
              <Image
                src={img.url}
                alt={img.prompt}
                width={320}
                height={320}
                className="w-full h-auto"
                unoptimized
              />
              <div className="p-2">
                <p className="text-xs text-gray-400 line-clamp-2">{img.prompt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}