import { type NextRequest, NextResponse } from "next/server"

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
    const formData = await request.formData()

    const tournamentId = formData.get("tournament_id") as string
    const opponent = formData.get("opponent") as string
    const myScore = formData.get("my_score") as string
    const opponentScore = formData.get("opponent_score") as string
    const matchNotes = formData.get("match_notes") as string
    const screenshot = formData.get("screenshot") as File

    // Validate required fields
    if (!tournamentId || !opponent || !myScore || !opponentScore) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    let ocrData = null
    let screenshotUrl = null

    // Process screenshot if provided
    if (screenshot && screenshot.size > 0) {
      try {
        // In a real app, you would:
        // 1. Upload the image to cloud storage (AWS S3, Cloudinary, etc.)
        // 2. Process with OCR service (Google Vision, Tesseract, etc.)
        // 3. Store the extracted data

        ocrData = await extractScoreFromImage(screenshot)
        screenshotUrl = `/uploads/screenshots/${Date.now()}-${screenshot.name}`

        // Verify OCR results match submitted scores
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

    // Create match result submission (mock)
    const matchResult = {
      id: Math.floor(Math.random() * 1000),
      tournament_id: Number.parseInt(tournamentId),
      opponent: opponent,
      my_score: Number.parseInt(myScore),
      opponent_score: Number.parseInt(opponentScore),
      match_notes: matchNotes,
      screenshot_url: screenshotUrl,
      ocr_data: ocrData,
      status: "pending_confirmation",
      submitted_at: new Date().toISOString(),
    }

    // In a real app, you would:
    // 1. Save to database
    // 2. Send notification to opponent
    // 3. Update tournament standings if confirmed

    return NextResponse.json(
      {
        success: true,
        data: matchResult,
        message: "Match result submitted successfully. Your opponent will be notified to confirm.",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error submitting match result:", error)
    return NextResponse.json({ success: false, error: "Failed to submit match result" }, { status: 500 })
  }
}
