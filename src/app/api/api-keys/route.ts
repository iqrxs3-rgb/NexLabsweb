import crypto from 'crypto'
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
      where: { id: session.user.id },
      include: { apiKeys: true }
    })

    return NextResponse.json(user?.apiKeys || [])
  } catch (error) {
    console.error('Get API keys error:', error)
    return NextResponse.json({ error: 'Failed to get keys' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name } = await req.json()
    const key = `nx_${crypto.randomBytes(32).toString('hex')}`
    const hashedKey = crypto.createHash('sha256').update(key).digest('hex')

    const apiKey = await db.apiKey.create({
      data: {
        key: hashedKey,
        name: name || 'My API Key',
        userId: session.user.id
      }
    })

    return NextResponse.json({
      id: apiKey.id,
      name: apiKey.name,
      key,
      createdAt: apiKey.createdAt
    })
  } catch (error) {
    console.error('Create API key error:', error)
    return NextResponse.json({ error: 'Failed to create key' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const keyId = searchParams.get('id')

    if (!keyId) {
      return NextResponse.json({ error: 'Key ID required' }, { status: 400 })
    }

    await db.apiKey.deleteMany({
      where: { id: keyId, userId: session.user.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete API key error:', error)
    return NextResponse.json({ error: 'Failed to delete key' }, { status: 500 })
  }
}
