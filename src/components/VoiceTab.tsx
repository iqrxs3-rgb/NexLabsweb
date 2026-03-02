'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Mic, Square, Volume2 } from 'lucide-react'

export default function VoiceTab() {
  const [recording, setRecording] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [textToSpeak, setTextToSpeak] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await transcribeAudio(blob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setRecording(true)
    } catch (error) {
      console.error('Recording error:', error)
      alert('Could not access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const res = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        setTranscription(data.text)
      } else {
        alert('Transcription failed: ' + data.error)
      }
    } catch (error) {
      console.error('Transcribe error:', error)
      alert('Transcription error')
    }
  }

  const speakText = () => {
    if (!textToSpeak.trim() || speaking) return

    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    utterance.lang = 'ar-SA'
    utterance.rate = 1
    utterance.pitch = 1

    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Transcription Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Speech to Text</h2>
          <div className="flex gap-4">
            {!recording ? (
              <Button onClick={startRecording} className="flex-1">
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive" className="flex-1">
                <Square className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            )}
          </div>
          {transcription && (
            <div className="p-4 rounded-lg bg-secondary">
              <p className="text-sm text-white whitespace-pre-wrap">{transcription}</p>
            </div>
          )}
        </div>

        {/* Text to Speech Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Text to Speech</h2>
          <Textarea
            placeholder="Enter text to convert to speech..."
            value={textToSpeak}
            onChange={(e) => setTextToSpeak(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <div className="flex gap-4">
            {!speaking ? (
              <Button onClick={speakText} disabled={!textToSpeak.trim()} className="flex-1">
                <Volume2 className="h-4 w-4 mr-2" />
                Speak
              </Button>
            ) : (
              <Button onClick={stopSpeaking} variant="destructive" className="flex-1">
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}