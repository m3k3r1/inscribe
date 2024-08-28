import { PrismaAuthLinkRepository } from '@/repositories/prisma/prisma-auth-link-repository'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'

import { AuthService } from '../auth-service'

export function makeAuthService() {
  const userRepository = new PrismaUsersRepository()
  const authLinkRepository = new PrismaAuthLinkRepository()
  return new AuthService(userRepository, authLinkRepository)
}
