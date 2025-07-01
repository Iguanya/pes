import { type NextRequest, NextResponse } from "next/server"

// Mock database data
const tournaments = [
  {
    id: 1,
    name: "Weekend Warriors Cup",
    description: "Fast-paced weekend tournament for casual players",
    organizer_id: 1,
    format: "knockout",
    max_players: 16,
    current_players: 12,
    entry_fee: 500,
    prize_pool: 8000,
    status: "registration",
    registration_deadline: "2024-01-14T23:59:00Z",
    start_date: "2024-01-15T10:00:00Z",
    rules: "6 minutes per half, Professional difficulty, No custom teams",
    require_screenshots: true,
    allow_disputes: true,
    created_at: "2024-01-10T10:00:00Z",
  },
  {
    id: 2,
    name: "Champions League",
    description: "Premium tournament for experienced players",
    organizer_id: 2,
    format: "double-elimination",
    max_players: 32,
    current_players: 28,
    entry_fee: 1000,
    prize_pool: 32000,
    status: "registration",
    registration_deadline: "2024-01-19T20:00:00Z",
    start_date: "2024-01-20T14:00:00Z",
    rules: "8 minutes per half, World Class difficulty, Licensed teams only",
    require_screenshots: true,
    allow_disputes: true,
    created_at: "2024-01-08T15:30:00Z",
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const format = searchParams.get("format")
  const search = searchParams.get("search")

  let filteredTournaments = tournaments

  // Filter by status
  if (status && status !== "all") {
    filteredTournaments = filteredTournaments.filter((t) => t.status.toLowerCase().includes(status.toLowerCase()))
  }

  // Filter by format
  if (format && format !== "all") {
    filteredTournaments = filteredTournaments.filter((t) => t.format === format)
  }

  // Filter by search term
  if (search) {
    filteredTournaments = filteredTournaments.filter(
      (t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()),
    )
  }

  return NextResponse.json({
    success: true,
    data: filteredTournaments,
    total: filteredTournaments.length,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["name", "format", "max_players", "entry_fee", "start_date", "registration_deadline"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ success: false, error: `${field} is required` }, { status: 400 })
      }
    }

    // Create new tournament (mock)
    const newTournament = {
      id: tournaments.length + 1,
      ...body,
      current_players: 0,
      prize_pool: 0,
      status: "draft",
      created_at: new Date().toISOString(),
    }

    tournaments.push(newTournament)

    return NextResponse.json(
      {
        success: true,
        data: newTournament,
        message: "Tournament created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 })
  }
}
