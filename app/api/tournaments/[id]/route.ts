// app/api/tournaments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getTournamentById } from "@/lib/database"

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
