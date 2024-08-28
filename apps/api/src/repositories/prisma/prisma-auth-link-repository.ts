import type { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import type { AuthLinkRepository } from '../auth-link-repository'

export class PrismaAuthLinkRepository implements AuthLinkRepository {
  async create(data: Prisma.AuthLinksCreateInput) {
    return prisma.authLinks.create({ data })
  }

  async findByCode(code: string) {
    return prisma.authLinks.findFirst({ where: { code } })
  }

  async delete(id: string) {
    await prisma.authLinks.delete({ where: { id } })
  }

  async findByUserId(userId: string) {
    return prisma.authLinks.findMany({ where: { userId } })
  }
}
