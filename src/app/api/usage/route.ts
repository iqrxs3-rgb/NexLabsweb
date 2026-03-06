import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id }
    })

    const plan = user?.plan || 'free'

    const projects = await db.project.count({
      where: { userId: session.user.id }
    })

    const conversations = await db.conversation.count({
      where: { project: { userId: session.user.id } }
    })

    const images = await db.generatedImage.count({
      where: { project: { userId: session.user.id } }
    })

    const messages = await db.message.count({
      where: { conversation: { project: { userId: session.user.id } } }
    })

    return NextResponse.json({
      plan,
      usage: {
        projects,
        conversations,
        images,
        messages,
      },
      limits: {
        projects: plan === 'enterprise' ? -1 : plan === 'pro' ? 20 : 3,
        images: plan === 'enterprise' ? 1000 : plan === 'pro' ? 100 : 10,
        messages: plan === 'enterprise' ? 10000 : plan === 'pro' ? 1000 : 100,
      }
    })
  } catch (error) {
    console.error('Usage error:', error)
    return NextResponse.json({ error: 'Failed to get usage' }, { status: 500 })
  }
}
