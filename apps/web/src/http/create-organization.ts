import { api } from './api-client'

interface CreateOrganizationRequest {
  name: string
  // domain: string | null
  // shouldAttachUsersByDomain: boolean
}

type CreateOrganizationResponse = {
  organizationId: string
}

export async function createOrganization({
  name,
}: CreateOrganizationRequest): Promise<CreateOrganizationResponse> {
  return await api
    .post('organization', {
      json: {
        name,
        shouldAttachUsersByDomain: false,
      },
    })
    .json<CreateOrganizationResponse>()
}
