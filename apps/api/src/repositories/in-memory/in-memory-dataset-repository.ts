import { type Datasets, DatasetStatus } from '@prisma/client'
import { randomUUID } from 'crypto'

import type {
  CreateDatasetInput,
  DatasetRepository,
  UpdateDatasetInput,
} from '../dataset-repository'

export class InMemoryDatasetRepository implements DatasetRepository {
  public items: Datasets[] = []

  async createDataset(dto: CreateDatasetInput) {
    const dataset = {
      id: randomUUID(),
      name: dto.name,
      type: dto.type,
      uri: dto.uri,
      status: DatasetStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      organizationId: dto.organizationId,
    }

    this.items.push(dataset)

    return dataset
  }

  async findByOrganizationId(organizationId: string) {
    const datataset = this.items.filter(
      (item) => item.organizationId === organizationId,
    )

    if (!datataset) {
      return null
    }

    return datataset
  }

  async update(dto: UpdateDatasetInput) {
    const dataset = this.items.find((item) => item.id === dto.id)

    if (!dataset) {
      throw new Error('Dataset not found')
    }

    if (dto.status) {
      dataset.status = dto.status
    }
  }
}
