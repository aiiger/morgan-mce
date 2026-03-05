/** @type {import('next').NextConfig} */
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  reactStrictMode: true,

  // Ensure Turbopack resolves from this repo (avoids wrong root inference)
  turbopack: {
    root: projectRoot,
  },

  // Standalone output for minimal Docker / Vercel footprint
  output: 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fgkqmleltfyuyigmtpqy.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
      },
    ],
    // Minimise image optimisation memory footprint
    minimumCacheTTL: 86400,
  },

  compiler: {
    // Strip console.log in production to keep client bundles clean
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Headers — long-cache immutable assets, security headers
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

  experimental: {
    // Turbopack is the default dev bundler in Next 16
  },
};

export default nextConfig;
