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
    await connectDB()

    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await User.findOne({
      email: email.toLowerCase(),
      isActive: true
    }).select('+password')

    if (!user) {
      // Create demo users if none exist
      await createDemoUsers()

      // Try to find user again
      const retryUser = await User.findOne({
        email: email.toLowerCase(),
        isActive: true
      }).select('+password')

      if (!retryUser) {
        return NextResponse.json(
          { message: 'Invalid email or password' },
          { status: 401 }
        )
      }

      // Use the found user
      const isPasswordValid = await bcrypt.compare(password, retryUser.password)

      if (!isPasswordValid) {
        return NextResponse.json(
          { message: 'Invalid email or password' },
          { status: 401 }
        )
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: retryUser._id,
          email: retryUser.email,
          role: retryUser.role
        },
        process.env.JWT_SECRET || 'fallback-dev-secret',
        { expiresIn: '7d' }
      )

      // Return user data (excluding password)
      const userObject = retryUser.toObject()
      const { password: _, ...userWithoutPassword } = userObject

      return NextResponse.json({
        message: 'Login successful',
        token,
        user: userWithoutPassword
      })
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
        id: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'fallback-dev-secret',
      { expiresIn: '7d' }
    )

    // Return user data (excluding password)
    const userObject = user.toObject()
    const { password: _, ...userWithoutPassword } = userObject

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

// Helper function to create demo users
async function createDemoUsers() {
  try {
    const hashedPassword = await bcrypt.hash('password', 10)

    const demoUsers = [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@skconnect.com',
        password: hashedPassword,
        role: 'admin',
        barangay: 'Sample Barangay',
        municipality: 'Sample Municipality',
        province: 'Sample Province'
      },
      {
        firstName: 'SK',
        lastName: 'Official',
        email: 'sk@skconnect.com',
        password: hashedPassword,
        role: 'sk_official',
        barangay: 'Sample Barangay',
        municipality: 'Sample Municipality',
        province: 'Sample Province'
      },
      {
        firstName: 'Youth',
        lastName: 'Member',
        email: 'youth@skconnect.com',
        password: hashedPassword,
        role: 'youth',
        age: 18,
        barangay: 'Sample Barangay',
        municipality: 'Sample Municipality',
        province: 'Sample Province'
      }
    ]

    // Only create users that don't already exist
    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email })
      if (!existingUser) {
        await User.create(userData)
        console.log(`Created demo user: ${userData.email}`)
      }
    }
  } catch (error) {
    console.error('Error creating demo users:', error)
  }
}
