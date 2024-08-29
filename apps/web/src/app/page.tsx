import { redirect } from 'next/navigation'

import { isAuthenticated } from '@/auth/auth'
import CallToActionSection from '@/components/landing/cta-section'
import HeroSection from '@/components/landing/hero-section'
import PricingSection from '@/components/landing/pricing-section'
import { SiteHeader } from '@/components/landing/site-header'
import Particles from '@/components/magicui/particles'
import { SphereMask } from '@/components/magicui/sphere-mask'

export default async function Home() {
  if (isAuthenticated()) {
    redirect('/home')
  }

  return (
    <>
      {/* <SiteBanner /> */}
      <SiteHeader />
      <main className="mx-auto flex-1 overflow-hidden">
        <HeroSection />
        {/* <ClientSection /> */}
        <SphereMask />
        <PricingSection />
        <CallToActionSection />
        <Particles
          className="absolute inset-0 -z-10"
          quantity={50}
          ease={70}
          size={0.05}
          staticity={40}
          color={'#ffffff'}
        />
      </main>
      {/* <SiteFooter /> */}
    </>
  )
}
