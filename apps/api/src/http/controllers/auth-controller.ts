import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { UserDoesNotExistsError } from '@/services/errors/user-does-not-exists-error'
import { makeAuthService } from '@/services/factories/make-auth-service'

// import { WrongCredentialsError } from '@/services/errors/wrong-credentials-error'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { serialize } = require('@fastify/cookie')

export async function authController(app: FastifyInstance) {
  // app.withTypeProvider<ZodTypeProvider>().post(
  //   '/auth',
  //   {
  //     schema: {
  //       tags: ['Auth'],
  //       summary: 'Authenticate user',
  //       body: z.object({
  //         email: z.string().email(),
  //         password: z.string().min(6),
  //       }),
  //       response: {
  //         201: z.object({
  //           token: z.string(),
  //         }),
  //         400: z.object({
  //           message: z.string(),
  //         }),
  //         404: z.object({
  //           message: z.string(),
  //         }),
  //       },
  //     },
  //   },
  //   async (request, reply) => {
  //     const { email, password } = request.body

  //     const authService = makeAuthService()
  //     try {
  //       const authenticatedUser = await authService.authenticate({
  //         email,
  //         password,
  //       })
  //       const token = await reply.jwtSign(
  //         {
  //           sub: authenticatedUser.id,
  //         },
  //         { sign: { expiresIn: '7d' } },
  //       )
  //       return reply.status(201).send({ token })
  //     } catch (error) {
  //       if (error instanceof UserDoesNotExistsError) {
  //         reply.status(404).send({ message: error.message })
  //       }

  //       if (error instanceof WrongCredentialsError) {
  //         reply.status(400).send({ message: error.message })
  //       }

  //       throw error
  //     }
  //   },
  // )
  app.withTypeProvider<ZodTypeProvider>().post(
    '/auth/link',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Send user magic link',
        body: z.object({
          email: z.string().email(),
        }),
        response: {
          200: z.object({
            message: z.string(),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body

      const authService = makeAuthService()
      try {
        await authService.createMagicLink(email)

        return reply.status(200).send({ message: 'Magic link sent' })
      } catch (error) {
        if (error instanceof UserDoesNotExistsError) {
          reply.status(404).send({ message: error.message })
        }

        throw error
      }
    },
  )
  app.withTypeProvider<ZodTypeProvider>().get(
    '/auth/link/authenticate',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Authenticate magic link url',
        querystring: z.object({
          code: z.string(),
          redirect: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { code, redirect } = request.query

      const authService = makeAuthService()
      try {
        const authenticatedUser =
          await authService.authenticateWithMagicLink(code)

        const token = await reply.jwtSign(
          {
            sub: authenticatedUser.id,
          },
          { sign: { expiresIn: '7d' } },
        )

        let cookie
        if (process.env.NODE_ENV === 'production') {
          cookie = serialize('token', token, {
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
            secure: true,
            sameSite: 'none',
            domain: 'tryinscribe.app',
          })
        } else {
          cookie = serialize('token', token, {
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
          })
        }

        reply.header('Set-Cookie', cookie)

        reply.redirect(redirect.toString())
      } catch (error) {}
    },
  )
}
