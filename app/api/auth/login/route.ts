import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { getUserByEmail } from "@/lib/database"
import { loginSchema } from "@/lib/validation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 },
      )
    }

    const { email, password } = validationResult.data

    // Get user from database
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Check if user account is active
    if (!user.is_active) {
      return NextResponse.json({ error: "Account is deactivated" }, { status: 403 })
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      console.error("JWT_SECRET is not configured")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: "7d" },
    )

    // Return success response
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          gamertag: user.gamertag,
          role: user.role,
          profile_image: user.profile_image,
          created_at: user.created_at,
        },
      },
      { status: 200 },
    )

    // Set HTTP-only cookie with JWT token
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)

    // Handle specific database errors
    if (error instanceof Error) {
      if (
        error.message.includes("Database connection failed") ||
        error.message.includes("server may be unreachable") ||
        error.message.includes("ECONNREFUSED")
      ) {
        return NextResponse.json(
          { error: "Service temporarily unavailable. Please check your database connection." },
          { status: 503 },
        )
      }
    }

    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 })
  }
}
