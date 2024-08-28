'use server'

import { HTTPError } from 'ky'
import { z } from 'zod'

import { signInWithMagicLink } from '@/http/sign-in-magic-link'

const signInForm = z.object({
  email: z.string().email(),
})

export async function singInAction(data: FormData) {
  const result = signInForm.safeParse(Object.fromEntries(data))

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors

    return { success: false, message: null, errors }
  }

  const { email } = result.data

  try {
    await signInWithMagicLink(email)
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
