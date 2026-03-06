import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export type PlanType = 'free' | 'pro' | 'enterprise'

export interface PlanLimits {
  requestsPerMinute: number
  requestsPerDay: number
  codeExecutionsPerDay: number
  imageGenerationsPerDay: number
  voiceMinutesPerDay: number
  maxCodeSize: number
  maxProjectCount: number
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    requestsPerMinute: 10,
    requestsPerDay: 100,
    codeExecutionsPerDay: 20,
    imageGenerationsPerDay: 10,
    voiceMinutesPerDay: 5,
    maxCodeSize: 10000,
    maxProjectCount: 3,
  },
  pro: {
    requestsPerMinute: 60,
    requestsPerDay: 1000,
    codeExecutionsPerDay: 200,
    imageGenerationsPerDay: 100,
    voiceMinutesPerDay: 60,
    maxCodeSize: 50000,
    maxProjectCount: 20,
  },
  enterprise: {
    requestsPerMinute: 300,
    requestsPerDay: 10000,
    codeExecutionsPerDay: 2000,
    imageGenerationsPerDay: 1000,
    voiceMinutesPerDay: 600,
    maxCodeSize: 200000,
    maxProjectCount: -1,
  },
}

const userLimits = new Map<string, {
  minuteCount: number
  dayCount: number
  codeCount: number
  imageCount: number
  voiceCount: number
  minuteReset: number
  dayReset: number
  codeReset: number
  imageReset: number
  voiceReset: number
}>()

const DEFAULT_LIMITS = PLAN_LIMITS.free

function getUserLimits(userId: string): typeof userLimits extends Map<string, infer V> ? V : never {
  const now = Date.now()
  const record = userLimits.get(userId)

  if (!record) {
    const newRecord = {
      minuteCount: 1,
      dayCount: 1,
      codeCount: 0,
      imageCount: 0,
      voiceCount: 0,
      minuteReset: now + 60000,
      dayReset: now + 86400000,
      codeReset: now + 86400000,
      imageReset: now + 86400000,
      voiceReset: now + 86400000,
    }
    userLimits.set(userId, newRecord)
    return newRecord as any
  }

  if (now > record.minuteReset) {
    record.minuteCount = 0
    record.minuteReset = now + 60000
  }
  if (now > record.dayReset) {
    record.dayCount = 0
    record.codeCount = 0
    record.imageCount = 0
    record.voiceCount = 0
    record.dayReset = now + 86400000
  }

  return record as any
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
  limit: number
}

export function checkRateLimit(
  userId: string,
  plan: PlanType,
  type: 'minute' | 'day' | 'code' | 'image' | 'voice'
): RateLimitResult {
  const limits = PLAN_LIMITS[plan]
  const now = Date.now()
  const record = getUserLimits(userId)

  switch (type) {
    case 'minute':
      if (record.minuteCount >= limits.requestsPerMinute) {
        return { success: false, remaining: 0, resetTime: record.minuteReset, limit: limits.requestsPerMinute }
      }
      record.minuteCount++
      return { success: true, remaining: limits.requestsPerMinute - record.minuteCount, resetTime: record.minuteReset, limit: limits.requestsPerMinute }

    case 'day':
      if (record.dayCount >= limits.requestsPerDay) {
        return { success: false, remaining: 0, resetTime: record.dayReset, limit: limits.requestsPerDay }
      }
      record.dayCount++
      return { success: true, remaining: limits.requestsPerDay - record.dayCount, resetTime: record.dayReset, limit: limits.requestsPerDay }

    case 'code':
      if (record.codeCount >= limits.codeExecutionsPerDay) {
        return { success: false, remaining: 0, resetTime: record.codeReset, limit: limits.codeExecutionsPerDay }
      }
      record.codeCount++
      return { success: true, remaining: limits.codeExecutionsPerDay - record.codeCount, resetTime: record.codeReset, limit: limits.codeExecutionsPerDay }

    case 'image':
      if (record.imageCount >= limits.imageGenerationsPerDay) {
        return { success: false, remaining: 0, resetTime: record.imageReset, limit: limits.imageGenerationsPerDay }
      }
      record.imageCount++
      return { success: true, remaining: limits.imageGenerationsPerDay - record.imageCount, resetTime: record.imageReset, limit: limits.imageGenerationsPerDay }

    case 'voice':
      if (record.voiceCount >= limits.voiceMinutesPerDay) {
        return { success: false, remaining: 0, resetTime: record.voiceReset, limit: limits.voiceMinutesPerDay }
      }
      record.voiceCount++
      return { success: true, remaining: limits.voiceMinutesPerDay - record.voiceCount, resetTime: record.voiceReset, limit: limits.voiceMinutesPerDay }

    default:
      return { success: true, remaining: 999, resetTime: now, limit: 999 }
  }
}

export function withUserRateLimit(
  req: NextRequest,
  userId: string,
  plan: PlanType,
  type: 'minute' | 'day' | 'code' | 'image' | 'voice'
): NextResponse | null {
  const result = checkRateLimit(userId, plan, type)

  if (!result.success) {
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded',
        type,
        limit: result.limit,
        resetIn: Math.ceil((result.resetTime - Date.now()) / 1000)
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.resetTime.toString()
        }
      }
    )
  }

  return null
}

export function getCodeLimit(plan: PlanType): number {
  return PLAN_LIMITS[plan].maxCodeSize
}

export function getProjectLimit(plan: PlanType): number {
  return PLAN_LIMITS[plan].maxProjectCount
}

const simpleRateLimitMap = new Map<string, { count: number; resetTime: number }>()
const SIMPLE_LIMIT = 100
const SIMPLE_WINDOW_MS = 60 * 1000

export function simpleRateLimit(identifier: string): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = simpleRateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    simpleRateLimitMap.set(identifier, { count: 1, resetTime: now + SIMPLE_WINDOW_MS })
    return { success: true, remaining: SIMPLE_LIMIT - 1, resetTime: now + SIMPLE_WINDOW_MS }
  }

  if (record.count >= SIMPLE_LIMIT) {
    return { success: false, remaining: 0, resetTime: record.resetTime }
  }

  record.count++
  return { success: true, remaining: SIMPLE_LIMIT - record.count, resetTime: record.resetTime }
}

export function withRateLimit(req: NextRequest): NextResponse | null {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const { success, remaining, resetTime } = simpleRateLimit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetTime.toString()
        }
      }
    )
  }

  return null
}
