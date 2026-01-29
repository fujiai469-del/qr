import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use serverExternalPackages to include pdfjs-dist in the server bundle
  serverExternalPackages: ['pdfjs-dist'],
  // Add empty turbopack config to satisfy Vercel build environment
  turbopack: {},
  webpack: (config) => {
    // Ignore canvas dependency which is not needed for text extraction
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
