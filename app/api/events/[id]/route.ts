import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://localhost:5000'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/events/${params.id}`)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Event detail proxy error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch event details' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authorization = request.headers.get('authorization')
    const formData = await request.formData()

    const response = await fetch(`${BACKEND_URL}/api/events/${params.id}`, {
      method: 'PUT',
      headers: {
        ...(authorization && { 'Authorization': authorization }),
        // Don't set Content-Type for FormData, let the browser set it with boundary
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Event update proxy error:', error)
    return NextResponse.json(
      { message: 'Failed to update event' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authorization = request.headers.get('authorization')
    
    const response = await fetch(`${BACKEND_URL}/api/events/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization && { 'Authorization': authorization }),
      },
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Event delete proxy error:', error)
    return NextResponse.json(
      { message: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
