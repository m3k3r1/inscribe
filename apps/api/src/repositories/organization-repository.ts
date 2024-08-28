import type { $Enums, Organization } from '@prisma/client'

export type OrganizationWithRole = Omit<
  Organization,
  'domain' | 'shouldAttachUsersByDomain' | 'createdAt' | 'updatedAt' | 'ownerId'
> & {
  members: {
    role: $Enums.Role
  }[]
}

export interface OrganizationRepository {
  findByUserId(userId: string): Promise<OrganizationWithRole[]>
}
