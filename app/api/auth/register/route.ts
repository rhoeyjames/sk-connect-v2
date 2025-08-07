import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sk-connect-backend-production.up.railway.app'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const userData = await request.json()

    // Validate required fields
    const { firstName, lastName, email, password, age, barangay, municipality, province } = userData

    if (!firstName || !lastName || !email || !password || !barangay || !municipality || !province) {
      return NextResponse.json(
        { message: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create new user
    const newUser = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'youth', // Default role
      age: parseInt(age) || undefined,
      barangay,
      municipality,
      province,
      phoneNumber: userData.phoneNumber || undefined,
      dateOfBirth: userData.dateOfBirth || undefined,
      interests: userData.interests || [],
      isActive: true
    })

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role
      },
      process.env.JWT_SECRET || 'fallback-dev-secret',
      { expiresIn: '7d' }
    )

    // Return user data (excluding password)
    const userObject = newUser.toObject()
    const { password: _, ...userWithoutPassword } = userObject

    return NextResponse.json({
      message: 'Registration successful',
      token,
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
