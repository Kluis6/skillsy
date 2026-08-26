import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        // Google account profile photos (Firebase Auth).
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        // Placeholder images used by seed/demo data.
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  ...(process.env.VERCEL ? {} : { output: 'standalone' as const }),
  transpilePackages: ['motion'],
  turbopack: {},
  webpack: (config, { dev }) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
