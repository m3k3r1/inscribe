import ytdl from '@distube/ytdl-core'
import { env } from '@saas/env'
import ffmpeg from 'fluent-ffmpeg'
import fs, { createWriteStream } from 'fs'

import { logger } from '@/http/server'
import { createSlug } from '@/utils/create-slug'

import type { VideoProvider } from './video-provider'

export class YoutubeVideoProvider implements VideoProvider {
  private vpnAgent: ytdl.Agent

  constructor() {
    const proxies = [
      env.PROXY_CONFIG_1,
      env.PROXY_CONFIG_2,
      env.PROXY_CONFIG_3,
      env.PROXY_CONFIG_4,
      env.PROXY_CONFIG_5,
    ]
    const randomProxy = proxies[Math.floor(Math.random() * proxies.length)]
    this.vpnAgent = ytdl.createProxyAgent({
      uri: randomProxy,
      headers: {
        'Proxy-Authorization': `Basic ${Buffer.from(env.PROXY_AUTH).toString('base64')}`,
      },
    })
  }

  async getVideoInfo(uri: string): Promise<string> {
    const info = await ytdl.getInfo(uri, { agent: this.vpnAgent })
    return info.videoDetails.title
  }

  async loadVideo(title: string, uri: string): Promise<string> {
    const name = createSlug(title)
    const fileName = `${name}.mp3`
    const audioStream = ytdl(uri, { filter: 'audioonly', agent: this.vpnAgent })

    const writeStream = createWriteStream(fileName)
    audioStream
      .pipe(writeStream)
      .on('finish', () => {
        logger.info('[YOUTUBE-DOWNLOADER] - Download finished.')
      })
      .on('error', (err) => {
        logger.error('[YOUTUBE-DOWNLOADER] - Error writing file:', err)
      })

    return new Promise((resolve, reject) => {
      writeStream.on('finish', async () => {
        const file = await this.optimizeAudio(name)
        resolve(file)
      })

      audioStream.on('progress', (chunkLength, downloaded, total) => {
        logger.debug(
          `[YOUTUBE-DOWNLOADER] - Progress: ${((downloaded / total) * 100).toFixed(2)}%`,
        )
      })

      audioStream.on('error', (err) => {
        logger.error('[YOUTUBE-DOWNLOADER] - Error: ', err)
        reject(err)
      })

      writeStream.on('error', (err) => {
        reject(err)
      })
    })
  }

  async optimizeAudio(filename: string): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg(`${filename}.mp3`)
        .noVideo()
        .outputOptions([
          '-map_metadata',
          '-1',
          '-ac',
          '1',
          '-c:a',
          'libopus',
          '-b:a',
          '12k',
          '-application',
          'voip',
        ])
        .output(`${filename}.ogg`)
        .on('end', () => {
          logger.debug(`[FFMPEG] - Processing finished successfully`)
          if (fs.existsSync(`${filename}.mp3`)) {
            fs.unlinkSync(`${filename}.mp3`)
          }
          resolve(`${filename}.ogg`)
        })
        .on('error', (err) => {
          console.error('[FFMPEG] - Error: ' + err.message)
          logger.error(err)
          reject(err)
        })
        .run()
    })
  }
}
