'use client'

import { useMutation } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { Loader2, Search, Trash } from 'lucide-react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { TableCell, TableRow } from '@/components/ui/table'
import { deleteDataset } from '@/http/delete-dataset'
import { queryClient } from '@/lib/react-query'

import { DatasetDetails } from './dataset-details'

interface DatasetsTableRowProps {
  dataset: {
    id: string
    name: string
    uri: string
    type: 'YOUTUBE' | 'PDF'
    status: 'PENDING' | 'PROCESSING' | 'READY'
    createdAt: string
  }
}

export default function DatasetsTableRow({
  dataset: { id, status, type, name, uri, createdAt },
}: DatasetsTableRowProps) {
  const { slug: orgSlug } = useParams<{ slug: string }>()

  const { mutateAsync } = useMutation({
    mutationFn: (datasetId: string) => deleteDataset(orgSlug!, datasetId),
    onSuccess: () => {
      toast.success('Dataset deleted')
    },
    onError: () => {
      toast.error('Failed to delete dataset')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [orgSlug, 'datasets'] })
    },
  })

  return (
    <TableRow>
      <TableCell>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="xs">
              <Search className="h-3 w-3" />
              <span className="sr-only">Dataset details</span>
            </Button>
          </DialogTrigger>
          <DatasetDetails id={id} name={name} type={type} url={uri} />
        </Dialog>
      </TableCell>
      <TableCell className="font-mono text-xs font-medium">{id}</TableCell>
      <TableCell className="font-mono text-xs font-medium">
        {name === 'Loading...' ? (
          <Loader2 className=" size-4 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          name
        )}
      </TableCell>

      <TableCell>
        {status === 'PENDING' && (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            <span className="font-medium text-muted-foreground">Pending</span>
          </div>
        )}
        {status === 'PROCESSING' && (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-yellow-400" />
            <span className="font-medium text-muted-foreground">
              Processing
            </span>
          </div>
        )}
        {status === 'READY' && (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            <span className="font-medium text-muted-foreground">Ready</span>
          </div>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {dayjs(createdAt).fromNow()}
      </TableCell>
      <TableCell>
        <Button
          variant="outline"
          className="text-red-400"
          size="xs"
          onClick={() => mutateAsync(id)}
        >
          <Trash className="mr-2 h-3 w-3" />
          Delete
        </Button>
      </TableCell>
    </TableRow>
  )
}
