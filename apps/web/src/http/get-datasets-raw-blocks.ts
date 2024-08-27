import { api } from './api-client'

interface GetRawDatasetBlocksResponse {
  blocks: {
    id: string
    content: string
    metadata: {
      to: string
      from: string
    }
    createdAt: string
  }[]
}

export async function getDatasetRawBlocks(org: string, dataset: string) {
  const result = await api
    .get(`organization/${org}/dataset/${dataset}/blocks/raw`)
    .json<GetRawDatasetBlocksResponse>()

  return result
}
