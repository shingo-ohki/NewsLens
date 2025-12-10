import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Disable webpack custom config (use Turbopack instead)
  turbopack: {},
  // Treat jsdom and its dependencies as external packages in server components
  serverExternalPackages: ['jsdom', 'parse5'],
  experimental: {
    serverComponentsExternalPackages: ['jsdom', 'parse5'],
  },
}

export default nextConfig
