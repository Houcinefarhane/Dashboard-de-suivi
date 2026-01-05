import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { viewport } from './viewport'
import './globals.css'
import { Providers } from './providers'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
})

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://billiev.com'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Billiev - ERP Complet pour Artisans | Gestion d\'Entreprise Simplifiée',
    template: '%s | Billiev',
  },
  description: 'Billiev : l\'ERP complet qui remplace 5 outils pour gérer votre entreprise artisanale. Clients, Planning, Factures, Stock, Finances dans une seule interface moderne. Essai gratuit 14 jours.',
  keywords: [
    'ERP artisan',
    'logiciel gestion entreprise',
    'gestion clients artisans',
    'planning artisan',
    'facturation artisan',
    'gestion stock artisan',
    'logiciel plombier',
    'logiciel serrurier',
    'logiciel électricien',
    'gestion finances artisan',
    'ERP français',
    'logiciel facturation',
    'gestion planning',
    'dashboard entreprise',
    'logiciel artisanat',
  ],
  authors: [{ name: 'Billiev', url: baseUrl }],
  creator: 'Billiev',
  publisher: 'Billiev',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: baseUrl,
    siteName: 'Billiev',
    title: 'Billiev - ERP Complet pour Artisans | Gestion d\'Entreprise Simplifiée',
    description: 'L\'ERP complet qui remplace 5 outils pour gérer votre entreprise artisanale. Clients, Planning, Factures, Stock, Finances. Essai gratuit 14 jours.',
    images: [
      {
        url: `${baseUrl}/Attached_image.png`,
        width: 1200,
        height: 630,
        alt: 'Aperçu du tableau de bord Billiev - ERP complet pour artisans',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Billiev - ERP Complet pour Artisans',
    description: 'L\'ERP complet qui remplace 5 outils pour gérer votre entreprise artisanale. Essai gratuit 14 jours.',
    images: [`${baseUrl}/Attached_image.png`],
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
    title: 'Billiev',
  },
  icons: {
    icon: [
      { url: '/favicon.ico?v=5', sizes: '32x32', type: 'image/x-icon' },
      { url: '/icon.svg?v=5', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png?v=5',
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
        <meta name="apple-mobile-web-app-title" content="Billiev" />
        <meta name="color-scheme" content="light dark" />
        <link rel="icon" href="/favicon.ico?v=5" sizes="any" />
        <link rel="icon" href="/icon.svg?v=5" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=5" />
      </head>
      <body className={`${spaceGrotesk.variable} ${spaceGrotesk.className} font-sans`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}

