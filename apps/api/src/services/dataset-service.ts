import { DatasetStatus, type Prisma } from '@prisma/client'
import fs from 'fs'

import type { LlmProvider } from '@/providers/llm-provider/llm-provider'
import type { VideoProvider } from '@/providers/video-provider/video-provider'
import type { BlockRepository } from '@/repositories/block-repository'
import type { DatasetRepository } from '@/repositories/dataset-repository'
import type { RawDatasetRepository } from '@/repositories/raw-dataset-repository'

export class DatasetService {
  constructor(
    private datasetRepository: DatasetRepository,
    private rawDatasetRepository: RawDatasetRepository,
    private blockRepository: BlockRepository,
    private videoProvider: VideoProvider,
    private llmProvider: LlmProvider,
  ) {}

  async createYoutubeDataset(url: string, organizationId: string) {
    return this.datasetRepository.createDataset({
      name: 'Loading...',
      type: 'YOUTUBE',
      uri: url,
      organizationId,
    })
  }

  async getDatasetBlocks(datasetId: string) {
    return this.blockRepository.findByDatasetId(datasetId)
  }

  async getDatasetsByOrganizationId(organizationId: string) {
    return this.datasetRepository.findByOrganizationId(organizationId)
  }

  async getRawDatasetByDatasetId(datasetId: string) {
    const datasets = await this.rawDatasetRepository.findByDatasetId(datasetId)
    if (!datasets) {
      return []
    }

    const sortedDatasets = datasets.sort((a, b) => {
      const orderA = (a.metadata as Prisma.JsonObject).order?.valueOf() || 0
      const orderB = (b.metadata as Prisma.JsonObject).order?.valueOf() || 0

      return +orderA - +orderB
    })

    return sortedDatasets
  }

  async transcribeYoutubeVideo(datasetId: string, uri: string) {
    const name = await this.videoProvider.getVideoInfo(uri)

    await this.datasetRepository.update(datasetId, {
      name,
      status: DatasetStatus.PROCESSING,
    })

    const filename = await this.videoProvider.loadVideo(name, uri)

    const transcript = await this.llmProvider.transcribeAudio(
      filename,
      datasetId,
    )

    transcript.map(async (t) => {
      await this.rawDatasetRepository.create({
        content: t.content,
        metadata: { ...t.metadata },
        dataset: {
          connect: {
            id: datasetId,
          },
        },
      })
    })

    await this.datasetRepository.update(datasetId, {
      status: DatasetStatus.PROCESSING,
    })

    await this.createBlocks(datasetId)

    await this.datasetRepository.update(datasetId, {
      status: DatasetStatus.READY,
    })

    if (fs.existsSync(filename)) {
      fs.unlinkSync(filename)
    }
  }

  async createBlocks(datasetId: string) {
    const dataset = await this.datasetRepository.findById(datasetId)
    const rawDataset = await this.getRawDatasetByDatasetId(datasetId)
    const insights = await this.llmProvider.createInsights(rawDataset)

    insights.map(async (i) => {
      await this.blockRepository.create({
        content: i.content,
        label: i.type,
        dataset: {
          connect: {
            id: datasetId,
          },
        },
        rawDataset: {
          connect: {
            id: i.rawDatasetId,
          },
        },
        organization: {
          connect: {
            id: dataset?.organizationId,
          },
        },
      })
    })
  }
}
