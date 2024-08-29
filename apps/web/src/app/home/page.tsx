import { Header } from '@/components/header'

import { Onboarding } from './onboarding'

export default function Home() {
  return (
    <div className="space-y-4 py-4">
      <Header />
      <main className="mx-auto w-full max-w-[1200px] space-y-4">
        <p className="text-sm text-muted-foreground">Select an organization</p>

        <Onboarding />

        <div id="onborda-step1">agasdf</div>
      </main>
    </div>
  )
}
