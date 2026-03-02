import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const audio = formData.get('audio') as File

    if (!audio) {
      return NextResponse.json({ error: 'Audio file required' }, { status: 400 })
    }

    const transcription = await groq.audio.transcriptions.create({
      file: audio,
      model: 'whisper-large-v3',
      language: 'ar',
    })

    return NextResponse.json({ text: transcription.text })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    )
  }
}