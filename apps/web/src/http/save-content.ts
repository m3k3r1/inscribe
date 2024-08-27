import { api } from './api-client'

interface SaveContentInput {
  content: string
}

interface SaveContentOutput {
  message: string
}

export async function saveContent(
  orgSlug: string,
  projectSlug: string,
  { content }: SaveContentInput,
): Promise<SaveContentOutput> {
  const result = await api
    .patch(`organization/${orgSlug}/project/${projectSlug}/content`, {
      json: { content },
    })
    .json<SaveContentOutput>()

  return result
}
