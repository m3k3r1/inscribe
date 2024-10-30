import ytdl from '@distube/ytdl-core'
import { env } from '@saas/env'
import ffmpeg from 'fluent-ffmpeg'
import fs, { createWriteStream } from 'fs'

import { logger } from '@/http/server'
import { createSlug } from '@/utils/create-slug'

import type { VideoProvider } from './video-provider'

export class YoutubeVideoProvider implements VideoProvider {
  private vpnAgent: ytdl.Agent

  private readonly userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  ]

  private getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)]
  }

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
    let lastError: Error | null = null
    const maxRetries = 3

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const options = {
          agent: this.vpnAgent,
          requestOptions: {
            headers: {
              'User-Agent': this.getRandomUserAgent(),
              Accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              Connection: 'keep-alive',
            },
          },
        }

        const info = await ytdl.getInfo(uri, options)
        logger.debug('[YOUTUBE-PROVIDER] Successfully fetched video info')
        return info.videoDetails.title
      } catch (error) {
        lastError = error
        logger.warn(
          `[YOUTUBE-PROVIDER] Attempt ${attempt + 1} failed:`,
          error.message,
        )

        // Create new proxy agent for next attempt
        const [proxyUser, proxyPass] = env.PROXY_AUTH.split(':')
        const proxies = [
          env.PROXY_CONFIG_1,
          env.PROXY_CONFIG_2,
          env.PROXY_CONFIG_3,
          env.PROXY_CONFIG_4,
          env.PROXY_CONFIG_5,
        ]
        const randomProxy = proxies[Math.floor(Math.random() * proxies.length)]
        const proxyUrlWithAuth = randomProxy.replace(
          'http://',
          `http://${proxyUser}:${proxyPass}@`,
        )
        this.vpnAgent = new HttpsProxyAgent(proxyUrlWithAuth)

        // Wait a bit before retrying
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (attempt + 1)),
        )
      }
    }

    throw lastError || new Error('All retry attempts failed')
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
