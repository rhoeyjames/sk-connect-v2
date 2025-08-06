import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://localhost:5000'

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')

    const response = await fetch(`${BACKEND_URL}/api/admin/users`, {
      headers: {
        ...(authorization && { 'Authorization': authorization }),
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Admin users proxy error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
