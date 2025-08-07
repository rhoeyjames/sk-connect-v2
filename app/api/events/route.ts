import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sk-connect-backend-production.up.railway.app'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const url = new URL(request.url)

    console.log(`Fetching from: ${BACKEND_URL}/api/events${url.search}`)

    const response = await fetch(`${BACKEND_URL}/api/events${url.search}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
    })

    console.log(`Backend response status: ${response.status}`)

    // Handle non-JSON responses
    let data
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError)
        return NextResponse.json(
          { message: 'Invalid response from backend' },
          { status: 502 }
        )
      }
    } else {
      const text = await response.text()
      console.error('Non-JSON response from backend:', text)
      return NextResponse.json(
        { message: 'Backend returned non-JSON response', details: text },
        { status: 502 }
      )
    }

    if (!response.ok) {
      console.error('Backend error response:', data)
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json(
      { message: 'Failed to connect to backend', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get('authorization')

    console.log(`Creating event at: ${BACKEND_URL}/api/events`)
    console.log('Event data:', JSON.stringify(body, null, 2))

    const response = await fetch(`${BACKEND_URL}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify(body),
    })

    console.log(`Backend response status: ${response.status}`)

    // Handle non-JSON responses
    let data
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError)
        return NextResponse.json(
          { message: 'Invalid response from backend' },
          { status: 502 }
        )
      }
    } else {
      const text = await response.text()
      console.error('Non-JSON response from backend:', text)
      return NextResponse.json(
        { message: 'Backend returned non-JSON response', details: text },
        { status: 502 }
      )
    }

    if (!response.ok) {
      console.error('Backend error response:', data)
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Event creation error:', error)
    return NextResponse.json(
      { message: 'Failed to connect to backend', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
