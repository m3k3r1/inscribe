import type { Datasets, Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import type {
  CreateDatasetInput,
  DatasetRepository,
} from '../dataset-repository'

export class PrismaDatasetRepository implements DatasetRepository {
  createDataset({
    name,
    type,
    uri,
    organizationId,
  }: CreateDatasetInput): Promise<Datasets> {
    return prisma.datasets.create({
      data: {
        name,
        type,
        uri,
        organizationId,
      },
    })
  }

  findByOrganizationId(organizationId: string): Promise<Datasets[]> {
    return prisma.datasets.findMany({
      where: { organizationId, isDeleted: false },
    })
  }

  async update(id: string, dto: Prisma.DatasetsUpdateInput): Promise<void> {
    await prisma.datasets.update({
      where: { id },
      data: {
        ...dto,
      },
    })
  }

  async findById(id: string): Promise<Datasets | null> {
    return prisma.datasets.findUnique({
      where: { id, isDeleted: false },
    })
  }
}
