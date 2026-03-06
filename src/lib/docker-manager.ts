import Docker from 'dockerode'

const docker = new Docker()

export interface ContainerConfig {
  memory: number
  cpu: number
  disk: number
  timeout: number
}

export const DEFAULT_LIMITS: ContainerConfig = {
  memory: 512 * 1024 * 1024,
  cpu: 0.5,
  disk: 20 * 1024 * 1024 * 1024,
  timeout: 30000,
}

export interface ExecutionResult {
  output: string
  error: string
  exitCode: number
  duration: number
}

export class UserContainer {
  private userId: string
  private containerId: string | null = null
  private config: ContainerConfig

  constructor(userId: string, config: Partial<ContainerConfig> = {}) {
    this.userId = userId
    this.config = { ...DEFAULT_LIMITS, ...config }
  }

  private getContainerName(): string {
    return `nexlabs-${this.userId}-sandbox`
  }

  async createIfNotExists(): Promise<void> {
    const containers = await docker.listContainers({
      all: true,
      filters: { name: [this.getContainerName()] }
    })

    if (containers.length > 0) {
      this.containerId = containers[0].Id
      if (containers[0].State !== 'running') {
        await docker.getContainer(this.containerId).start()
      }
      return
    }

    await this.createContainer()
  }

  private async createContainer(): Promise<void> {
    const container = await docker.createContainer({
      Image: 'node:18-alpine',
      name: this.getContainerName(),
      Cmd: ['sleep', 'infinity'],
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
      OpenStdin: true,
      HostConfig: {
        Memory: this.config.memory,
        NanoCpus: Math.floor(this.config.cpu * 1e9),
        DiskQuota: this.config.disk,
        SecurityOpt: ['no-new-privileges:true'],
        CapDrop: ['ALL'],
        ReadonlyRootfs: true,
        NetworkMode: 'none',
        AutoRemove: true,
        LogConfig: {
          Type: 'json-file',
          Config: {
            'max-size': '10m',
            'max-file': '3'
          }
        }
      },
      Entrypoint: [],
    })

    this.containerId = container.id
    await container.start()
  }

  async executeCode(code: string, language: string): Promise<ExecutionResult> {
    const startTime = Date.now()
    
    if (!this.containerId) {
      await this.createIfNotExists()
    }

    const container = docker.getContainer(this.containerId!)

    let image: string
    let cmd: string[]

    switch (language) {
      case 'python':
        image = 'python:3.11-slim'
        cmd = ['python', '-c', code]
        break
      case 'typescript':
        image = 'node:18-alpine'
        const transpiledCode = code.replace(/:\s*(string|number|boolean|any|void|never)\b/g, '')
        cmd = ['node', '-e', transpiledCode]
        break
      case 'javascript':
      default:
        image = 'node:18-alpine'
        cmd = ['node', '-e', code]
        break
    }

    try {
      await docker.pull(image)
    } catch (pullError) {
      console.error('Docker pull error:', pullError)
    }

    const execContainer = await docker.createContainer({
      Image: image,
      Cmd: cmd,
      AttachStdout: true,
      AttachStderr: true,
      HostConfig: {
        Memory: this.config.memory,
        NanoCpus: Math.floor(this.config.cpu * 1e9),
        NetworkMode: 'none',
        AutoRemove: true,
        SecurityOpt: ['no-new-privileges:true'],
        CapDrop: ['ALL'],
      },
    })

    await execContainer.start()

    const timeoutPromise = new Promise<ExecutionResult>((_, reject) => {
      setTimeout(() => {
        execContainer.stop().catch(() => {})
        reject(new Error('Execution timeout'))
      }, this.config.timeout)
    })

    const execPromise = new Promise<ExecutionResult>(async (resolve) => {
      try {
        const stream = await execContainer.logs({
          stdout: true,
          stderr: true,
          follow: true,
          tail: 1000,
        })

        let output = ''
        let errorOutput = ''

        stream.on('data', (chunk: Buffer) => {
          const str = chunk.toString('utf8')
          if (str.includes('Error') || str.includes('error') || str.includes('Traceback')) {
            errorOutput += str
          } else {
            output += str
          }
        })

        stream.on('end', async () => {
          const info = await execContainer.inspect()
          const exitCode = info.State.ExitCode
          const duration = Date.now() - startTime

          resolve({
            output: output.trim(),
            error: errorOutput.trim(),
            exitCode,
            duration,
          })
        })
      } catch (err: any) {
        resolve({
          output: '',
          error: err.message || 'Execution failed',
          exitCode: 1,
          duration: Date.now() - startTime,
        })
      }
    })

    return Promise.race([execPromise, timeoutPromise])
  }

  async destroy(): Promise<void> {
    if (!this.containerId) return

    try {
      const container = docker.getContainer(this.containerId)
      await container.stop({ t: 5 })
      await container.remove({ force: true })
    } catch (error) {
      console.error('Failed to destroy container:', error)
    }
    this.containerId = null
  }

  static async cleanupUserContainers(userId: string): Promise<void> {
    const containers = await docker.listContainers({
      all: true,
      filters: { name: [`nexlabs-${userId}`] }
    })

    for (const c of containers) {
      try {
        await docker.getContainer(c.Id).remove({ force: true })
      } catch (error) {
        console.error(`Failed to remove container ${c.Id}:`, error)
      }
    }
  }

  static async getContainerStats(userId: string): Promise<{
    running: number
    stopped: number
    memory: number
  }> {
    const containers = await docker.listContainers({
      all: true,
      filters: { name: [`nexlabs-${userId}`] }
    })

    let totalMemory = 0

    for (const c of containers) {
      if (c.State === 'running') {
        const stats = await docker.getContainer(c.Id).stats({ stream: false })
        totalMemory += stats.memory_stats?.usage || 0
      }
    }

    return {
      running: containers.filter(c => c.State === 'running').length,
      stopped: containers.filter(c => c.State !== 'running').length,
      memory: totalMemory,
    }
  }
}

export async function validateCodeSecurity(code: string): Promise<{
  safe: boolean
  blocked: boolean
  reason?: string
}> {
  const dangerousPatterns = [
    { pattern: /import\s+.*\s+from\s+['"]fs['"]/i, reason: 'File system access' },
    { pattern: /import\s+.*\s+from\s+['"]child_process['"]/i, reason: 'Process spawning' },
    { pattern: /require\s*\(\s*['"]fs['"]\)/i, reason: 'File system access' },
    { pattern: /require\s*\(\s*['"]child_process['"]\)/i, reason: 'Process spawning' },
    { pattern: /\bexec\s*\(/i, reason: 'Command execution' },
    { pattern: /\bspawn\s*\(/i, reason: 'Process spawning' },
    { pattern: /\beval\s*\(/i, reason: 'Dynamic code execution' },
    { pattern: /\bFunction\s*\(/i, reason: 'Dynamic code creation' },
    { pattern: /__import__\s*\(\s*['"]os['"]\)/i, reason: 'OS module access' },
    { pattern: /__import__\s*\(\s*['"]subprocess['"]\)/i, reason: 'Subprocess spawning' },
    { pattern: /import\s+os/i, reason: 'OS module access' },
    { pattern: /import\s+subprocess/i, reason: 'Subprocess spawning' },
    { pattern: /open\s*\([^)]*\)/i, reason: 'File operations' },
    { pattern: /read\s*\(\s*\)/i, reason: 'File reading' },
    { pattern: /write\s*\(\s*\)/i, reason: 'File writing' },
    { pattern: /socket\s*\(/i, reason: 'Network sockets' },
    { pattern: /connect\s*\(/i, reason: 'Network connections' },
    { pattern: /http\.createServer/i, reason: 'HTTP server creation' },
    { pattern: /flask/i, reason: 'Web framework' },
    { pattern: /express/i, reason: 'Web framework' },
  ]

  for (const { pattern, reason } of dangerousPatterns) {
    if (pattern.test(code)) {
      return { safe: false, blocked: true, reason }
    }
  }

  return { safe: true, blocked: false }
}
