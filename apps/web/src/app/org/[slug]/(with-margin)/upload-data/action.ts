'use server'

import { HTTPError } from 'ky'
import { z } from 'zod'

import { getCurrentOrg } from '@/auth/auth'
import { createYoutubeDataset } from '@/http/create-dataset'
import { createFileDataset } from '@/http/create-file-dataset'

const uploadDataSchema = z.object({
  url: z.string().optional(),
  type: z.enum(['YOUTUBE', 'PDF', 'TXT']),
  file: z.instanceof(File).optional(),
})

export async function uploadDataAction(data: FormData) {
  const result = uploadDataSchema.safeParse(Object.fromEntries(data))
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    return { success: false, message: null, errors }
  }

  const { url, type, file } = result.data

  try {
    if (type === 'YOUTUBE') {
      if (url) {
        await createYoutubeDataset({
          organization: getCurrentOrg()!,
          url,
        })
      }
    } else {
      if (file) {
        await createFileDataset({
          organization: getCurrentOrg()!,
          file,
        })
      }
    }
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

  return {
    success: true,
    message: 'Successfully uploaded the data.',
    errors: null,
  }
}
