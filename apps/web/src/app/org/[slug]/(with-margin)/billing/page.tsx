import { env } from '@saas/env'
import { Info } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getUsage } from '@/http/get-usage'

export default async function Billing() {
  const usage = await getUsage()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Billing</h1>

        <Button size="sm" asChild>
          <Link
            href={`${env.STRIPE_CUSTOMER_PORTAL_URL}?prefilled_email=m3k3r1@gmail.com`}
          >
            <Info className="mr-2 size-4" />
            Manage subscription
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Usage</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead className="text-right" style={{ width: 120 }}>
                Characters
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usage.usage.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.project?.name}</TableCell>
                <TableCell className="text-right">{item.totalTokens}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
