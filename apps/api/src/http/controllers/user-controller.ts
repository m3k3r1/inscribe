import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { UserDoesNotExistsError } from '@/services/errors/user-does-not-exists-error'
import { makeUserService } from '@/services/factories/make-user-service'

import { BadRequestError } from '../_errors/bad-request-error'
import { auth } from '../middlewares/auth'

export async function userController(app: FastifyInstance) {
  // app
  //   .withTypeProvider<ZodTypeProvider>()
  //   .register(auth)
  //   .post(
  //     '/user',
  //     {
  //       schema: {
  //         tags: ['User'],
  //         summary: 'Create a new account',
  //         security: [{ bearerAuth: [] }],
  //         body: z.object({
  //           name: z.string(),
  //           email: z.string().email(),
  //           password: z.string().min(6),
  //         }),
  //       },
  //     },
  //     async (request, reply) => {
  //       const { name, email, password } = request.body

  //       const userService = makeUserService()
  //       await userService.create({
  //         name,
  //         email,
  //         password,
  //       })
  //       reply.status(201).send()
  //     },
  //   )
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/user/me',
      {
        schema: {
          tags: ['User'],
          summary: 'Fetch current user profile',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              user: z.object({
                id: z.string().uuid(),
                name: z.string().nullable(),
                email: z.string().email(),
                avatarUrl: z.string().url().nullable(),
                subscription: z.string().nullable(),
                tokenLimit: z.number().nullable(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        try {
          const userId = await request.getCurrentUserId()
          const userService = makeUserService()
          const user = await userService.get(userId)

          switch (user.subscription) {
            case 'HOBBY':
              return reply.send({
                user: {
                  ...user,
                  tokenLimit: 300000,
                },
              })
            case 'CREATOR':
              return reply.send({
                user: {
                  ...user,
                  tokenLimit: 6000000,
                },
              })
            case 'ULTRA':
              return reply.send({
                user: {
                  ...user,
                  tokenLimit: 2000000,
                },
              })
            default:
              return reply.send({
                user: {
                  ...user,
                  tokenLimit: 0,
                },
              })
          }
        } catch (error) {
          if (error instanceof UserDoesNotExistsError) {
            throw new BadRequestError(error.message)
          }

          throw error
        }
      },
    )
}
