import { api } from './api-client'

interface GetDatasetsResponse {
  datasets: {
    id: string
    name: string
    type: 'YOUTUBE' | 'PDF'
    uri: string
    status: 'PENDING' | 'PROCESSING' | 'READY'
    createdAt: string
  }[]
}

export async function getDatasets(org: string) {
  const result = await api
    .get(`organization/${org}/dataset`)
    .json<GetDatasetsResponse>()

  return result
}
