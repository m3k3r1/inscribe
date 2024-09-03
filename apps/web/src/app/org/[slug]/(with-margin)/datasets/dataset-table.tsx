'use client'

import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useParams } from 'next/navigation'

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getDatasets } from '@/http/get-datasets'

import DatasetsTableRow from './dataset-table-row'
import { DatasetTableSkeleton } from './dataset-table-skeleton'

dayjs.extend(relativeTime)

export default function DatasetsTable() {
  const { slug: orgSlug } = useParams<{
    slug: string
  }>()

  const { data, isLoading } = useQuery({
    queryKey: [orgSlug, 'datasets'],
    queryFn: () => getDatasets(orgSlug!),
    enabled: !!orgSlug,
  })

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[64px]"></TableHead>
          <TableHead className="w-[340px]">ID</TableHead>
          <TableHead className="w-[280px]">Name</TableHead>
          <TableHead className="w-[140px]">Status</TableHead>
          <TableHead className="w-[180px]">Uploaded at</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && <DatasetTableSkeleton />}
        {data &&
          data.datasets.map((dataset) => {
            return <DatasetsTableRow key={dataset.id} dataset={dataset} />
          })}
      </TableBody>
    </Table>
  )
}
