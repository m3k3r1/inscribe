'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'

import { ScrollArea } from '@/components/ui/scroll-area'
import { TabsContent } from '@/components/ui/tabs'
import { getDatasetRawBlocks } from '@/http/get-datasets-raw-blocks'

export interface DatasetDetailsTranscriptProps {
  id: string
}
export function DatasetDetailsTranscript({
  id,
}: DatasetDetailsTranscriptProps) {
  const { slug: orgSlug } = useParams<{
    slug: string
  }>()

  const { data } = useQuery({
    queryKey: [orgSlug, 'datasets', id, 'raw-blocks'],
    queryFn: () => getDatasetRawBlocks(orgSlug!, id),
    enabled: !!orgSlug,
  })

  return (
    <TabsContent value="transcript">
      <ScrollArea className="h-[400px] flex-1 rounded-md border p-4">
        <div className="space-y-4 p-4">
          {data?.blocks.map((block) => (
            <div key={block.id} id={block.id}>
              {block.metadata.from && (
                <h3 className="text-xs text-muted-foreground">
                  {block.metadata.from} - {block.metadata.to}
                </h3>
              )}
              <p className="">{block.content}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </TabsContent>
  )
}
