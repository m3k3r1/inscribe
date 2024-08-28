import type { VideoProvider } from './video-provider'

export class MockVideoProvider implements VideoProvider {
  async loadVideo(uri: string, datasetId: string): Promise<string> {
    return 'video.ogg'
  }
}
