import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sk-connect-backend-production.up.railway.app'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing backend connectivity to:', BACKEND_URL)
    
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Backend test response status:', response.status)
    console.log('Backend test response headers:', Object.fromEntries(response.headers.entries()))

    if (response.ok) {
      const data = await response.json()
      console.log('Backend test response data:', data)
      return NextResponse.json({
        success: true,
        backendUrl: BACKEND_URL,
        backendResponse: data,
        status: response.status
      })
    } else {
      const text = await response.text()
      console.log('Backend test error response:', text)
      return NextResponse.json({
        success: false,
        backendUrl: BACKEND_URL,
        error: text,
        status: response.status
      }, { status: response.status })
    }
  } catch (error) {
    console.error('Backend test error:', error)
    return NextResponse.json({
      success: false,
      backendUrl: BACKEND_URL,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
