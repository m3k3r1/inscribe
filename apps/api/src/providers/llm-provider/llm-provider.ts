import type { RawDataset } from '@prisma/client'

export type LlmTranscription = {
  content: string
  metadata: {
    from: string
    to: string
    source: string
    datasetId: string
    speakerId?: string
    order: number
  }
}

export type LlmInsight = {
  content: string
  type: string
  context: string
  datasetId: string
  rawDatasetId: string
}

export interface LlmProvider {
  transcribeAudio(uri: string, datasetId: string): Promise<LlmTranscription[]>
  createInsights(
    rawDataset: RawDataset[],
    usageCallback: (usage: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }) => void,
  ): Promise<LlmInsight[]>
  createFileInsights(
    rawDataset: RawDataset[],
    usageCallback: (usage: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }) => void,
  ): Promise<LlmInsight[]>
}
