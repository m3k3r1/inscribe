import { uiEnv as env } from '@saas/env'
import { Info, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

import { BillingList } from './billing-list'

export default async function Billing() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Billing</h1>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" disabled>
            {/* <Link href="https://buy.stripe.com/test_3csg1lgoXfvY8aQ9AI"> */}
            <ShoppingBag className="mr-2 size-4" />
            Buy tokens
            {/* </Link> */}
          </Button>
          <Button size="sm" asChild>
            <Link
              href={`${env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL}?prefilled_email=m3k3r1@gmail.com`}
            >
              <Info className="mr-2 size-4" />
              Manage subscription
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Usage</h2>
        <BillingList />
      </div>
    </div>
  )
}
