'use server'

import { HTTPError } from 'ky'
import { z } from 'zod'

import { sendFeedback } from '@/http/send-feedback'

const feedbackSchema = z.object({
  content: z
    .string()
    .min(5, {
      message: 'Feedback must be at least 5 characters.',
    })
    .max(200, {
      message: 'Feedback must not be longer than 200 characters.',
    }),
})

export async function sendFeedbackAction(data: FormData) {
  const result = feedbackSchema.safeParse(Object.fromEntries(data))

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors

    return { success: false, message: null, errors }
  }

  const { content } = result.data

  try {
    await sendFeedback({ content })
  } catch (err) {
    if (err instanceof HTTPError) {
      const { message } = (await err.response.json()) as { message: string }
      return { success: false, message, errors: null }
    }

    console.error(err)

    return {
      success: false,
      message: 'Unexpected error, try again in a few minutes.',
      errors: null,
    }
  }
  return { success: true, message: null, errors: null }
}
