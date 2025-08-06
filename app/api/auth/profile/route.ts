import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock user data - in production this would come from database
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@skconnect.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    barangay: 'Sample Barangay',
    municipality: 'Sample Municipality',
    province: 'Sample Province'
  },
  {
    id: '2',
    email: 'sk@skconnect.com',
    firstName: 'SK',
    lastName: 'Official',
    role: 'sk_official',
    barangay: 'Sample Barangay',
    municipality: 'Sample Municipality',
    province: 'Sample Province'
  },
  {
    id: '3',
    email: 'youth@skconnect.com',
    firstName: 'Youth',
    lastName: 'Member',
    role: 'youth',
    age: 18,
    barangay: 'Sample Barangay',
    municipality: 'Sample Municipality',
    province: 'Sample Province'
  }
]

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-dev-secret') as any
    
    // Find user
    const user = MOCK_USERS.find(u => u.id === decoded.id)
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user
    })

  } catch (error) {
    console.error('Profile error:', error)
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-dev-secret') as any
    
    const updateData = await request.json()
    
    // In production, update user in database
    // For demo, we'll just return the updated data
    
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        ...updateData
      }
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    )
  }
}
