// app/api/tournaments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getTournamentById } from "@/lib/database"
import pool from "@/lib/database"

// Helper to get user from session (for demo, expects userId in header)
async function getUserIdFromRequest(request: NextRequest): Promise<number | null> {
  // In production, use proper session/auth middleware
  const cookie = request.headers.get("cookie") || ""
  // Example: parse userId from a session cookie or JWT
  // For now, try to get from a custom header for demo
  const userIdHeader = request.headers.get("x-user-id")
  if (userIdHeader) return parseInt(userIdHeader)
  // Fallback: not authenticated
  return null
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ success: false, error: "Tournament ID is required" }, { status: 400 })
    }

    const tournament = await getTournamentById(id)

    if (!tournament) {
      return NextResponse.json({ success: false, error: "Tournament not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: tournament })
  } catch (err) {
    console.error("❌ GET /api/tournaments/[id] error:", err)
    return NextResponse.json({ success: false, error: "Failed to fetch tournament" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tournamentId = params.id
    if (!tournamentId) {
      return NextResponse.json({ success: false, error: "Tournament ID is required" }, { status: 400 })
    }

    // Get user (player) ID
    // In production, use session/auth middleware
    const userRes = await fetch("http://localhost:3000/api/auth/me", {
      headers: { cookie: request.headers.get("cookie") || "" },
      cache: "no-store"
    })
    if (!userRes.ok) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }
    const userData = await userRes.json()
    const userId = userData.user?.id
    if (!userId) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 401 })
    }
    
    // Insert registration
    const connection = await pool.getConnection()
    try {
    // Check if already registered
    const [existing] = await connection.execute(
    "SELECT id FROM tournament_registrations WHERE user_id = ? AND tournament_id = ? AND payment_status = 'completed'",
    [userId, tournamentId]
    )
    if ((existing as any[]).length > 0) {
    return NextResponse.json({ success: false, error: "Already registered" }, { status: 400 })
    }
    // Insert registration
    await connection.execute(
    `INSERT INTO tournament_registrations (user_id, tournament_id, payment_status, registration_date) VALUES (?, ?, 'completed', NOW())`,
    [userId, tournamentId]
    )
    } finally {
    connection.release()
    }
    return NextResponse.json({ success: true, message: "Registration successful" })
  } catch (err) {
    console.error("❌ POST /api/tournaments/[id] error:", err)
    return NextResponse.json({ success: false, error: "Failed to register for tournament" }, { status: 500 })
  }
}
