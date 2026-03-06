import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPayment } from '@/lib/paytabs'
import { notifyPayment } from '@/lib/discord-webhook'

export async function POST(req: NextRequest) {
  try {
    const { paymentId, ref } = await req.json()

    if (!paymentId || !ref) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const payment = await db.payment.findUnique({
      where: { id: paymentId }
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (payment.status === 'completed') {
      return NextResponse.json({ message: 'Payment already completed' })
    }

    const verification = await verifyPayment(ref)

    if (verification.success) {
      const subscriptionEnd = new Date()
      subscriptionEnd.setDate(subscriptionEnd.getDate() + 30)

      await db.user.update({
        where: { id: payment.userId! },
        data: {
          plan: payment.plan,
          subscriptionEnd
        }
      })

      await db.payment.update({
        where: { id: paymentId },
        data: { status: 'completed' }
      })

      await notifyPayment(payment.customerEmail, payment.amount, payment.plan)

      return NextResponse.json({ success: true, plan: payment.plan })
    }

    await db.payment.update({
      where: { id: paymentId },
      data: { status: 'failed' }
    })

    return NextResponse.json({ success: false })
  } catch (error) {
    console.error('Payment callback error:', error)
    return NextResponse.json({ error: 'Callback failed' }, { status: 500 })
  }
}
