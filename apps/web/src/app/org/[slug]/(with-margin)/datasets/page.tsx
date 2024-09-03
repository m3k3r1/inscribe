import { Plus } from 'lucide-react'
import Link from 'next/link'

import { getCurrentOrg } from '@/auth/auth'
import { MaxLimitDialog } from '@/components/max-limit-dialog'
import { Button } from '@/components/ui/button'
import { getDatasetUsage } from '@/http/get-dataset-usage'
import { getProfile } from '@/http/get-profile'
import { getUsage } from '@/http/get-usage'

import DatasetsTable from './dataset-table'

export default async function Datasets() {
  const currentOrg = getCurrentOrg() || ''
  const usage = await getUsage()
  const datasetUsage = await getDatasetUsage()
  const { user } = await getProfile()

  const datasetUsageCalculated = datasetUsage.usage.reduce((acc, curr) => {
    acc += curr.totalTokens
    return acc
  }, 0)

  const projectUsageCalculated = usage.usage.reduce((acc, curr) => {
    acc += curr.totalTokens
    return acc
  }, 0)

  const absoluteToken = projectUsageCalculated + datasetUsageCalculated

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Datasets</h1>

        {user.tokenLimit > absoluteToken && (
          <Button size="sm" asChild>
            <Link href={`/org/${currentOrg}/upload-data`}>
              <Plus className="mr-2 size-4" />
              Upload data
            </Link>
          </Button>
        )}
        {absoluteToken >= user.tokenLimit && <MaxLimitDialog />}
      </div>
      <div className="space-y-2.5">
        <div className="rounded-md border">
          <DatasetsTable />
        </div>
      </div>
    </div>
  )
}
