import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sk-connect-backend-production.up.railway.app'

export async function GET(request: NextRequest) {
  try {
    // Verify token
    const { user, error } = await verifyToken(request)
    if (error) {
      return NextResponse.json({ message: error }, { status: 401 })
    }

    await connectDB()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    // Build query
    let query: any = {}
    
    if (eventId) {
      query.eventId = eventId
    }
    
    if (userId) {
      query.userId = userId
    }
    
    if (status) {
      query.status = status
    }

    // Get registrations
    const registrations = await Registration.find(query)
      .populate('eventId', 'title date location')
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })

    return NextResponse.json({
      registrations: registrations.map(reg => ({
        ...reg.toObject(),
        _id: reg._id.toString()
      }))
    })

  } catch (error) {
    console.error('Registrations fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify token
    const { user, error } = await verifyToken(request)
    if (error) {
      return NextResponse.json({ message: error }, { status: 401 })
    }

    await connectDB()

    const { eventId, notes, additionalInfo } = await request.json()

    if (!eventId) {
      return NextResponse.json(
        { message: 'Event ID is required' },
        { status: 400 }
      )
    }

    // Check if user already registered for this event
    const existingRegistration = await Registration.findOne({
      eventId,
      userId: user.id
    })

    if (existingRegistration) {
      return NextResponse.json(
        { message: 'You are already registered for this event' },
        { status: 409 }
      )
    }

    // Create new registration
    const newRegistration = await Registration.create({
      eventId,
      userId: user.id,
      notes,
      additionalInfo,
      status: 'pending'
    })

    // Populate the response
    await newRegistration.populate('eventId', 'title date location')
    await newRegistration.populate('userId', 'firstName lastName email')

    return NextResponse.json({
      message: 'Registration successful',
      registration: {
        ...newRegistration.toObject(),
        _id: newRegistration._id.toString()
      }
    })

  } catch (error) {
    console.error('Registration creation error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
