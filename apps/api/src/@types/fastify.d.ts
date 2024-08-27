import 'fastify'

import { Codec, NatsConnection } from 'nats'

declare module 'fastify' {
  interface FastifyInstance {
    nats: NatsConnection
    nc: NatsConnection
    NATS: {
      JSONCodec: () => Codec<string>
    }
  }
  export interface FastifyRequest {
    getCurrentUserId(): Promise<string>
    getUserMembership(
      slug: string,
    ): Promise<{ organization: Organization; membership: Member }>
  }
}
