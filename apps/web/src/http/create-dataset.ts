import { api } from './api-client'

interface CreateYoutubeDatasetRequest {
  organization: string
  url: string
}

type CreateOrganizationResponse = void

export async function createYoutubeDataset({
  url,
  organization,
}: CreateYoutubeDatasetRequest): Promise<CreateOrganizationResponse> {
  await api.post(`organization/${organization}/dataset/youtube`, {
    json: {
      url,
    },
  })
}
