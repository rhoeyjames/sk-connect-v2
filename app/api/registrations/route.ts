import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import mongoose from 'mongoose'

// Registration Schema
const registrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'cancelled'], 
    default: 'pending' 
  },
  registrationDate: { type: Date, default: Date.now },
  notes: { type: String },
  additionalInfo: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true })

const Registration = mongoose.models.Registration || mongoose.model('Registration', registrationSchema)

// Verify token
async function verifyToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'No token provided' }
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-dev-secret') as any
    
    return { user: decoded }
  } catch (error) {
    return { error: 'Invalid token' }
  }
}

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
