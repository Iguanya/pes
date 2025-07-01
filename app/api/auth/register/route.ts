import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createUser, getUserByEmail, getUserByGamertag } from "@/lib/database"
import { generateToken } from "@/lib/auth"
import { registerSchema } from "@/lib/validation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input data
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 },
      )
    }

    const { email, password, name, phone, gamertag, role } = validationResult.data

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User with this email already exists",
        },
        { status: 409 },
      )
    }

    // Check if gamertag is already taken
    const existingGamertag = await getUserByGamertag(gamertag)
    if (existingGamertag) {
      return NextResponse.json(
        {
          success: false,
          error: "Gamertag is already taken",
        },
        { status: 409 },
      )
    }

    // Format phone number
    let formattedPhone = phone.replace(/\s/g, "")
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.substring(1)
    } else if (!formattedPhone.startsWith("254")) {
      formattedPhone = "254" + formattedPhone
    }

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user
    const newUser = await createUser({
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      name: name.trim(),
      phone: formattedPhone,
      gamertag: gamertag.trim(),
      role,
    })

    // Generate JWT token
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      gamertag: newUser.gamertag,
      name: newUser.name,
    })

    // Return success response (without password hash)
    const response = NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            phone: newUser.phone,
            gamertag: newUser.gamertag,
            role: newUser.role,
            created_at: newUser.created_at,
          },
          token,
        },
      },
      { status: 201 },
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
    console.error("Registration error:", error)

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes("Database connection failed")) {
        return NextResponse.json(
          {
            success: false,
            error: "Service temporarily unavailable. Please try again later.",
          },
          { status: 503 },
        )
      }
      if (error.message.includes("Duplicate entry")) {
        return NextResponse.json(
          {
            success: false,
            error: "User already exists",
          },
          { status: 409 },
        )
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Registration failed. Please try again.",
      },
      { status: 500 },
    )
  }
}
