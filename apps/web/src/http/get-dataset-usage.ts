import { api } from './api-client'

interface GetUsageResponse {
  usage: {
    id: string
    datasetId: string
    datasetName: string
    promptTokens: number
    completionTokens: number
    totalTokens: number
    createdAt: string
  }[]
}

export async function getDatasetUsage() {
  const result = await api.get('usage/dataset').json<GetUsageResponse>()
  return result
}
