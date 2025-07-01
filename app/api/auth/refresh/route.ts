import { type NextRequest, NextResponse } from "next/server"
import { requireAuth, refreshToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)

    // Generate new token with fresh user data
    const newToken = await refreshToken(user.userId)
    if (!newToken) {
      return NextResponse.json({ success: false, error: "Failed to refresh token" }, { status: 401 })
    }

    // Set new HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: "Token refreshed successfully",
      token: newToken,
    })

    response.cookies.set("auth-token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json({ success: false, error: "Token refresh failed" }, { status: 401 })
  }
}
