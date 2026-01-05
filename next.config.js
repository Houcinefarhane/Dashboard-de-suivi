/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  // Optimisations SEO et performance
  compress: true,
  poweredByHeader: false,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push('xlsx')
    }
    return config
  },
  // Configuration pour Vercel (pas besoin de output: 'standalone')
  // Désactiver la validation de la base de données pendant le build
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig

