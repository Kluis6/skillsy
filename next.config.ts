import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

// Every origin the app talks to: Firebase Auth/Firestore, Google sign-in,
// ViaCEP and Nominatim (address lookup) and jsDelivr, where
// browser-image-compression loads its web worker from.
const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js inlines its bootstrap scripts; nonces would force every page to
  // render dynamically and lose ISR, so inline scripts stay allowed.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://apis.google.com https://cdn.jsdelivr.net`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.firebaseapp.com https://apis.google.com https://viacep.com.br https://nominatim.openstreetmap.org https://cdn.jsdelivr.net",
  "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  // Report-only while the policy is validated in production: violations show
  // up in the browser console without breaking anything. Switch the key to
  // 'Content-Security-Policy' once the console stays clean.
  { key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicy },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
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
