import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getUserById } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)

    // Get fresh user data from database
    const userData = await getUserById(user.userId)
    if (!userData) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        gamertag: userData.gamertag,
        role: userData.role,
        phone: userData.phone,
        profile_image: userData.profile_image,
        created_at: userData.created_at,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
  }
}
