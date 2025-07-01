import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { getUserById } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
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

    // Get fresh user data from database
    const user = await getUserById(authUser.userId)
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            gamertag: user.gamertag,
            role: user.role,
            profile_image: user.profile_image,
            created_at: user.created_at,
            updated_at: user.updated_at,
          },
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get user information",
      },
      { status: 500 },
    )
  }
}
