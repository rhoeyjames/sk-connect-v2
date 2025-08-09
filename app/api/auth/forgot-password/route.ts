import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Forward request to backend - use the correct Railway URL
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ||
                      process.env.BACKEND_URL ||
                      "https://sk-connect-backend-production-543c.up.railway.app"

    const response = await fetch(`${backendUrl}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      // Try to get error message, but handle cases where response isn't JSON
      let errorMessage = "Failed to send reset email"
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage
      }

      return NextResponse.json(
        { message: errorMessage },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })

  } catch (error) {
    console.error("Forgot password API error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
