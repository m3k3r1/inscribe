import type { Datasets, DatasetType, Prisma } from '@prisma/client'

export type CreateDatasetInput = {
  name: string
  type: DatasetType
  uri: string
  organizationId: string
}

export interface DatasetRepository {
  createDataset(dto: CreateDatasetInput): Promise<Datasets>
  findByOrganizationId(organizationId: string): Promise<Datasets[] | null>
  update(id: string, dto: Prisma.DatasetsUpdateInput): Promise<void>
  findById(id: string): Promise<Datasets | null>
}
