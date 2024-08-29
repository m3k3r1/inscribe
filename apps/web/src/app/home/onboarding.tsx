'use client'

import { Sparkles } from 'lucide-react'
import { useOnborda } from 'onborda'

import { Button } from '@/components/ui/button'

export function Onboarding() {
  const { startOnborda } = useOnborda()

  function handleStartOnborda() {
    startOnborda('firsttour')
  }
  return (
    <Button size="lg" onClick={handleStartOnborda}>
      <Sparkles size={16} className="mr-2" /> Start the tour
    </Button>
  )
}
