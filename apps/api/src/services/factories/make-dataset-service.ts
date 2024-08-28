import { OpenAILlmProvider } from '@/providers/llm-provider/open-ai-llm-provider'
import { YoutubeVideoProvider } from '@/providers/video-provider/youtube-video-provider'
import { PrismaBlockRepository } from '@/repositories/prisma/prisma-block-repository'
import { PrismaDatasetRepository } from '@/repositories/prisma/prisma-dataset-repository'
import { PrismaRawDatasetRepository } from '@/repositories/prisma/prisma-raw-dataset-repoository'

import { DatasetService } from '../dataset-service'

export function makeDatasetService() {
  const videoProvider = new YoutubeVideoProvider()
  const llmProvider = new OpenAILlmProvider()
  const datasetRepository = new PrismaDatasetRepository()
  const rawDatasetRepository = new PrismaRawDatasetRepository()
  const blockRepository = new PrismaBlockRepository()

  return new DatasetService(
    datasetRepository,
    rawDatasetRepository,
    blockRepository,
    videoProvider,
    llmProvider,
  )
}
