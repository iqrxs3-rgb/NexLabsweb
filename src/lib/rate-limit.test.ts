import { describe, it, expect } from 'vitest'
import { rateLimit } from '@/lib/rate-limit'

describe('Rate Limiter', () => {
  it('should allow requests within limit', () => {
    const result = rateLimit('test-ip-1')
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(99)
  })

  it('should block requests after limit exceeded', () => {
    const ip = 'test-ip-block'
    
    for (let i = 0; i < 100; i++) {
      rateLimit(ip)
    }
    
    const result = rateLimit(ip)
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })
})
