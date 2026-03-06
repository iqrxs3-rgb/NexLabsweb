import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id }
    })

    if (user?.referralCode) {
      return NextResponse.json({ code: user.referralCode })
    }

    const referralCode = crypto.randomBytes(8).toString('hex')

    await db.user.update({
      where: { id: session.user.id },
      data: { referralCode }
    })

    return NextResponse.json({ code: referralCode })
  } catch (error) {
    console.error('Get referral code error:', error)
    return NextResponse.json({ error: 'Failed to get code' }, { status: 500 })
  }
}
