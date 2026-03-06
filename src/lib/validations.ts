import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const chatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
  conversationId: z.string().optional(),
})

export const projectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
})

export const conversationSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
})

export const codeFileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  language: z.enum(['javascript', 'python', 'typescript', 'html', 'css']),
  content: z.string().optional(),
})

export const imageSaveSchema = z.object({
  url: z.string().url('Invalid URL'),
  prompt: z.string().max(1000, 'Prompt too long').optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type ChatInput = z.infer<typeof chatSchema>
export type ProjectInput = z.infer<typeof projectSchema>
export type ConversationInput = z.infer<typeof conversationSchema>
export type CodeFileInput = z.infer<typeof codeFileSchema>
export type ImageSaveInput = z.infer<typeof imageSaveSchema>
