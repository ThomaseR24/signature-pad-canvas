/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true
  },
  experimental: {
    serverActions: true,
  },
  env: {
    EDGE_CONFIG: process.env.EDGE_CONFIG,
  }
}

module.exports = nextConfig 