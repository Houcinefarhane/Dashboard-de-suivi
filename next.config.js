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
  // Essayer de forcer SWC
  experimental: {
    forceSwcTransforms: true,
  },
  // Désactiver la minification SWC
  swcMinify: false,
  // PWA support
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
  },
}

module.exports = nextConfig

