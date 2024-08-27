/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client'

import { logger } from '@/http/server'

export const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
})

prisma.$on('info', (e: any) => {
  logger.info(e)
})

prisma.$on('warn', (e: any) => {
  logger.warn(e)
})

prisma.$on('error', (e: any) => {
  logger.error(e)
})

prisma.$on('query', (e: any) => {
  logger.debug('Query: ' + e.query)
  logger.debug('Params: ' + e.params)
  logger.debug('Duration: ' + e.duration + 'ms')
})
