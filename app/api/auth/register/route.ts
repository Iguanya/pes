import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createUser, getUserByEmail, getUserByGamertag } from "@/lib/database"
import { sendWelcomeEmail, isEmailServiceAvailable } from "@/lib/email"
import { sendWelcomeSMS, isSMSServiceAvailable } from "@/lib/sms"
import { registerSchema } from "@/lib/validation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input data
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
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
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Check if gamertag is already taken
    const existingGamertag = await getUserByGamertag(gamertag)
    if (existingGamertag) {
      return NextResponse.json({ error: "Gamertag is already taken" }, { status: 409 })
    }

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user
    const newUser = await createUser({
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      name: name.trim(),
      phone: phone.trim(),
      gamertag: gamertag.trim(),
      role,
    })

    // Send welcome email (if service is available)
    if (isEmailServiceAvailable()) {
      try {
        await sendWelcomeEmail(email, name)
        console.log("✅ Welcome email sent successfully")
      } catch (error) {
        console.error("⚠️ Failed to send welcome email:", error)
        // Don't fail registration if email fails
      }
    } else {
      console.log("⚠️ Email service not available, skipping welcome email")
    }

    // Send welcome SMS (if service is available)
    if (isSMSServiceAvailable()) {
      try {
        await sendWelcomeSMS(phone, name)
        console.log("✅ Welcome SMS sent successfully")
      } catch (error) {
        console.error("⚠️ Failed to send welcome SMS:", error)
        // Don't fail registration if SMS fails
      }
    } else {
      console.log("⚠️ SMS service not available, skipping welcome SMS")
    }

    // Return success response (without password hash)
    return NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          phone: newUser.phone,
          gamertag: newUser.gamertag,
          role: newUser.role,
          created_at: newUser.created_at,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes("Database connection failed")) {
        return NextResponse.json({ error: "Service temporarily unavailable. Please try again later." }, { status: 503 })
      }
      if (error.message.includes("Duplicate entry")) {
        return NextResponse.json({ error: "User already exists" }, { status: 409 })
      }
    }

    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 })
  }
}
