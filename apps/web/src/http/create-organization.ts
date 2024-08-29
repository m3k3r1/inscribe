import { api } from './api-client'

interface CreateOrganizationRequest {
  name: string
  // domain: string | null
  // shouldAttachUsersByDomain: boolean
}

type CreateOrganizationResponse = void

export async function createOrganization({
  name,
}: CreateOrganizationRequest): Promise<CreateOrganizationResponse> {
  await api.post('organization', {
    json: {
      name,
      shouldAttachUsersByDomain: false,
    },
  })
}
