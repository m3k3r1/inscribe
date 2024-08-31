import fastifyCookie, { type FastifyCookieOptions } from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifyMultipart from '@fastify/multipart'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import { env } from '@saas/env'
import fastify from 'fastify'
// @ts-expect-error this import is not typed
import fastifyNats from 'fastify-nats-client'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import pino from 'pino'
import { ZodError } from 'zod'

import { makeDatasetService } from '@/services/factories/make-dataset-service'

import { UnauthorizedError } from './_errors/unauthorized-error'
import { authController } from './controllers/auth-controller'
import { datasetController } from './controllers/dataset-controller'
import { feedbackController } from './controllers/feedback-controller'
import { inviteController } from './controllers/invite-controller'
import { memberController } from './controllers/member-controller'
import { organizationController } from './controllers/organization-controller'
import { projectController } from './controllers/projects-controller'
import { usageController } from './controllers/usage-controller'
import { userController } from './controllers/user-controller'
import { webhookController } from './controllers/webhook-controller'

export const logger = pino({ name: 'Inscribe' })

const app = fastify({ logger }).withTypeProvider<ZodTypeProvider>()

app.register(fastifyCookie, {
  secret: 'ai-sass',
  parseOptions: {},
} as FastifyCookieOptions)

if (env.NODE_ENV !== 'production') {
  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Inscribe AI SaaS',
        description: 'AI SaaS with multi-tenant & RBAC.',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      servers: [],
    },
    transform: jsonSchemaTransform,
  })

  app.register(fastifySwaggerUI, {
    routePrefix: '/docs',
  })
}

app.register(fastifyMultipart, {
  limits: {
    fileSize: 1024 * 1024 * 10, // 10 MB
  },
})
app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(fastifyNats, {
  natsOptions: { servers: env.NATS_SERVER_URL },
})

app.register(fastifyCors)
app.register(authController)
app.register(userController)
app.register(organizationController)
app.register(projectController)
app.register(memberController)
app.register(inviteController)
app.register(datasetController)
app.register(webhookController)
app.register(usageController)
app.register(feedbackController)

app.setErrorHandler((error, request, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation error', errors: error.format() })
  }

  if (error instanceof UnauthorizedError) {
    return reply.status(401).send({ message: error.message })
  }

  if (env.NODE_ENV !== 'production') {
    logger.error(error)
  }
})

app.listen({ host: '0.0.0.0', port: env.SERVER_PORT }).then(() => {})

app.ready().then(async () => {
  const sub = app.nc.subscribe(env.NATS_YOUTUBE_TOPIC, {})
  for await (const m of sub) {
    const decoded = app.NATS.JSONCodec().decode(m.data)
    logger.info(`[YOUTUBE:WORKER]: '${JSON.stringify(decoded)}'`)

    const datasetService = makeDatasetService()
    await datasetService.transcribeYoutubeVideo(decoded.id, decoded.uri)
  }
})

app.ready().then(async () => {
  const sub = app.nc.subscribe(env.NATS_FILE_TOPIC, {})
  for await (const m of sub) {
    const decoded = app.NATS.JSONCodec().decode(m.data)
    logger.info(`[FILE:WORKER]: '${JSON.stringify(decoded)}'`)

    const datasetService = makeDatasetService()
    await datasetService.createFileBlocks(decoded.id)
  }
})
