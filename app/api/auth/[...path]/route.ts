import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://localhost:5000'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'DELETE')
}

async function proxyRequest(
  request: NextRequest,
  path: string[],
  method: string
) {
  try {
    const endpoint = path.join('/')
    const url = `${BACKEND_URL}/api/auth/${endpoint}`
    
    // Get headers and body
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      if (key !== 'host' && key !== 'connection') {
        headers[key] = value
      }
    })

    let body: string | undefined
    if (method !== 'GET' && method !== 'DELETE') {
      body = await request.text()
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
    })

    const data = await response.text()
    
    // Try to parse as JSON, fallback to text
    let parsedData
    try {
      parsedData = JSON.parse(data)
    } catch {
      parsedData = data
    }

    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { message: 'Proxy server error' },
      { status: 500 }
    )
  }
}
