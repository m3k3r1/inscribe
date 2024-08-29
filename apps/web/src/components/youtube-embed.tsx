import { AspectRatio } from '@radix-ui/react-aspect-ratio'
import NextImage from 'next/image'
import { useState } from 'react'

import { Button } from './ui/button'

interface YouTubeLazyLoadProps {
  title: string
  url: string
}

export default function YouTubeLazyLoad({ title, url }: YouTubeLazyLoadProps) {
  const [showVideo, setShowVideo] = useState(false)

  function getYotubeId(url: string) {
    return url.slice(url.indexOf('v=') + 2)
  }

  return (
    <div>
      {showVideo ? (
        <iframe
          width={560}
          height={315}
          src={`https://www.youtube-nocookie.com/embed/${getYotubeId(url)}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
          className="aspect-[16/9] h-full w-full p-0"
        />
      ) : (
        <Button type="button" onClick={() => setShowVideo(true)} asChild>
          <AspectRatio ratio={16 / 9} className="h-full">
            <NextImage
              src={`https://i3.ytimg.com/vi/${getYotubeId(url)}/maxresdefault.jpg`}
              alt="video-thumbnail"
              layout="fill"
              className="h-full w-full"
              loading="lazy"
            />
          </AspectRatio>
        </Button>
      )}
    </div>
  )
}
