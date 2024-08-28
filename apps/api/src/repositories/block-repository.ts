import type { Blocks, Prisma } from '@prisma/client'

export interface BlockRepository {
  findByDatasetId(datasetId: string): Promise<Blocks[] | null>
  create(dto: Prisma.BlocksCreateInput): Promise<Blocks>
}
