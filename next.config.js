/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basis-Konfiguration
  experimental: {
    serverActions: true
  },

  // Image Domains
  images: {
    domains: ['qmixewgggqzswion.public.blob.vercel-storage.com'],
    unoptimized: true
  },

  // Build-Zeit-Prüfungen deaktivieren
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  }
}

module.exports = nextConfig 