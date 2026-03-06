import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('Utils', () => {
  it('should merge class names', () => {
    const result = cn('foo', 'bar')
    expect(result).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    const result = cn('foo', false && 'bar', 'baz')
    expect(result).toBe('foo baz')
  })

  it('should handle array input', () => {
    const result = cn(['foo', 'bar'])
    expect(result).toBe('foo bar')
  })
})
