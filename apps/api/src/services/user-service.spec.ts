import { compare } from 'bcryptjs'
import { beforeEach, describe, expect, it } from 'vitest'

import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import type { UsersRepository } from '@/repositories/user-repository'

import { UserAlreadyExistsError } from './errors/user-already-exists-error'
import { UserService } from './user-service'

let usersRepository: UsersRepository
let userService: UserService

describe('User Service', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    userService = new UserService(usersRepository)
  })
  it('should hash user password upon registration', async () => {
    const user = await userService.create({
      name: 'John Doe',
      email: 'test@mail.com',
      password: '123456',
    })

    const isPasswordCorrectlyHashed = await compare(
      '123456',
      user.password_hash,
    )

    expect(isPasswordCorrectlyHashed).toBe(true)
  })

  it('should return an error if user alreadry exists', async () => {
    await userService.create({
      name: 'John Doe',
      email: 'mail@mail.com',
      password: '123456',
    })

    await expect(
      userService.create({
        name: 'John Doe',
        email: 'mail@mail.com',
        password: '123456',
      }),
    ).rejects.toThrow(UserAlreadyExistsError)
  })

  it('should create a user', async () => {
    const user = await userService.create({
      name: 'John Doe',
      email: 'mail@mail.com',
      password: '123456',
    })

    const userFound = await usersRepository.findById(user.id)
    expect(userFound).toEqual(user)
  })
})
