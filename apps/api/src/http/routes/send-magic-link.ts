import { env } from '@saas/env'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { uuid } from 'uuidv4'
import z from 'zod'

import { prisma } from '@/lib/prisma'
import { resend } from '@/lib/resend'
import { AuthenticationMagicLinkTemplate } from '@/mail/templates/authentication-magic-link'

import { logger } from '../server'

export async function sendMagicLink(app: FastifyInstance) {
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
          503: z.object({
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

      const userExists = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (!userExists) {
        return reply.status(404).send({ message: 'User not found' })
      }

      const userHasMoreThanOneAuthLink = await prisma.authLinks.findMany({
        where: {
          userId: userExists.id,
        },
      })

      if (userHasMoreThanOneAuthLink.length > 1) {
        await prisma.authLinks.deleteMany({
          where: {
            userId: userHasMoreThanOneAuthLink[0].id,
          },
        })
      }

      const code = uuid().slice(0, 6)
      await prisma.authLinks.create({
        data: {
          code,
          userId: userExists.id,
        },
      })

      const authLink = new URL(
        '/auth/link/authenticate',
        env.NEXT_PUBLIC_API_URL,
      )
      authLink.searchParams.set('code', code)
      authLink.searchParams.set('redirect', env.AUTH_REDIRECT_URL)

      logger.info(
        `Auth link generated for user ${userExists.email}: ${authLink}`,
      )

      const { error } = await resend.emails.send({
        from: 'Inscribe <dontreply@tryinscribe.app>',
        to: userExists.email,
        subject: '[Inscribe] Magic link authentication',
        react: AuthenticationMagicLinkTemplate({
          userEmail: userExists.email,
          authLink: authLink.toString(),
        }),
      })

      if (error) {
        logger.error(`Error sending email: ${error}`)
        return reply.status(503).send({ message: 'Error sending email' })
      }

      return reply.status(200).send({ message: 'Email sent' })
    },
  )
}
