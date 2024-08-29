import { Header } from '@/components/header'
import { Tabs } from '@/components/tabs'

export default function OrgLayoutWithoutMargin({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div>
      <div className="pt-6">
        <Header />
        <Tabs />
      </div>

      <main className="mx-12 mt-4">{children}</main>
    </div>
  )
}
