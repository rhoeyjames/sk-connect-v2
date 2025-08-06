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

// Verify admin token
async function verifyAdminToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'No token provided' }
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-dev-secret') as any
    
    // Connect to DB to get full user info
    await connectDB()
    const user = await User.findById(decoded.id)
    
    if (!user || user.role !== 'admin') {
      return { error: 'Admin access required' }
    }
    
    return { user: decoded }
  } catch (error) {
    return { error: 'Invalid token' }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const { user, error } = await verifyAdminToken(request)
    if (error) {
      return NextResponse.json({ message: error }, { status: 401 })
    }

    await connectDB()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const role = searchParams.get('role')
    const search = searchParams.get('search')

    // Build query
    let query: any = {}
    
    if (role && role !== 'all') {
      query.role = role
    }
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { barangay: { $regex: search, $options: 'i' } },
        { municipality: { $regex: search, $options: 'i' } },
        { province: { $regex: search, $options: 'i' } }
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get users
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // Get total count
    const total = await User.countDocuments(query)

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Admin users fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin access
    const { user, error } = await verifyAdminToken(request)
    if (error) {
      return NextResponse.json({ message: error }, { status: 401 })
    }

    await connectDB()

    const { userId, updates } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      )
    }

    // Update user (excluding password and sensitive fields)
    const allowedUpdates = ['role', 'isActive', 'firstName', 'lastName', 'barangay', 'municipality', 'province']
    const filteredUpdates: any = {}
    
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key]
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      filteredUpdates,
      { new: true }
    ).select('-password')

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('Admin user update error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
