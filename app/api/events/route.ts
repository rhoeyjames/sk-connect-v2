import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sk-connect-backend-production.up.railway.app'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const url = new URL(request.url)

    const response = await fetch(`${BACKEND_URL}/api/events${url.search}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Get event data from request
    const eventData = await request.json()

    // For demo purposes, create event without authentication
    // In production, you'd verify the user token here
    
    const newEvent = await Event.create({
      ...eventData,
      isActive: true,
      status: 'published'
    })

    return NextResponse.json({
      message: 'Event created successfully',
      event: {
        ...newEvent.toObject(),
        _id: newEvent._id.toString()
      }
    })

  } catch (error) {
    console.error('Event creation error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
