import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getRecentActivity } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const activity = await getRecentActivity(user.userId, user.role, limit)

    return NextResponse.json({
      success: true,
      data: activity,
    })
  } catch (error) {
    console.error("Dashboard activity error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch recent activity",
      },
      { status: 500 },
    )
  }
}
