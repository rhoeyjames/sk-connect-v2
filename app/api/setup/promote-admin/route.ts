import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://localhost:5000'

export async function POST(request: NextRequest) {
  try {
    const { email, secretKey } = await request.json()
    
    // Simple security check for setup
    if (secretKey !== 'admin-setup-secret-key') {
      return NextResponse.json(
        { message: 'Invalid secret key' },
        { status: 403 }
      )
    }

    // Call backend to promote user to admin
    const response = await fetch(`${BACKEND_URL}/api/setup/promote-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Promote admin error:', error)
    return NextResponse.json(
      { message: 'Failed to promote user to admin' },
      { status: 500 }
    )
  }
}
