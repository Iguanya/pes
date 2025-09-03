import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getUserByEmail } from "@/lib/database"
import { generateToken } from "@/lib/auth"
import { loginSchema } from "@/lib/validation"
import { ZodError } from "zod"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = loginSchema.parse(body)
    const { email, password } = validatedData

    // Get user from database
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    // Generate JWT token
    const token = generateToken(user)

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          gamertag: user.gamertag,
          role: user.role,
        },
        token,
      },
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    })

    return response

  } catch (error: any) {
    console.error("Login error:", error)

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input data",
          issues: error.errors, // Include validation issues
        },
        { status: 400 }
      )
    }

    // Handle other unanticipated errors with more details
    return NextResponse.json(
      {
        success: false,
        error: "Login failed",
        message: error?.message || "Unknown server error",
        stack: process.env.NODE_ENV !== "production" ? error?.stack : undefined,
      },
      { status: 500 }
    )
  }
}
