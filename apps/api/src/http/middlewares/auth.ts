import type { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'

import { prisma } from '@/lib/prisma'

import { UnauthorizedError } from '../_errors/unauthorized-error'
import { UserIsBlockedError } from '../_errors/user-is-blocked'

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    request.getCurrentUserId = async () => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>()
        console.log('sub', sub)
        const user = await prisma.user.findFirst({
          where: {
            id: sub,
          },
        })

        if (user?.isBlocked) {
          throw new UserIsBlockedError()
        }

        return sub
      } catch (error) {
        if (error instanceof UserIsBlockedError) {
          throw new UnauthorizedError(error.message)
        }

        throw new UnauthorizedError('Invalid token')
      }
    }
    request.getUserMembership = async (slug: string) => {
      const userId = await request.getCurrentUserId()

      const member = await prisma.member.findFirst({
        where: {
          userId,
          organization: {
            slug,
          },
        },
        include: {
          organization: true,
        },
      })

      if (!member) {
        throw new UnauthorizedError(`You're not a member of this organization.`)
      }

      const { organization, ...membership } = member

      return {
        organization,
        membership,
      }
    }
  })
})
