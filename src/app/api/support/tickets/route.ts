import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notifySupportTicket } from '@/lib/discord-webhook'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tickets = await db.supportTicket.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(tickets)
  } catch (error) {
    console.error('Get tickets error:', error)
    return NextResponse.json({ error: 'Failed to get tickets' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subject, description, priority } = await req.json()

    if (!subject || !description) {
      return NextResponse.json({ error: 'Subject and description required' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id }
    })

    const ticket = await db.supportTicket.create({
      data: {
        subject,
        description,
        priority: priority || 'medium',
        userId: session.user.id
      }
    })

    await notifySupportTicket(subject, priority || 'medium', user?.email || '')

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error('Create ticket error:', error)
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
  }
}
