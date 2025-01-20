import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Cache deaktivieren
  staticPageGenerationTimeout: 0,
  generateEtags: false
};

export default nextConfig;
