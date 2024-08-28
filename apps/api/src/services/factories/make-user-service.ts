import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { UserService } from '@/services/user-service'

export function makeUserService() {
  const userRepository = new PrismaUsersRepository()
  return new UserService(userRepository)
}
