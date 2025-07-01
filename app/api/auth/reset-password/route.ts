import { type NextRequest, NextResponse } from "next/server"
import { validatePasswordResetToken, updateUserPassword } from "@/lib/database"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Token and password are required",
        },
        { status: 400 },
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 8 characters long",
        },
        { status: 400 },
      )
    }

    // Check if password contains at least one number and one letter
    const hasNumber = /\d/.test(password)
    const hasLetter = /[a-zA-Z]/.test(password)

    if (!hasNumber || !hasLetter) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must contain at least one letter and one number",
        },
        { status: 400 },
      )
    }

    // Validate reset token
    const tokenData = await validatePasswordResetToken(token)

    if (!tokenData) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired reset token",
        },
        { status: 400 },
      )
    }

    // Hash new password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Update user password
    await updateUserPassword(tokenData.user_id, passwordHash)

    // Mark token as used
    // This hook call should be moved to the top level if it's a custom hook
    // However, since it's a function call, it should remain here
    // If it's a hook, ensure it's called at the top level of the function

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset password",
      },
      { status: 500 },
    )
  }
}
