import { DatasetStatus } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { LlmProvider } from '@/providers/llm-provider/llm-provider'
import { MockLLMProvider } from '@/providers/llm-provider/mock-llm-provider'
import { MockVideoProvider } from '@/providers/video-provider/mock-video-provider'
import type { VideoProvider } from '@/providers/video-provider/video-provider'
import type { DatasetRepository } from '@/repositories/dataset-repository'
import { InMemoryDatasetRepository } from '@/repositories/in-memory/in-memory-dataset-repository'
import { InMemoryRawDatasetRepository } from '@/repositories/in-memory/in-memory-raw-dataset-repository'
import type { RawDatasetRepository } from '@/repositories/raw-dataset-repository'

import { DatasetService } from './dataset-service'

let datasetRepository: DatasetRepository
let rawDatasetRepository: RawDatasetRepository
let datasetService: DatasetService
let videoProvider: VideoProvider
let llmProvider: LlmProvider

const transcriptMock = [
  {
    content:
      'Go, a statically-typed compiled language often described as C for the 21st century.',
    metadata: {
      from: '00:00:00,000',
      to: '00:00:06,000',
      source: 'go-in-100-seconds.ogg',
      datasetId: '9995423d-6214-49ab-8f9a-832ff19c903c',
      speaker: null,
      order: 1,
    },
  },
  {
    content:
      "It's a popular choice for high-performance server-side applications,",
    metadata: {
      from: '00:00:06,000',
      to: '00:00:09,800',
      source: 'go-in-100-seconds.ogg',
      datasetId: '9995423d-6214-49ab-8f9a-832ff19c903c',
      speaker: null,
      order: 2,
    },
  },
  {
    content:
      'and is the language that built tools like Docker, CockroachDB, and Dgraph.',
    metadata: {
      from: '00:00:09,800',
      to: '00:00:14,300',
      source: 'go-in-100-seconds.ogg',
      datasetId: '9995423d-6214-49ab-8f9a-832ff19c903c',
      speaker: null,
      order: 3,
    },
  },
  {
    content:
      'It was created at Google in 2007 by legends who really know their stuff,',
    metadata: {
      from: '00:00:14,300',
      to: '00:00:18,500',
      source: 'go-in-100-seconds.ogg',
      datasetId: '9995423d-6214-49ab-8f9a-832ff19c903c',
      speaker: null,
      order: 4,
    },
  },
]

describe('Dataset Service', () => {
  beforeEach(() => {
    datasetRepository = new InMemoryDatasetRepository()
    rawDatasetRepository = new InMemoryRawDatasetRepository()
    videoProvider = new MockVideoProvider()
    llmProvider = new MockLLMProvider()
    datasetService = new DatasetService(
      datasetRepository,
      rawDatasetRepository,
      videoProvider,
      llmProvider,
    )

    vi.spyOn(videoProvider, 'loadVideo').mockResolvedValue('video.ogg')
    vi.spyOn(llmProvider, 'transcribeAudio').mockResolvedValue(transcriptMock)
  })

  it('should create a yotuube dataset', async () => {
    const dataset = await datasetService.createYoutubeDataset(
      'https://www.youtube.com/watch?v=123',
      'organization-id',
    )

    expect(dataset.name).toBe('Loading...')
    expect(dataset.type).toBe('YOUTUBE')
    expect(dataset.status).toBe(DatasetStatus.PENDING)
  })

  it('should transcribe a youtube video', async () => {
    const dataset = await datasetService.createYoutubeDataset(
      'https://www.youtube.com/watch?v=123',
      'organization-id',
    )

    await datasetService.transcribeYoutubeVideo(dataset.id, dataset.uri)

    expect(videoProvider.loadVideo).toHaveBeenCalledWith(
      'https://www.youtube.com/watch?v=123',
      dataset.id,
    )
    expect(llmProvider.transcribeAudio).toHaveBeenCalledWith(
      'video.ogg',
      dataset.id,
    )

    const datasets =
      await datasetRepository.findByOrganizationId('organization-id')

    expect(datasets).toHaveLength(1)
    expect(datasets![0].status).toBe(DatasetStatus.READY)

    const rawDatasets = await rawDatasetRepository.findByDatasetId(dataset.id)
    expect(rawDatasets).toHaveLength(4)
  })
})
