import { Plus } from 'lucide-react'
import Link from 'next/link'

import { getCurrentOrg } from '@/auth/auth'
import { Button } from '@/components/ui/button'

import DatasetsTable from './dataset-table'

export default function Datasets() {
  const currentOrg = getCurrentOrg()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Datasets</h1>

        <Button size="sm" asChild>
          <Link href={`/org/${currentOrg}/upload-data`}>
            <Plus className="mr-2 size-4" />
            Upload data
          </Link>
        </Button>
      </div>
      <div className="space-y-2.5">
        <div className="rounded-md border">
          <DatasetsTable />
        </div>
      </div>
    </div>
  )
}
