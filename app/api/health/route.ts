import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sk-connect-backend-production.up.railway.app'

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()

    return NextResponse.json({
      ...data,
      proxy: 'Next.js API Route',
      backend: response.ok ? 'connected' : 'disconnected',
      backendUrl: BACKEND_URL,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'ERROR',
        message: 'Backend connection failed',
        proxy: 'Next.js API Route',
        backend: 'disconnected',
        backendUrl: BACKEND_URL,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}
