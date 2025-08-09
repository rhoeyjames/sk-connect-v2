import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    // Forward request to backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ||
                      process.env.BACKEND_URL ||
                      "https://sk-connect-backend-production-543c.up.railway.app"
    
    const response = await fetch(`${backendUrl}/api/auth/verify-reset-token/${token}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Verify reset token API error:", error)
    return NextResponse.json(
      { valid: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
