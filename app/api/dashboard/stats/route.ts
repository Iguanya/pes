import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getUserStats, getOrganizerStats, getAdminStats } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)

    let stats
    switch (user.role) {
      case "admin":
      case "manager":
        stats = await getAdminStats()
        break
      case "organizer":
        stats = await getOrganizerStats(user.userId)
        break
      case "player":
      default:
        stats = await getUserStats(user.userId)
        break
    }

    return NextResponse.json({
      success: true,
      data: stats,
      role: user.role,
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch dashboard stats",
      },
      { status: 500 },
    )
  }
}
