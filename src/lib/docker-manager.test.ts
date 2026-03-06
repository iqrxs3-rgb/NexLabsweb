import { describe, it, expect } from 'vitest'
import { validateCodeSecurity } from './docker-manager'

describe('Code Security Validation', () => {
  it('should allow safe JavaScript code', async () => {
    const code = 'console.log("Hello, World!");'
    const result = await validateCodeSecurity(code)
    expect(result.safe).toBe(true)
    expect(result.blocked).toBe(false)
  })

  it('should block fs module access', async () => {
    const code = 'const fs = require("fs");'
    const result = await validateCodeSecurity(code)
    expect(result.safe).toBe(false)
    expect(result.blocked).toBe(true)
    expect(result.reason).toContain('File system')
  })

  it('should block child_process', async () => {
    const code = 'const { exec } = require("child_process");'
    const result = await validateCodeSecurity(code)
    expect(result.safe).toBe(false)
    expect(result.blocked).toBe(true)
  })

  it('should block eval', async () => {
    const code = 'eval("console.log(1)")'
    const result = await validateCodeSecurity(code)
    expect(result.safe).toBe(false)
  })

  it('should block Python os module', async () => {
    const code = 'import os\nos.system("ls")'
    const result = await validateCodeSecurity(code)
    expect(result.safe).toBe(false)
  })

  it('should block socket operations', async () => {
    const code = 'const s = socket.socket()'
    const result = await validateCodeSecurity(code)
    expect(result.safe).toBe(false)
  })

  it('should allow safe Python code', async () => {
    const code = 'print("Hello")\nname = input()'
    const result = await validateCodeSecurity(code)
    expect(result.safe).toBe(true)
  })
})
