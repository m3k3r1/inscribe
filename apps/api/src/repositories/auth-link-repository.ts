import type { AuthLinks, Prisma } from '@prisma/client'

export interface AuthLinkRepository {
  create: (data: Prisma.AuthLinksCreateInput) => Promise<AuthLinks>
  findByCode: (token: string) => Promise<AuthLinks | null>
  findByUserId: (userId: string) => Promise<AuthLinks[]>
  delete: (id: string) => Promise<void>
}
