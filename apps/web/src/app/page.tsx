import CallToActionSection from '@/components/landing/cta-section'
import HeroSection from '@/components/landing/hero-section'
import PricingSection from '@/components/landing/pricing-section'
import { SiteHeader } from '@/components/landing/site-header'
import Particles from '@/components/magicui/particles'
import { SphereMask } from '@/components/magicui/sphere-mask'

export default async function Home() {
  return (
    <>
      {/* <SiteBanner /> */}
      <SiteHeader />
      <main className="mx-auto flex-1 overflow-hidden">
        <HeroSection />
        {/* <ClientSection /> */}
        <SphereMask />
        <div className="flex flex-col items-center justify-center">
          <h2 className="pb-4 text-2xl font-bold tracking-tight">
            Inscribe in 2 minutes
          </h2>
          <iframe
            width={400}
            height={400}
            src={`https://www.youtube-nocookie.com/embed/lmltXOQm66Q`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={
              'Inscribe | AI-Powered Editor to Supercharge Your Productivity'
            }
            className="aspect-[16/9] w-full p-0 md:w-2/3"
          />
        </div>
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
