import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

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

    if (!['python', 'javascript'].includes(language)) {
      return NextResponse.json(
        { error: 'Unsupported language' },
        { status: 400 }
      )
    }

    // Import dockerode only on server runtime
    const Docker = (await import('dockerode')).default
    const docker = new Docker()

    let image: string
    let cmd: string[]

    if (language === 'python') {
      image = 'python:3.11-alpine'
      cmd = ['python', '-c', code]
    } else {
      image = 'node:18-alpine'
      cmd = ['node', '-e', code]
    }

    try {
      await docker.pull(image)
    } catch (pullError) {
      console.error('Docker pull error:', pullError)
    }

    const container = await docker.createContainer({
      Image: image,
      Cmd: cmd,
      AttachStdout: true,
      AttachStderr: true,
      NetworkDisabled: true,
      HostConfig: {
        Memory: 128 * 1024 * 1024,
        NanoCpus: 1000000000,
        AutoRemove: true,
      },
    })

    await container.start()

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Execution timeout')), 10000)
    })

    const execPromise = new Promise<string>(async (resolve, reject) => {
      try {
        const stream = await container.logs({
          stdout: true,
          stderr: true,
          follow: true,
        })

        let output = ''
        stream.on('data', (chunk: Buffer) => {
          output += chunk.toString('utf8').replace(/[\x00-\x08]/g, '')
        })

        stream.on('end', () => resolve(output))
        stream.on('error', reject)
      } catch (error) {
        reject(error)
      }
    })

    const output = await Promise.race([execPromise, timeoutPromise])

    try {
      await container.stop()
    } catch (stopError) {
      console.error('Container stop error:', stopError)
    }

    return NextResponse.json({ output })
  } catch (error: any) {
    console.error('Code execution error:', error)

    if (error.message === 'Execution timeout') {
      return NextResponse.json(
        { error: 'Code execution timeout (10s limit)' },
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