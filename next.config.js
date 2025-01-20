/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basis-Konfiguration
  experimental: {
    serverActions: true
  },

  // Cache deaktivieren
  staticPageGenerationTimeout: 0,
  generateEtags: false,

  // Image Domains
  images: {
    domains: ['qmixewgggqzswion.public.blob.vercel-storage.com'],
    unoptimized: true,
    minimumCacheTTL: 0  // Cache für Bilder deaktivieren
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