/** @type {import('next').NextConfig} */
const nextConfig = {
  // Alle experimentellen Features deaktivieren/permissiv machen
  experimental: {
    // Server Actions erlauben
    serverActions: true,
    // Typ-Prüfungen komplett deaktivieren
    typedRoutes: false,
    // Middleware Checks deaktivieren
    skipMiddlewareUrlNormalize: true,
    // Externe Pakete erlauben
    serverComponentsExternalPackages: ['*'],
    // Weitere experimentelle Checks deaktivieren
    optimizeCss: false,
    scrollRestoration: false,
    legacyBrowsers: false,
  },

  // Basis-Konfiguration maximal permissiv
  reactStrictMode: false,
  swcMinify: false,
  poweredByHeader: false,
  output: 'standalone',

  // Alle Build-Zeit-Prüfungen deaktivieren
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: 'tsconfig.json'
  },
  eslint: {
    ignoreDuringBuilds: true,
    ignoreDuringDev: true,
  },

  // Image Optimierung deaktivieren
  images: {
    unoptimized: true,
    domains: ['*'],
    remotePatterns: [
      {
        protocol: '*',
        hostname: '*',
        port: '*',
        pathname: '**',
      },
    ],
  },

  // Webpack maximal permissiv
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
    };
    // Warnung für große Bundles deaktivieren
    config.performance = {
      hints: false,
    };
    // Source Maps deaktivieren
    config.devtool = false;
    return config;
  },

  // Build-Cache deaktivieren
  onDemandEntries: {
    maxInactiveAge: 0,
  },

  // Weitere Optimierungen deaktivieren
  compress: false,
  generateEtags: false,
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'md', 'mdx'],
}

module.exports = nextConfig 