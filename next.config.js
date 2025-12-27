/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push('xlsx')
    }
    return config
  },
  // Désactiver l'export statique pour les pages dynamiques
  output: 'standalone',
}

module.exports = nextConfig

