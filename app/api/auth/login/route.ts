import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
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

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase())
    
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-dev-secret',
      { expiresIn: '7d' }
    )

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
