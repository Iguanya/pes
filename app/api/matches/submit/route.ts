import { type NextRequest, NextResponse } from "next/server"
import { submitMatchResult, getUserMatches, getRecentMatchSubmissions } from "@/lib/database"
import { requireAuth } from "@/lib/auth"

// Mock OCR function
async function extractScoreFromImage(imageFile: File) {
  // Simulate OCR processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock OCR results
  return {
    player1_score: Math.floor(Math.random() * 5),
    player2_score: Math.floor(Math.random() * 5),
    confidence: 0.95,
    extracted_text: "Final Score: Player1 2 - 1 Player2",
    player_names: ["Player1", "Player2"],
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)
    const formData = await request.formData()

    const matchId = formData.get("match_id") as string
    const tournamentId = formData.get("tournament_id") as string
    const opponent = formData.get("opponent") as string
    const myScore = formData.get("my_score") as string
    const opponentScore = formData.get("opponent_score") as string
    const matchNotes = formData.get("match_notes") as string
    const screenshot = formData.get("screenshot") as File

    // Validate required fields
    if (!matchId || !tournamentId || !opponent || !myScore || !opponentScore) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    let ocrData = null
    let screenshotUrl = null

    // Process screenshot if provided
    if (screenshot && screenshot.size > 0) {
      try {
        ocrData = await extractScoreFromImage(screenshot)
        screenshotUrl = `/uploads/screenshots/${Date.now()}-${screenshot.name}`
        // OCR validation logic (optional)
        const submittedMyScore = Number.parseInt(myScore)
        const submittedOpponentScore = Number.parseInt(opponentScore)
        if (
          Math.abs(ocrData.player1_score - submittedMyScore) > 1 ||
          Math.abs(ocrData.player2_score - submittedOpponentScore) > 1
        ) {
          return NextResponse.json(
            {
              success: false,
              error: "OCR extracted scores do not match submitted scores",
              ocr_data: ocrData,
              submitted_scores: { my_score: submittedMyScore, opponent_score: submittedOpponentScore },
            },
            { status: 400 },
          )
        }
      } catch (error) {
        console.error("OCR processing failed:", error)
        // Continue without OCR if it fails
      }
    }

    // Store match result in the database
    const insertedId = await submitMatchResult({
      match_id: Number.parseInt(matchId),
      submitted_by: user.userId,
      player1_score: Number.parseInt(myScore),
      player2_score: Number.parseInt(opponentScore),
      screenshot_url: screenshotUrl,
      notes: matchNotes,
      ocr_extracted_data: ocrData,
    })

    return NextResponse.json(
      {
        success: true,
        id: insertedId,
        message: "Match result submitted and stored successfully. Your opponent will be notified to confirm.",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error submitting match result:", error)
    return NextResponse.json({ success: false, error: "Failed to submit match result" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)
    const { searchParams } = new URL(request.url)
    if (searchParams.get("recent") === "true") {
      const recent = await getRecentMatchSubmissions(user.userId, 5)
      return NextResponse.json({ success: true, data: recent })
    }
    const matches = await getUserMatches(user.userId)
    return NextResponse.json({ success: true, data: matches })
  } catch (error) {
    console.error("Error fetching user matches:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch matches" }, { status: 500 })
  }
}
