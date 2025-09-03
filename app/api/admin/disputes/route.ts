import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    requireRole(request, ["admin", "manager"]) // authorize

    const { searchParams } = new URL(request.url)
    const search = (searchParams.get("search") || "").toLowerCase()
    const status = searchParams.get("status") || ""

    const data = [
      {
        id: 101,
        tournament_id: 1,
        tournament_name: "Weekend Warriors Cup",
        match_id: 501,
        raised_by_id: 3,
        raised_by_name: "David Ochieng",
        opponent_id: 4,
        opponent_name: "Sarah Kimani",
        reason: "Score reporting discrepancy",
        evidence_urls: ["/screenshots/match501-1.png"],
        status: "open",
        created_at: "2024-01-21T10:00:00Z",
        updated_at: "2024-01-21T10:00:00Z",
      },
      {
        id: 102,
        tournament_id: 2,
        tournament_name: "Champions League",
        match_id: 642,
        raised_by_id: 6,
        raised_by_name: "Mary Wanjiku",
        opponent_id: 7,
        opponent_name: "ProGamer",
        reason: "Suspected cheating",
        evidence_urls: [],
        status: "in_review",
        created_at: "2024-01-20T16:00:00Z",
        updated_at: "2024-01-21T09:00:00Z",
      },
    ] as any[]

    const filtered = data.filter((d) => {
      const matchesSearch =
        !search ||
        d.tournament_name.toLowerCase().includes(search) ||
        d.raised_by_name.toLowerCase().includes(search) ||
        d.opponent_name.toLowerCase().includes(search) ||
        d.reason.toLowerCase().includes(search)
      const matchesStatus = !status || d.status === status
      return matchesSearch && matchesStatus
    })

    return NextResponse.json({ success: true, data: filtered })
  } catch (error) {
    console.error("Admin disputes GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to load disputes" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    requireRole(request, ["admin", "manager"]) // authorize
    const body = await request.json()
    const { disputeId, action, resolution } = body
    console.log(`Admin disputes action: ${action} -> ${disputeId}`, resolution)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin disputes PUT error:", error)
    return NextResponse.json({ success: false, error: "Failed to update dispute" }, { status: 500 })
  }
}


