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
    default: 'Dashboard - Gestion Professionnelle',
    template: '%s | Dashboard',
  },
  description: 'Solution moderne de gestion pour organiser vos clients, planifier vos rendez-vous, gérer vos finances et suivre votre activité en temps réel.',
  keywords: ['dashboard', 'gestion', 'factures', 'devis', 'planning', 'clients', 'finances', 'stock', 'analytics'],
  authors: [{ name: 'Dashboard' }],
  creator: 'Dashboard',
  publisher: 'Dashboard',
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
    title: 'Dashboard - Gestion Professionnelle',
    description: 'Solution moderne de gestion pour organiser vos clients, planifier vos rendez-vous, gérer vos finances et suivre votre activité en temps réel.',
    siteName: 'Dashboard',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard - Gestion Professionnelle',
    description: 'Solution moderne de gestion pour organiser votre activité',
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
    title: 'Dashboard Pro',
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
        <meta name="apple-mobile-web-app-title" content="Dashboard Pro" />
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

