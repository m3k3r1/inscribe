import type { Blocks, Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import type { BlockRepository } from '../block-repository'

export class PrismaBlockRepository implements BlockRepository {
  findByDatasetId(datasetId: string): Promise<Blocks[] | null> {
    return prisma.blocks.findMany({
      where: {
        datasetId,
        dataset: {
          isDeleted: false,
        },
      },
      // include: {
      //   dataset: {
      //     select: {
      //       id: true,
      //       name: true,
      //     },
      //   },
      // },
    })
  }

  create(dto: Prisma.BlocksCreateInput): Promise<Blocks> {
    return prisma.blocks.create({
      data: {
        ...dto,
      },
    })
  }
}
