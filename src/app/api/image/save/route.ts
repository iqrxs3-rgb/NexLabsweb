import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { imageSaveSchema } from '@/lib/validations'
import { handleError } from '@/lib/error-handler'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = imageSaveSchema.extend({
      projectId: z.string().min(1, 'Project ID is required'),
    }).parse(body)

    const projectId = parsed.projectId as string
    const prompt = parsed.prompt as string
    const url = parsed.url as string

    const project = await db.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const image = await db.generatedImage.create({
      data: {
        projectId,
        prompt,
        url,
      },
    })

    return NextResponse.json(image)
  } catch (error) {
    return handleError(error)
  }
}