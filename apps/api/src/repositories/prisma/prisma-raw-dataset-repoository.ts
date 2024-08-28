import type { Prisma, RawDataset } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import type { RawDatasetRepository } from '../raw-dataset-repository'

export class PrismaRawDatasetRepository implements RawDatasetRepository {
  create(dto: Prisma.RawDatasetCreateInput): Promise<RawDataset> {
    return prisma.rawDataset.create({ data: dto })
  }

  findByDatasetId(datasetId: string): Promise<RawDataset[] | null> {
    return prisma.rawDataset.findMany({
      where: {
        datasetId,
      },
    })
  }
}
