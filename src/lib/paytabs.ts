import crypto from 'crypto'

const PAYTABS_PROFILE_ID = process.env.PAYTABS_PROFILE_ID || ''
const PAYTABS_SERVER_KEY = process.env.PAYTABS_SERVER_KEY || ''
const PAYTABS_BASE_URL = process.env.PAYTABS_BASE_URL || 'https://secure.paytabs.com'

interface PaytabsPaymentRequest {
  amount: number
  currency: string
  customerEmail: string
  customerPhone: string
  orderId: string
  productName: string
  returnUrl: string
  frameMode: string
}

interface PaytabsPaymentResponse {
  payment_url: string
  p_id: number
  result: string
}

export async function createPaymentLink(data: PaytabsPaymentRequest): Promise<PaytabsPaymentResponse> {
  const payload = {
    profile_id: PAYTABS_PROFILE_ID,
    amount: data.amount,
    currency: data.currency,
    customer_email: data.customerEmail,
    customer_phone: data.customerPhone,
    order_id: data.orderId,
    product_name: data.productName,
    return_url: data.returnUrl,
    frame_mode: data.frameMode || 'iframes',
    token: '',
    signatures: {
      signature: generateSignature(data.amount, data.currency, data.orderId)
    }
  }

  const response = await fetch(`${PAYTABS_BASE_URL}/payment/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': PAYTABS_SERVER_KEY
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(`Paytabs error: ${response.statusText}`)
  }

  return response.json()
}

export async function verifyPayment(paymentRef: string): Promise<{
  success: boolean
  result: string
  amount: number
}> {
  const response = await fetch(`${PAYTABS_BASE_URL}/payment/query/${paymentRef}`, {
    method: 'GET',
    headers: {
      'Authorization': PAYTABS_SERVER_KEY
    }
  })

  if (!response.ok) {
    throw new Error(`Paytabs verification error: ${response.statusText}`)
  }

  const data = await response.json()
  return {
    success: data.response_code === '100' || data.response_code === '1400',
    result: data.result,
    amount: data.amount
  }
}

function generateSignature(amount: number, currency: string, orderId: string): string {
  const str = `${PAYTABS_PROFILE_ID}${amount}${currency}${orderId}`
  return crypto.createHash('sha256').update(str).digest('hex')
}

export const PLAN_PRICES = {
  free: 0,
  pro: 9.99,
  enterprise: 49.99
}

export const PLAN_NAMES = {
  free: 'Free',
  pro: 'Pro',
  enterprise: 'Enterprise'
}

export const PLAN_DURATIONS = {
  free: 0,
  pro: 30,
  enterprise: 30
}
