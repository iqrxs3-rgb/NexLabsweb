import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { UserContainer } from '@/lib/docker-manager'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stats = await UserContainer.getContainerStats(session.user.id)

    return NextResponse.json({
      running: stats.running,
      stopped: stats.stopped,
      memory: stats.memory,
      memoryMB: Math.round(stats.memory / 1024 / 1024),
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { error: 'Failed to get container stats' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await UserContainer.cleanupUserContainers(session.user.id)

    return NextResponse.json({ message: 'Containers cleaned up successfully' })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup containers' },
      { status: 500 }
    )
  }
}
