import { api } from './api-client'

interface CreateFileDatasetRequest {
  organization: string
  file: File
}

type CreateOrganizationResponse = void

export async function createFileDataset({
  file,
  organization,
}: CreateFileDatasetRequest): Promise<CreateOrganizationResponse> {
  const formData = new FormData()
  formData.append('file', file)

  await api.post(`organization/${organization}/dataset/file`, {
    body: formData,
  })
}
