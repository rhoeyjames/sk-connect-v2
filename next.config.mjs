/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Ignore during development
  },
  typescript: {
    ignoreBuildErrors: true, // Ignore during development
  },
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  // Remove experimental features that might cause issues
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
}

export default nextConfig
