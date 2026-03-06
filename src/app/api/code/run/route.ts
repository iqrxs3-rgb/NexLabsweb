import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { UserContainer, validateCodeSecurity, DEFAULT_LIMITS } from '@/lib/docker-manager'

const MAX_CODE_SIZE = 50000

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code, language } = await req.json()

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language required' },
        { status: 400 }
      )
    }

    if (typeof code !== 'string' || code.length > MAX_CODE_SIZE) {
      return NextResponse.json(
        { error: `Code exceeds maximum size of ${MAX_CODE_SIZE} characters` },
        { status: 400 }
      )
    }

    const allowedLanguages = ['python', 'javascript', 'typescript']
    if (!allowedLanguages.includes(language)) {
      return NextResponse.json(
        { error: 'Unsupported language' },
        { status: 400 }
      )
    }

    const securityCheck = await validateCodeSecurity(code)
    if (!securityCheck.safe) {
      return NextResponse.json(
        { error: `Code blocked: ${securityCheck.reason}` },
        { status: 400 }
      )
    }

    const userContainer = new UserContainer(session.user.id, {
      ...DEFAULT_LIMITS,
      timeout: 30000,
    })

    const result = await userContainer.executeCode(code, language)

    if (result.exitCode !== 0 && result.error) {
      return NextResponse.json({
        output: result.output,
        error: result.error,
        exitCode: result.exitCode,
        duration: result.duration,
      })
    }

    return NextResponse.json({
      output: result.output,
      exitCode: result.exitCode,
      duration: result.duration,
    })
  } catch (error: any) {
    console.error('Code execution error:', error)

    if (error.message === 'Execution timeout') {
      return NextResponse.json(
        { error: 'Code execution timeout (30s limit)' },
        { status: 408 }
      )
    }

    return NextResponse.json(
      { error: 'Code execution failed' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
