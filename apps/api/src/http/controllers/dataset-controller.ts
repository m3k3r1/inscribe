import { env } from '@saas/env'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { makeDatasetService } from '@/services/factories/make-dataset-service'

import { auth } from '../middlewares/auth'

export async function datasetController(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/organization/:slug/dataset/youtube',
      {
        schema: {
          tags: ['Dataset'],
          summary: 'Create a new youtube dataset',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          body: z.object({
            url: z.string(),
          }),
          response: {
            201: z.object({
              datasetId: z.string(),
              status: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const { organization } = await request.getUserMembership(slug)
        const { url } = request.body

        const datasetService = makeDatasetService()
        const dataset = await datasetService.createYoutubeDataset(
          url,
          organization.id,
        )

        app.nc.publish(
          env.NATS_YOUTUBE_TOPIC,
          app.NATS.JSONCodec().encode({
            id: dataset.id,
            uri: dataset.uri,
          }),
        )

        reply
          .status(201)
          .send({ datasetId: dataset.id, status: dataset.status })
      },
    )

  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organization/:slug/dataset',
      {
        schema: {
          tags: ['Dataset'],
          summary: 'Get datasets of an organization',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              datasets: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  type: z.union([z.literal('YOUTUBE'), z.literal('PDF')]),
                  uri: z.string(),
                  status: z.union([
                    z.literal('PENDING'),
                    z.literal('PROCESSING'),
                    z.literal('READY'),
                  ]),
                  createdAt: z.date(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const { organization } = await request.getUserMembership(slug)
        const datasetService = makeDatasetService()

        const datasets = await datasetService.getDatasetsByOrganizationId(
          organization.id,
        )

        reply.status(200).send({ datasets })
      },
    )
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organization/:slug/dataset/:datasetId/blocks/raw',
      {
        schema: {
          tags: ['Dataset'],
          summary: 'Get raw blocks of a dataset',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            datasetId: z.string(),
          }),
          response: {
            200: z.object({
              blocks: z.array(
                z.object({
                  id: z.string(),
                  content: z.string(),
                  metadata: z.record(z.any()),
                  createdAt: z.date(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { datasetId } = request.params

        const datasetService = makeDatasetService()
        const blocks = await datasetService.getRawDatasetByDatasetId(datasetId)
        console.log(blocks)
        reply.status(200).send({ blocks })
      },
    )
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organization/:slug/dataset/:datasetId/blocks',
      {
        schema: {
          tags: ['Dataset'],
          summary: 'Get blocks of a dataset',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            datasetId: z.string(),
          }),
          response: {
            200: z.object({
              blocks: z.array(
                z.object({
                  id: z.string(),
                  content: z.string(),
                  label: z.string().nullish(),
                  createdAt: z.date(),
                  datasetId: z.string(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { datasetId } = request.params

        const datasetService = makeDatasetService()
        const blocks = await datasetService.getDatasetBlocks(datasetId)
        if (!blocks) {
          return reply.status(200).send({ blocks: [] })
        }
        reply.status(200).send({ blocks })
      },
    )
}
