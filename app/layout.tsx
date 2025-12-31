import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import { viewport } from './viewport'
import './globals.css'
import { Providers } from './providers'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: {
    default: 'Dashboard Artisan - Gestion Professionnelle',
    template: '%s | Dashboard Artisan',
  },
  description: 'Dashboard moderne pour plombiers, serruriers et artisans. Gérez vos clients, interventions, factures, devis et stock en toute simplicité.',
  keywords: ['dashboard', 'artisan', 'plombier', 'serrurier', 'gestion', 'factures', 'devis', 'planning', 'interventions'],
  authors: [{ name: 'Dashboard Artisan' }],
  creator: 'Dashboard Artisan',
  publisher: 'Dashboard Artisan',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // metadataBase temporairement désactivé pour éviter les erreurs
  // metadataBase: process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL) : undefined,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: '/',
    title: 'Dashboard Artisan - Gestion Professionnelle',
    description: 'Dashboard moderne pour plombiers, serruriers et artisans. Gérez vos clients, interventions, factures, devis et stock en toute simplicité.',
    siteName: 'Dashboard Artisan',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard Artisan - Gestion Professionnelle',
    description: 'Dashboard moderne pour plombiers, serruriers et artisans',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ArtisanPro',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#96B9DC" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ArtisanPro" />
        <meta name="color-scheme" content="light dark" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${spaceGrotesk.variable} ${spaceGrotesk.className} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

