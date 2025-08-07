import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sk-connect-backend-production.up.railway.app'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    const { id } = params
    
    const response = await fetch(`${BACKEND_URL}/api/events/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const authHeader = request.headers.get('authorization')
    const contentType = request.headers.get('content-type')

    console.log(`Updating event ${id} at: ${BACKEND_URL}/api/events/${id}`)
    console.log('Content-Type:', contentType)

    let body
    let requestBody

    // Handle both JSON and FormData
    if (contentType && contentType.includes('application/json')) {
      body = await request.json()
      requestBody = JSON.stringify(body)
      console.log('JSON data:', JSON.stringify(body, null, 2))
    } else {
      // Handle FormData
      const formData = await request.formData()
      body = Object.fromEntries(formData.entries())

      // Convert FormData to JSON for backend
      const jsonData: any = {}
      for (const [key, value] of formData.entries()) {
        if (key === 'requirements' || key === 'tags') {
          try {
            jsonData[key] = JSON.parse(value as string)
          } catch {
            jsonData[key] = (value as string).split(',').map(s => s.trim()).filter(s => s)
          }
        } else if (key === 'maxParticipants') {
          jsonData[key] = parseInt(value as string) || 50
        } else if (key === 'isRegistrationOpen') {
          jsonData[key] = value === 'true'
        } else {
          jsonData[key] = value
        }
      }

      body = jsonData
      requestBody = JSON.stringify(jsonData)
      console.log('FormData converted to JSON:', JSON.stringify(jsonData, null, 2))
    }

    const response = await fetch(`${BACKEND_URL}/api/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      body: requestBody,
    })

    console.log(`Backend response status: ${response.status}`)

    // Handle non-JSON responses
    let data
    const responseContentType = response.headers.get('content-type')
    if (responseContentType && responseContentType.includes('application/json')) {
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError)
        const text = await response.text()
        console.error('Raw response:', text)
        return NextResponse.json(
          { message: 'Invalid response from backend', details: text },
          { status: 502 }
        )
      }
    } else {
      const text = await response.text()
      console.error('Non-JSON response from backend:', text)
      return NextResponse.json(
        { message: 'Backend returned non-JSON response', details: text },
        { status: 502 }
      )
    }

    if (!response.ok) {
      console.error('Backend error response:', data)
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Event update error:', error)
    return NextResponse.json(
      { message: 'Failed to connect to backend', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    const { id } = params
    
    const response = await fetch(`${BACKEND_URL}/api/events/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
