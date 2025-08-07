import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { API_CONFIG } from './config'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    role: string
  }
}

// JWT verification middleware
export async function verifyToken(request: NextRequest): Promise<{ user?: any; error?: string }> {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'No token provided' }
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, API_CONFIG.JWT_SECRET) as any
    
    return { user: decoded }
  } catch (error) {
    return { error: 'Invalid token' }
  }
}

// Admin role verification
export function requireAdmin(user: any): boolean {
  return user && user.role === 'admin'
}

// Error handler
export function handleApiError(error: any, defaultMessage = 'Internal server error') {
  console.error('API Error:', error)
  
  if (error.name === 'ValidationError') {
    return NextResponse.json(
      { error: 'Validation error', details: error.message },
      { status: 400 }
    )
  }
  
  if (error.name === 'CastError') {
    return NextResponse.json(
      { error: 'Invalid ID format' },
      { status: 400 }
    )
  }
  
  return NextResponse.json(
    { error: defaultMessage },
    { status: 500 }
  )
}

// CORS headers for API routes
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': API_CONFIG.IS_PRODUCTION ? API_CONFIG.APP_URL : '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map()

export function rateLimit(identifier: string, limit = 100, windowMs = 60000): boolean {
  const now = Date.now()
  const windowStart = now - windowMs
  
  if (!rateLimitMap.has(identifier)) {
    rateLimitMap.set(identifier, [])
  }
  
  const requests = rateLimitMap.get(identifier)
  
  // Remove old requests outside the window
  const validRequests = requests.filter((time: number) => time > windowStart)
  rateLimitMap.set(identifier, validRequests)
  
  if (validRequests.length >= limit) {
    return false
  }
  
  validRequests.push(now)
  return true
}
