import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
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

import { UnauthorizedError } from './_errors/unauthorized-error'
import { authenticateFromLink } from './routes/authenticate-from-link'
import { getUserProfile } from './routes/get-user-profile'
import { sendMagicLink } from './routes/send-magic-link'
import { stripeWebhook } from './routes/stripe-webhook'

export const logger = pino({ name: 'Inscribe' })

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Next.js SaaS',
      description: 'Full-stack SaaS with multi-tenant & RBAC.',
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
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})

app.register(fastifyNats, {
  natsOptions: { servers: env.NATS_SERVER_URL },
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(fastifyCors)

app.register(getUserProfile)
app.register(sendMagicLink)
app.register(authenticateFromLink)
app.register(stripeWebhook)

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

app.listen({ host: '0.0.0.0', port: env.SERVER_PORT }).then(() => {
  logger.info(`Server is running on port ${env.SERVER_PORT}🚀`)
})

app.ready().then(async () => {
  const sub = app.nc.subscribe(env.NATS_YOUTUBE_TOPIC, {})
  for await (const m of sub) {
    const decoded = app.NATS.JSONCodec().decode(m.data)
    logger.info(`[YOUTUBE:WORKER]: '${JSON.stringify(decoded)}'`)

    // const datasetService = makeDatasetService()
    // await datasetService.transcribeYoutubeVideo(decoded.id, decoded.uri)
  }
})
