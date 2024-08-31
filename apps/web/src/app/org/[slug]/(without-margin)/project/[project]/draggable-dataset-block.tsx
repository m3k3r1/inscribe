'use client'

import { Avatar, AvatarFallback } from '@radix-ui/react-avatar'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Info } from 'lucide-react'
import { useParams } from 'next/navigation'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import type { SelectType } from '@/hooks/use-ai-filters'
import { getDatasetBlocks } from '@/http/get-datasets-blocks'

dayjs.extend(relativeTime)

export interface DatasetBlockNodeEventData {
  datasetId: string
  blockId: string
  name: string
  content: string
  createdAt: string
}

function onDragStart(
  event: React.DragEvent<HTMLDivElement>,
  data: DatasetBlockNodeEventData,
) {
  event?.dataTransfer?.setData('datasetBlock', JSON.stringify(data))
}

export function DraggableDatasetBlock({
  datasetFilter,
  search,
  liveSearch,
  projectContent,
}: {
  datasetFilter: Set<SelectType>
  search: string
  liveSearch: boolean
  projectContent: string
}) {
  const { slug: orgSlug } = useParams<{
    slug: string
  }>()

  const { data: blocksData } = useQuery({
    queryKey: [
      orgSlug,
      'datasets',
      Array.from(datasetFilter).map((ds) => ds.value),
      'blocks',
    ],
    queryFn: () => {
      const datasetIds = Array.from(datasetFilter)
      if (datasetIds.length === 0) return []

      return Promise.all(
        datasetIds.map((dataset) => getDatasetBlocks(orgSlug!, dataset.value)),
      ).then((results) => {
        return results.flatMap((result) => result.blocks)
      })
    },
    enabled: !!orgSlug && datasetFilter.size > 0,
  })

  const blocks =
    blocksData
      ?.filter((block) => {
        if (liveSearch && projectContent) {
          const searchTerms = projectContent
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean)

          return searchTerms.some(
            (term) =>
              block.content.toLowerCase().includes(term) ||
              block.label.toLowerCase().includes(term),
          )
        } else {
          const searchTerms = search.toLowerCase().split(/\s+/).filter(Boolean)
          return searchTerms.every(
            (term) =>
              block.content.toLowerCase().includes(term) ||
              block.label.toLowerCase().includes(term),
          )
        }
      })
      .map((block) => ({
        name: block.label,
        datasetId: block.datasetId,
        blockId: block.id,
        content: block.content,
        createdAt: block.createdAt,
      })) || []

  function mapDatasetIdToName(datasetId: string) {
    const dataset = Array.from(datasetFilter).find(
      (dataset) => dataset.value === datasetId,
    )
    return dataset?.label || ''
  }

  return (
    <section className="snippet-section flex flex-col gap-2">
      {blocks.length === 0 ? (
        <div className="flex h-[80vh] items-center justify-center rounded-lg border-2 border-dashed  p-4 text-muted-foreground">
          <p>Select a dataset to view the blocks.</p>
        </div>
      ) : (
        blocks.map((d) => (
          <Card
            draggable="true"
            onDragStart={(event) => onDragStart(event, d)}
            key={d.blockId}
            className="snippet flex flex-col justify-between"
          >
            <CardContent className="p-4 px-8 text-sm">{d.content}</CardContent>
            <CardFooter className="flex items-center justify-between gap-1.5">
              <div>
                <Avatar className="size-4">
                  <AvatarFallback />
                </Avatar>
                <span className="truncate text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {mapDatasetIdToName(d.datasetId)}
                  </span>{' '}
                  {dayjs(d.createdAt).fromNow()}
                </span>
              </div>

              <Info size={14} />
            </CardFooter>
          </Card>
        ))
      )}
    </section>
  )
}
