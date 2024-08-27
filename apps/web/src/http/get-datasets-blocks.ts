import { api } from './api-client'

interface GetDatasetBlocksResponse {
  blocks: {
    id: string
    content: string
    label: string
    createdAt: string
    datasetId: string
  }[]
}

export async function getDatasetBlocks(org: string, dataset: string) {
  const result = await api
    .get(`organization/${org}/dataset/${dataset}/blocks`)
    .json<GetDatasetBlocksResponse>()

  return result
}
