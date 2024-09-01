'use client'

import dayjs from 'dayjs'
import { Loader2, Search, Trash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { TableCell, TableRow } from '@/components/ui/table'

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
      <TableCell className="text-muted-foreground">
        {dayjs(createdAt).fromNow()}
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
      <TableCell className="font-medium">Miguel Dias</TableCell>
      <TableCell>
        <Button variant="outline" className="text-red-400" size="xs">
          <Trash className="mr-2 h-3 w-3" />
          Delete
        </Button>
      </TableCell>
    </TableRow>
  )
}
