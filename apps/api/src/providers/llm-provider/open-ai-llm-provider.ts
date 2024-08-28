import { StructuredOutputParser } from '@langchain/core/output_parsers'
import { PromptTemplate } from '@langchain/core/prompts'
import { RunnableSequence } from '@langchain/core/runnables'
import { ChatOpenAI } from '@langchain/openai'
import type { RawDataset } from '@prisma/client'
import fs from 'fs'
import { OpenAI } from 'openai'
import { z } from 'zod'

import { logger } from '@/http/server'

import type { LlmInsight, LlmTranscription } from './llm-provider'

export class OpenAILlmProvider {
  private client: OpenAI

  constructor() {
    this.client = new OpenAI()
  }

  async transcribeAudio(
    uri: string,
    datasetId: string,
  ): Promise<LlmTranscription[]> {
    logger.info('[OPENAI-LLM] - Starting transcription...')
    const transcription = await this.client.audio.transcriptions.create({
      file: fs.createReadStream(uri),
      model: 'whisper-1',
      response_format: 'srt',
    })
    logger.info('[OPENAI-LLM] -  Transcription done.')

    return this.srtToTranscriptions(transcription, uri, datasetId)
  }

  async createInsights(rawDataset: RawDataset[]): Promise<LlmInsight[]> {
    const jsonData = JSON.stringify(rawDataset, null, 2)

    const parser = StructuredOutputParser.fromZodSchema(
      z.array(
        z.object({
          content: z
            .string()
            .describe(
              'Provides a well-rounded, synthesized block of information derived from the original transcript.',
            ),
          label: z
            .string()
            .describe(
              'Specifies the nature of the block, such as “overview,” "quote," “insight.” or what you think is best',
            ),
          context: z
            .string()
            .describe('Describes the purpose or focus of the block.'),
          datasetId: z
            .string()
            .describe('Dataset ID do not invent use the provided dataset ID'),
          id: z.string().describe('use the provided id do not invent'),
        }),
      ),
    )

    const chain = RunnableSequence.from([
      PromptTemplate.fromTemplate(
        `You are an expert in extracting actionable insights from transcripts. When provided with a transcript,
        your task is to create substantial and self-contained blocks of information that synthesize content from
        different parts of the transcript. Each block should be detailed enough to stand on its own, and should
        include the following keys:{format_instructions}\n{transcript}
        `,
      ),
      new ChatOpenAI({ model: 'gpt-4o', temperature: 0 }),
      parser,
    ])

    const response = await chain.invoke({
      transcript: jsonData,
      format_instructions: parser.getFormatInstructions(),
    })

    const insights: LlmInsight[] = []
    for (const insight of response) {
      insights.push({
        content: insight.content,
        type: insight.label,
        context: insight.context,
        datasetId: insight.datasetId,
        rawDatasetId: insight.id,
      })
    }

    return insights
  }

  srtToTranscriptions(
    srt: string,
    source: string,
    datasetId: string,
  ): LlmTranscription[] {
    const srtLines = srt.split('\n').filter((line) => line.trim() !== '')
    const transcriptions: LlmTranscription[] = []

    let order = 0
    for (let i = 0; i < srtLines.length; i++) {
      const timeLine = srtLines[i]
      const contentLine = srtLines[i + 1]

      if (timeLine.includes('-->')) {
        const [from, to] = timeLine.split(' --> ')
        order += 1

        const transcription: LlmTranscription = {
          content: contentLine.trim(),
          metadata: {
            from: from.trim(),
            to: to.trim(),
            source,
            datasetId,
            order,
          },
        }

        transcriptions.push(transcription)
        i++
      }
    }

    return transcriptions
  }
}
