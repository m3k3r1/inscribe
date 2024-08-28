import type { OrganizationRepository } from '@/repositories/organization-repository'

export type CreateOrganizationInput = {
  name: string
  domain: string | null
  shouldAttachUsersByDomain: boolean
}

export class OrganizationService {
  constructor(private organizationRepository: OrganizationRepository) {}

  async getUserOrganizations(userId: string) {
    const organizations = await this.organizationRepository.findByUserId(userId)

    const organizationsWithUserRole = organizations.map(
      ({ members, ...org }) => {
        return {
          ...org,
          role: members[0].role,
        }
      },
    )

    return organizationsWithUserRole
  }
}
