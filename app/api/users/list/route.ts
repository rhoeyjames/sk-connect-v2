import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import mongoose from 'mongoose'

// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'sk_official', 'youth'], default: 'youth' },
  age: { type: Number },
  barangay: { type: String, required: true },
  municipality: { type: String, required: true },
  province: { type: String, required: true },
  phoneNumber: { type: String },
  dateOfBirth: { type: Date },
  interests: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', userSchema)

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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const role = searchParams.get('role')

    // Build query - only show active users
    let query: any = { isActive: true }
    
    if (role && role !== 'all') {
      query.role = role
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get users (exclude sensitive information)
    const users = await User.find(query)
      .select('firstName lastName email role barangay municipality province age createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // Get total count
    const total = await User.countDocuments(query)

    return NextResponse.json({
      users: users.map(user => ({
        ...user.toObject(),
        id: user._id.toString()
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Users list fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
