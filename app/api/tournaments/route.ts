import { NextRequest, NextResponse } from "next/server"
import { getTournaments, createTournament } from "@/lib/database" // Assuming this is the filename where your DB logic lives

export async function GET(request: NextRequest) {
  try {
    // Optional: parse filters from the query string
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || undefined
    const format = searchParams.get("format") || undefined
    const search = searchParams.get("search") || undefined
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined
    const organizer_id = searchParams.get("organizer_id") ? parseInt(searchParams.get("organizer_id")!) : undefined

    const tournaments = await getTournaments({
      status,
      format,
      search,
      limit,
      offset,
      organizer_id,
    })

    return NextResponse.json({ success: true, data: tournaments })
  } catch (err) {
    console.error("❌ Error in GET /api/tournaments:", err)
    return NextResponse.json({ success: false, error: "Failed to fetch tournaments." }, { status: 500 })
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const requiredFields = ["name", "format", "max_players", "entry_fee", "start_date", "registration_deadline"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ success: false, error: `${field} is required` }, { status: 400 })
      }
    }

    const tournament = await createTournament({
      name: body.name,
      description: body.description || "",
      organizer_id: body.organizer_id || 1,
      format: body.format,
      max_players: parseInt(body.max_players),
      entry_fee: parseFloat(body.entry_fee),
      registration_deadline: body.registration_deadline,
      start_date: body.start_date,
      rules: body.rules || "",
      require_screenshots: body.require_screenshots ?? true,
      allow_disputes: body.allow_disputes ?? true,
    })

    return NextResponse.json({
      success: true,
      data: tournament,
      message: "Tournament created successfully",
    }, { status: 201 })
  } catch (error) {
    console.error("POST /api/tournaments error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
