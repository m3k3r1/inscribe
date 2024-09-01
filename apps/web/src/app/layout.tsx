import './globals.css'
import './prosemirror.css'

import type { Metadata } from 'next'

import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Inscribe | AI-Powered Editor to Supercharge Your Productivity',
}

export default async function RootLayout({
  children,
  sheet,
}: Readonly<{
  children: React.ReactNode
  sheet: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <meta
          name="description"
          content="Inscribe is an AI-powered copilot designed to enhance productivity and streamline content creation. Turn insights into action and master AI with ease."
        />
        <meta
          property="og:title"
          content="Inscribe | AI-Powered Editor to Supercharge Your Productivity"
        />
        <meta
          property="og:description"
          content="Inscribe is an AI-powered copilot designed to enhance productivity and streamline content creation. Turn insights into action and master AI with ease."
        />
        <meta
          property="og:image"
          content="https://www.tryinscribe.app/_next/image?url=%2Fthumbnail.png"
        />
        <meta
          name="twitter:card"
          content="Inscribe | AI-Powered Editor to Supercharge Your Productivity"
        />
        <meta
          name="twitter:title"
          content="Inscribe | AI-Powered Editor to Supercharge Your Productivity"
        />
        <meta
          name="twitter:description"
          content="Inscribe is an AI-powered copilot designed to enhance productivity and streamline content creation. Turn insights into action and master AI with ease."
        />
        <meta
          name="twitter:image"
          content="https://www.tryinscribe.app/_next/image?url=%2Fthumbnail.png"
        />
        <Providers>
          {children}
          {sheet}
        </Providers>
      </body>
    </html>
  )
}
