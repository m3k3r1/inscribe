import type { LlmProvider } from './llm-provider'

export class MockLLMProvider implements LlmProvider {
  async transcribeAudio(uri: string, datasetId: string) {
    return [
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
  }
}
