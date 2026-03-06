import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createPaymentLink, PLAN_PRICES, PLAN_DURATIONS } from '@/lib/paytabs'
import { notifyPayment } from '@/lib/discord-webhook'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const plan = body.plan as 'pro' | 'enterprise'

    if (!plan || !['pro', 'enterprise'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const amount = PLAN_PRICES[plan]
    const orderId = `ORD-${Date.now()}-${session.user.id.slice(0, 8)}`

    const payment = await db.payment.create({
      data: {
        amount,
        currency: 'USD',
        status: 'pending',
        customerEmail: user.email,
        userId: session.user.id,
        plan
      }
    })

    const paymentLink = await createPaymentLink({
      amount,
      currency: 'USD',
      customerEmail: user.email,
      customerPhone: '',
      orderId: payment.id,
      productName: `NexLabs ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
      returnUrl: `${process.env.NEXTAUTH_URL}/payment/callback?paymentId=${payment.id}`,
      frameMode: 'iframes'
    })

    await db.payment.update({
      where: { id: payment.id },
      data: { paytabsRef: String(paymentLink.p_id) }
    })

    return NextResponse.json({
      paymentUrl: paymentLink.payment_url,
      paymentId: payment.id
    })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 })
  }
}
