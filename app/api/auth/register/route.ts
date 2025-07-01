import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createUser, getUserByEmail, getUserByGamertag } from "@/lib/database"
import { generateToken } from "@/lib/auth"
import { sendWelcomeEmail } from "@/lib/email"
import { sendWelcomeSMS } from "@/lib/sms"
import { registerSchema } from "@/lib/validation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = registerSchema.parse(body)
    const { email, password, name, phone, gamertag, role } = validatedData

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ success: false, error: "User with this email already exists" }, { status: 400 })
    }

    // Check if gamertag is taken
    const existingGamertag = await getUserByGamertag(gamertag)
    if (existingGamertag) {
      return NextResponse.json({ success: false, error: "Gamertag is already taken" }, { status: 400 })
    }

    // Hash password
    const saltRounds = 12
    const password_hash = await bcrypt.hash(password, saltRounds)

    // Create user
    const newUser = await createUser({
      email,
      password_hash,
      name,
      phone,
      gamertag,
      role: role as "player" | "organizer" | "manager" | "admin",
    })

    // Generate JWT token
    const token = generateToken(newUser)

    // Send welcome email (if configured)
    try {
      await sendWelcomeEmail(email, name)
    } catch (emailError) {
      console.warn("Failed to send welcome email:", emailError)
      // Don't fail registration if email fails
    }

    // Send welcome SMS (if configured)
    try {
      await sendWelcomeSMS(phone, name)
    } catch (smsError) {
      console.warn("Failed to send welcome SMS:", smsError)
      // Don't fail registration if SMS fails
    }

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: "Registration successful",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        gamertag: newUser.gamertag,
        role: newUser.role,
      },
      token,
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Registration error:", error)

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ success: false, error: "Invalid input data" }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: "Registration failed" }, { status: 500 })
  }
}
