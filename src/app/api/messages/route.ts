import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID required' },
        { status: 400 }
      )
    }

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: { project: true },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    if (conversation.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const messages = await db.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId, role, content } = await req.json()

    if (!conversationId || !role || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: { project: true },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    if (conversation.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const message = await db.message.create({
      data: {
        conversationId,
        role,
        content,
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Create message error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}