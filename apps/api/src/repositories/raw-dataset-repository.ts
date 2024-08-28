import type { Prisma, RawDataset } from '@prisma/client'

export interface RawDatasetRepository {
  create(dto: Prisma.RawDatasetCreateInput): Promise<RawDataset>
  findByDatasetId(datasetId: string): Promise<RawDataset[] | null>
}
