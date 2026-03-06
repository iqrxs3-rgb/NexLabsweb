/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
      domains: ['image.pollinations.ai'],
    },
    experimental: {
      taint: true,
    },
    webpack: (config, { isServer }) => {
      if (isServer) {
        config.externals.push({
          'ssh2': 'commonjs ssh2',
          'dockerode': 'commonjs dockerode',
        })
      }
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
      return config
    },
  }
  
  module.exports = nextConfig
