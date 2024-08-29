'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { Onborda, OnbordaProvider } from 'onborda'
import { ReactNode } from 'react'

import OnboardingCard from '@/components/onboarding/onboarding-card'
import { tours } from '@/components/onboarding/steps'
import { Toaster } from '@/components/ui/sonner'
import { AiFiltersContextProvider } from '@/hooks/use-ai-filters'
import { queryClient } from '@/lib/react-query'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
      >
        <Toaster richColors />
        <AiFiltersContextProvider>
          <OnbordaProvider>
            <Onborda
              steps={tours}
              cardComponent={OnboardingCard}
              shadowOpacity="0.6"
            >
              {children}
            </Onborda>
          </OnbordaProvider>
        </AiFiltersContextProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
