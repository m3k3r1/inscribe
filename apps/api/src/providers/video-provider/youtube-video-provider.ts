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
    const proxies = [env.PROXY_CONFIG_1, env.PROXY_CONFIG_2]
    const randomProxy = proxies[Math.floor(Math.random() * proxies.length)]
    logger.debug('[YOUTUBE-PROVIDER] Using proxy:', randomProxy)

    const proxyUrl = new URL(randomProxy)
    proxyUrl.username = env.PROXY_AUTH.split(':')[0]
    proxyUrl.password = env.PROXY_AUTH.split(':')[1]

    this.vpnAgent = ytdl.createProxyAgent({
      uri: proxyUrl.toString(),
    })
  }

  async getVideoInfo(uri: string): Promise<string> {
    try {
      logger.debug(
        '[YOUTUBE-PROVIDER] Attempting to fetch video info with proxy',
      )
      const info = await ytdl.getInfo(uri, { agent: this.vpnAgent })
      logger.debug('[YOUTUBE-PROVIDER] Successfully fetched video info')
      return info.videoDetails.title
    } catch (error) {
      logger.error('[YOUTUBE-PROVIDER] Proxy error:', error)
      throw error
    }
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
