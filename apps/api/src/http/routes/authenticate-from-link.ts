import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { serialize } = require('@fastify/cookie')

export async function authenticateFromLink(app: FastifyInstance) {
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

      const authLink = await prisma.authLinks.findUnique({
        where: {
          code,
        },
      })

      if (!authLink) {
        return reply.status(404).send({ message: 'Auth link not found' })
      }

      await prisma.authLinks.delete({
        where: {
          id: authLink.id,
        },
      })

      const authenticatedUser = await prisma.user.findUnique({
        where: {
          id: authLink.userId,
        },
      })

      if (!authenticatedUser) {
        return reply.status(404).send({ message: 'User not found' })
      }

      const token = await reply.jwtSign(
        {
          sub: authenticatedUser.id,
        },
        { sign: { expiresIn: '7d' } },
      )
      const cookie = serialize('token', token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        secure: true,
        sameSite: 'none',
        domain: 'tryinscribe.app',
      })

      reply.header('Set-Cookie', cookie)

      reply.redirect(redirect.toString())
    },
  )
}
