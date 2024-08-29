'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TabsContent } from '@/components/ui/tabs'
import { getDatasetBlocks } from '@/http/get-datasets-blocks'

export interface DatasetDetailsBlocksProps {
  id: string
}
export function DatasetDetailsBlocks({ id }: DatasetDetailsBlocksProps) {
  const { slug: orgSlug } = useParams<{
    slug: string
  }>()

  const { data } = useQuery({
    queryKey: [orgSlug, 'datasets', id, 'blocks'],
    queryFn: () => getDatasetBlocks(orgSlug!, id),
    enabled: !!orgSlug,
  })

  return (
    <TabsContent value="content">
      <ScrollArea className="h-[400px] flex-1 rounded-md border p-4">
        <div className="space-y-4 p-4">
          {data?.blocks.map((block) => (
            <Card key={block.id} className="flex flex-col justify-between">
              <CardHeader>
                <CardDescription>{block.content}</CardDescription>
              </CardHeader>
              <CardFooter className="flex items-center gap-1.5">
                <p className="rounded-full bg-gray-500 px-3 py-1 text-xs text-white">
                  {block.label}
                </p>
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </TabsContent>
  )
}
