import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'
import { auth } from '../middlewares/auth'

export async function usageController(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/organization/:slug/project/:projectSlug/usage',
      {
        schema: {
          tags: ['Usage'],
          summary: 'Update project token usage',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            projectSlug: z.string(),
          }),
          body: z.object({
            totalTokens: z.number(),
            promptTokens: z.number(),
            completionTokens: z.number(),
          }),
          response: {
            200: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, projectSlug } = request.params
        const userId = await request.getCurrentUserId()
        const { organization } = await request.getUserMembership(slug)

        const project = await prisma.project.findUnique({
          where: {
            slug: projectSlug,
            organizationId: organization.id,
          },
        })

        if (!project) {
          throw new BadRequestError('Project not found.')
        }

        const { totalTokens, promptTokens, completionTokens } = request.body

        await prisma.usage.create({
          data: {
            userId,
            totalTokens,
            promptTokens,
            completionTokens,
            organizationId: organization.id,
            projectId: project.id,
          },
        })

        return reply.status(200).send()
      },
    )

  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/usage',
      {
        schema: {
          tags: ['Usage'],
          summary: 'Get user usage',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              usage: z.array(
                z.object({
                  id: z.string(),
                  userId: z.string(),
                  promptTokens: z.number(),
                  completionTokens: z.number(),
                  project: z
                    .object({
                      id: z.string(),
                      name: z.string(),
                      slug: z.string(),
                      organization: z.object({
                        id: z.string(),
                        name: z.string(),
                        slug: z.string(),
                      }),
                    })
                    .nullish(),

                  totalTokens: z.number(),
                  createdAt: z.date(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const usage = await prisma.usage.findMany({
          where: {
            userId,
          },
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            project: {
              select: {
                name: true,
                slug: true,
                id: true,
                organization: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        })

        return reply.status(200).send({
          usage,
        })
      },
    )
}
