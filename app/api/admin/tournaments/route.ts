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
        id: 1,
        name: "Weekend Warriors Cup",
        description: "A fun tournament for casual players",
        organizer: "ProGamer",
        organizer_id: 1,
        format: "Single Elimination",
        status: "ongoing",
        participants: 14,
        max_participants: 16,
        entry_fee: 500,
        prize_pool: 8000,
        start_date: "2024-01-20T10:00:00Z",
        created_at: "2024-01-15T08:00:00Z",
        rules: "Standard PES rules apply. No cheating allowed.",
        require_screenshots: true,
        allow_disputes: true,
      },
      {
        id: 2,
        name: "Champions League",
        description: "Elite tournament for top players",
        organizer: "EliteGaming",
        organizer_id: 2,
        format: "Double Elimination",
        status: "registration",
        participants: 28,
        max_participants: 32,
        entry_fee: 1000,
        prize_pool: 32000,
        start_date: "2024-01-25T14:00:00Z",
        registration_deadline: "2024-01-24T23:59:59Z",
        created_at: "2024-01-18T12:00:00Z",
        rules: "Professional rules. Screenshots required for all matches.",
        require_screenshots: true,
        allow_disputes: true,
      },
      {
        id: 3,
        name: "Monthly Masters",
        description: "Championship tournament for professional players",
        organizer: "TournamentPro",
        organizer_id: 3,
        format: "Swiss System",
        status: "completed",
        participants: 64,
        max_participants: 64,
        entry_fee: 2000,
        prize_pool: 128000,
        start_date: "2024-01-10T12:00:00Z",
        end_date: "2024-01-15T18:00:00Z",
        created_at: "2024-01-05T10:00:00Z",
        rules: "Professional tournament rules. Strict enforcement.",
        require_screenshots: true,
        allow_disputes: false,
      },
    ] as any[]

    const filtered = data.filter((t) => {
      const matchesSearch =
        !search ||
        t.name.toLowerCase().includes(search) ||
        t.organizer.toLowerCase().includes(search) ||
        (t.description?.toLowerCase() || "").includes(search)
      const matchesStatus = !status || t.status === status
      return matchesSearch && matchesStatus
    })

    return NextResponse.json({ success: true, data: filtered })
  } catch (error) {
    console.error("Admin tournaments GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to load tournaments" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    requireRole(request, ["admin", "manager"]) // authorize
    const body = await request.json()
    const { tournamentId, action } = body

    console.log(`Admin tournaments action: ${action} -> ${tournamentId}`)

    // Normally update DB here
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin tournaments PUT error:", error)
    return NextResponse.json({ success: false, error: "Failed to update tournament" }, { status: 500 })
  }
}


