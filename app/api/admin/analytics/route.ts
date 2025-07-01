import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const admin = requireRole(request, ["admin"])

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "6months"
    const metric = searchParams.get("metric") || "all"

    // Mock analytics data - replace with actual database queries
    const analyticsData = {
      userGrowth: [
        { month: "Jul", users: 1200, active: 800 },
        { month: "Aug", users: 1450, active: 950 },
        { month: "Sep", users: 1800, active: 1200 },
        { month: "Oct", users: 2200, active: 1500 },
        { month: "Nov", users: 2800, active: 1900 },
        { month: "Dec", users: 3400, active: 2300 },
      ],
      tournamentStats: [
        { month: "Jul", tournaments: 25, participants: 450 },
        { month: "Aug", tournaments: 32, participants: 580 },
        { month: "Sep", tournaments: 28, participants: 520 },
        { month: "Oct", tournaments: 35, participants: 650 },
        { month: "Nov", tournaments: 42, participants: 780 },
        { month: "Dec", tournaments: 38, participants: 720 },
      ],
      revenueData: [
        { month: "Jul", revenue: 125000, fees: 12500 },
        { month: "Aug", revenue: 158000, fees: 15800 },
        { month: "Sep", revenue: 142000, fees: 14200 },
        { month: "Oct", revenue: 185000, fees: 18500 },
        { month: "Nov", revenue: 220000, fees: 22000 },
        { month: "Dec", revenue: 195000, fees: 19500 },
      ],
      topPerformers: [
        { name: "John Kamau", earnings: 45000, tournaments: 28, winRate: 78 },
        { name: "Mary Wanjiku", earnings: 38000, tournaments: 22, winRate: 72 },
        { name: "David Ochieng", earnings: 32000, tournaments: 35, winRate: 65 },
        { name: "Sarah Muthoni", earnings: 28000, tournaments: 18, winRate: 81 },
      ],
      systemMetrics: {
        totalUsers: 5247,
        activeUsers: 1834,
        totalTournaments: 342,
        activeTournaments: 28,
        totalRevenue: 2847500,
        monthlyRevenue: 485600,
        averageSessionDuration: 24.5,
        bounceRate: 12.3,
      },
    }

    return NextResponse.json({
      success: true,
      data: analyticsData,
      timeRange,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Admin analytics API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch analytics data" }, { status: 500 })
  }
}
