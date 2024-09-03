import { api } from './api-client'

interface GetContentOutput {
  project: {
    id: string
    content: string
  }
}

export async function getContent(
  orgSlug: string,
  projectSlug: string,
): Promise<GetContentOutput> {
  const result = await api
    .get(`organization/${orgSlug}/project/${projectSlug}/content`)
    .json<GetContentOutput>()

  return result
}
