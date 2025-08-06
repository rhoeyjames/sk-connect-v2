/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false, // Enable for production
  },
  typescript: {
    ignoreBuildErrors: false, // Enable for production
  },
  images: {
    domains: ['localhost', 'your-backend-domain.com'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizeCss: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
}

export default nextConfig
