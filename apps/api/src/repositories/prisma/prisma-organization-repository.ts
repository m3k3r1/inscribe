import { prisma } from '@/lib/prisma'

import type {
  OrganizationRepository,
  OrganizationWithRole,
} from '../organization-repository'

export class PrismaOrganizationRepository implements OrganizationRepository {
  async findByUserId(userId: string): Promise<OrganizationWithRole[]> {
    const userOrganizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        avatarUrl: true,
        members: {
          select: {
            role: true,
          },
          where: {
            userId,
          },
        },
      },
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
    })

    return userOrganizations
  }
}
