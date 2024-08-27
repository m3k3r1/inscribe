import { FastifyPluginCallback } from 'fastify'
import { ConnectionOptions } from 'nats'

declare module 'fastify-nats-client' {
  const fastifyNatsClient: FastifyPluginCallback<ConnectionOptions>
  export default fastifyNatsClient
}
