import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser, refreshToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Get current authenticated user
    const authUser = getAuthUser(request)
    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      )
    }

    // Generate new token with fresh user data
    const newToken = await refreshToken(authUser.userId)
    if (!newToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to refresh token",
        },
        { status: 400 },
      )
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "Token refreshed successfully",
        data: {
          token: newToken,
        },
      },
      { status: 200 },
    )

    // Update HTTP-only cookie with new token
    response.cookies.set("auth-token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Token refresh failed",
      },
      { status: 500 },
    )
  }
}
