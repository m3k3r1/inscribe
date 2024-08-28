import { randomUUID } from 'node:crypto'

import type { Prisma, RawDataset } from '@prisma/client'
import type { JsonValue } from '@prisma/client/runtime/library'

import type { RawDatasetRepository } from '../raw-dataset-repository'

export class InMemoryRawDatasetRepository implements RawDatasetRepository {
  public items: RawDataset[] = []
  async create(dto: Prisma.RawDatasetCreateInput) {
    const rawDataset = {
      id: randomUUID(),
      content: dto.content,
      metadata: dto.metadata as JsonValue,
      datasetId: dto.dataset.connect?.id || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.items.push(rawDataset)
    return rawDataset
  }

  async findByDatasetId(datasetId: string) {
    return this.items.filter((item) => item.datasetId === datasetId)
  }
}
