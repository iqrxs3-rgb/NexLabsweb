const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || ''

export interface DiscordEmbed {
  title?: string
  description?: string
  color?: number
  fields?: { name: string; value: string; inline?: boolean }[]
  footer?: { text: string }
  timestamp?: string
}

export interface DiscordWebhookPayload {
  content?: string
  embeds?: DiscordEmbed[]
  username?: string
  avatar_url?: string
}

export async function sendDiscordWebhook(payload: DiscordWebhookPayload): Promise<boolean> {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn('Discord webhook URL not configured')
    return false
  }

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    return response.ok
  } catch (error) {
    console.error('Discord webhook error:', error)
    return false
  }
}

export async function notifyNewUser(name: string, email: string, plan: string): Promise<void> {
  await sendDiscordWebhook({
    embeds: [{
      title: '👤 New User Registered',
      description: `**Name:** ${name}\n**Email:** ${email}\n**Plan:** ${plan}`,
      color: 0x00ff00,
      timestamp: new Date().toISOString()
    }]
  })
}

export async function notifyPayment(userEmail: string, amount: number, plan: string): Promise<void> {
  await sendDiscordWebhook({
    embeds: [{
      title: '💳 Payment Received',
      description: `**Email:** ${userEmail}\n**Amount:** $${amount}\n**Plan:** ${plan}`,
      color: 0x00ff00,
      timestamp: new Date().toISOString()
    }]
  })
}

export async function notifySupportTicket(subject: string, priority: string, userEmail: string): Promise<void> {
  const color = priority === 'high' ? 0xff0000 : priority === 'medium' ? 0xffa500 : 0x008000

  await sendDiscordWebhook({
    embeds: [{
      title: '🎫 New Support Ticket',
      description: `**Subject:** ${subject}\n**Priority:** ${priority}\n**User:** ${userEmail}`,
      color,
      timestamp: new Date().toISOString()
    }]
  })
}

export async function notifyRateLimit(userEmail: string, plan: string): Promise<void> {
  await sendDiscordWebhook({
    embeds: [{
      title: '⚠️ Rate Limit Exceeded',
      description: `**User:** ${userEmail}\n**Plan:** ${plan}`,
      color: 0xff0000,
      timestamp: new Date().toISOString()
    }]
  })
}

export async function notifyCodeExecution(userEmail: string, language: string, success: boolean): Promise<void> {
  await sendDiscordWebhook({
    embeds: [{
      title: success ? '✅ Code Executed' : '❌ Code Execution Failed',
      description: `**User:** ${userEmail}\n**Language:** ${language}`,
      color: success ? 0x00ff00 : 0xff0000,
      timestamp: new Date().toISOString()
    }]
  })
}
