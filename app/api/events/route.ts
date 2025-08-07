import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sk-connect-backend-production.up.railway.app'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const status = searchParams.get('status') || 'published'

    // Build query
    let query: any = { isActive: true }
    
    if (status && status !== 'all') {
      query.status = status
    }
    
    if (category && category !== 'all') {
      query.category = category
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { barangay: { $regex: search, $options: 'i' } }
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get events
    const events = await Event.find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit)

    // Get total count
    const total = await Event.countDocuments(query)

    return NextResponse.json({
      events: events.map(event => ({
        ...event.toObject(),
        _id: event._id.toString()
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Events fetch error:', error)
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
