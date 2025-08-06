import { NextRequest, NextResponse } from 'next/server'
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

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Get all users for debugging (exclude passwords)
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(100) // Limit to prevent overwhelming

    // Get basic stats
    const stats = {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      byRole: {
        admin: users.filter(u => u.role === 'admin').length,
        sk_official: users.filter(u => u.role === 'sk_official').length,
        youth: users.filter(u => u.role === 'youth').length
      }
    }

    return NextResponse.json({
      message: 'Users fetched successfully',
      users: users.map(user => ({
        ...user.toObject(),
        id: user._id.toString()
      })),
      stats,
      database: {
        connected: mongoose.connection.readyState === 1,
        name: mongoose.connection.name
      }
    })

  } catch (error) {
    console.error('Debug users fetch error:', error)
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
        users: [],
        stats: { total: 0, active: 0, byRole: { admin: 0, sk_official: 0, youth: 0 } }
      },
      { status: 500 }
    )
  }
}
