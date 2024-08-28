export interface VideoProvider {
  getVideoInfo(uri: string): Promise<string>
  loadVideo(title: string, uri: string): Promise<string>
}
