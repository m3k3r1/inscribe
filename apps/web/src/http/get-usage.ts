import { api } from './api-client'

interface GetUsageResponse {
  usage: {
    project: {
      id: string
      name: string
      slug: string
      organization: {
        id: string
        name: string
        slug: string
      }
    }
    totalTokens: number
    createdAt: string
  }[]
}

export async function getUsage() {
  const result = await api.get('usage/project').json<GetUsageResponse>()
  return result
}
