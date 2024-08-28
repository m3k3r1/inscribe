import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

import { auth } from '../middlewares/auth'

export async function feedbackController(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/feedback',
      {
        schema: {
          tags: ['Feedback'],
          summary: 'Send user feedback',
          security: [{ bearerAuth: [] }],
          body: z.object({
            content: z.string(),
          }),
          response: {
            201: z.object({
              message: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const { content } = request.body

        await prisma.feedback.create({
          data: {
            content,
            userId,
          },
        })

        return reply.status(201).send({
          message: 'Feedback sent successfully',
        })
      },
    )
}
