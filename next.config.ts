import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Disable webpack custom config (use Turbopack instead)
  turbopack: {},
}

export default nextConfig
