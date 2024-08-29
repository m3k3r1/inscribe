import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import YouTubeLazyLoad from '@/components/youtube-embed'

import { DatasetDetailsBlocks } from './dataset-details-blocks'
import { DatasetDetailsTranscript } from './dataset-details-transcript'

export interface DatasetDetailsProps {
  id: string
  name: string
  url: string
}

export function DatasetDetails({ id, name, url }: DatasetDetailsProps) {
  return (
    <DialogContent className="max-w-[90vw] overflow-hidden">
      <DialogHeader>
        <DialogTitle>{name} </DialogTitle>
      </DialogHeader>
      <div className="flex h-full flex-col gap-4 sm:flex-row">
        <div className="mt-12 flex-1">
          <YouTubeLazyLoad title={name} url={url} />
        </div>

        <Tabs defaultValue="account" className="max-w-full sm:max-w-[45vw]">
          <div className="flex w-full flex-col items-center">
            <TabsList>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>
          </div>
          <DatasetDetailsTranscript id={id} />
          <DatasetDetailsBlocks id={id} />
        </Tabs>
      </div>
    </DialogContent>
  )
}
