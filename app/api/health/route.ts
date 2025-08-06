import { NextResponse } from 'next/server'
import { API_CONFIG, getBackendUrl } from '@/lib/config'

export async function GET() {
  try {
    // If we have an external backend, try to connect to it
    if (API_CONFIG.BACKEND_URL !== API_CONFIG.APP_URL) {
      const response = await fetch(getBackendUrl('/api/health'), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()

      return NextResponse.json({
        ...data,
        proxy: 'Next.js API Route',
        backend: response.ok ? 'connected' : 'disconnected',
        environment: API_CONFIG.IS_PRODUCTION ? 'production' : 'development',
        deployment: API_CONFIG.IS_VERCEL ? 'vercel' : 'local'
      })
    }

    // If no external backend, return self-hosted status
    return NextResponse.json({
      status: 'OK',
      message: 'API routes running on Next.js',
      proxy: 'Next.js API Route',
      backend: 'self-hosted',
      environment: API_CONFIG.IS_PRODUCTION ? 'production' : 'development',
      deployment: API_CONFIG.IS_VERCEL ? 'vercel' : 'local',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'ERROR',
        message: 'Backend connection failed',
        proxy: 'Next.js API Route',
        backend: 'disconnected',
        environment: API_CONFIG.IS_PRODUCTION ? 'production' : 'development',
        deployment: API_CONFIG.IS_VERCEL ? 'vercel' : 'local',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    )
  }
}
