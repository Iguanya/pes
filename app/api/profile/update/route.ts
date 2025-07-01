import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { updateUserProfile, getUserByGamertag } from "@/lib/database"

export async function PUT(request: NextRequest) {
  try {
    const user = requireAuth(request)
    const { name, phone, gamertag, profile_image } = await request.json()

    // Validate input
    if (name && (name.length < 2 || name.length > 50)) {
      return NextResponse.json(
        {
          success: false,
          error: "Name must be between 2 and 50 characters",
        },
        { status: 400 },
      )
    }

    if (phone && !/^\+?[\d\s\-$$$$]{10,15}$/.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid phone number format",
        },
        { status: 400 },
      )
    }

    if (gamertag) {
      if (gamertag.length < 3 || gamertag.length > 20) {
        return NextResponse.json(
          {
            success: false,
            error: "Gamertag must be between 3 and 20 characters",
          },
          { status: 400 },
        )
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(gamertag)) {
        return NextResponse.json(
          {
            success: false,
            error: "Gamertag can only contain letters, numbers, underscores, and hyphens",
          },
          { status: 400 },
        )
      }

      // Check if gamertag is already taken by another user
      const existingUser = await getUserByGamertag(gamertag)
      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json(
          {
            success: false,
            error: "Gamertag is already taken",
          },
          { status: 400 },
        )
      }
    }

    // Update profile
    const updatedUser = await updateUserProfile(user.id, {
      name,
      phone,
      gamertag,
      profile_image,
    })

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Update profile error:", error)

    if (error instanceof Error && error.message.includes("Authentication required")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    if (error instanceof Error && error.message.includes("No fields to update")) {
      return NextResponse.json({ success: false, error: "No changes provided" }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 })
  }
}
