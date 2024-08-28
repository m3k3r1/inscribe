import { hash } from 'bcryptjs'

import type { UsersRepository } from '@/repositories/user-repository'

import { UserAlreadyExistsError } from './errors/user-already-exists-error'
import { UserDoesNotExistsError } from './errors/user-does-not-exists-error'

export type CreateUserInput = {
  name: string
  email: string
  password: string
}

export class UserService {
  constructor(private userRepository: UsersRepository) {}

  async create({ name, email, password }: CreateUserInput) {
    const userExists = await this.userRepository.findByEmail(email)
    if (userExists) {
      throw new UserAlreadyExistsError()
    }

    const passwordHash = await hash(password, 6)

    const userCreated = await this.userRepository.create({
      name,
      email,
      password_hash: passwordHash,
    })

    return userCreated
  }

  async get(id: string) {
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new UserDoesNotExistsError()
    }

    return user
  }
}
