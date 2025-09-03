import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    requireRole(request, ["admin", "manager"]) // authorize

    const { searchParams } = new URL(request.url)
    const search = (searchParams.get("search") || "").toLowerCase()
    const status = searchParams.get("status") || ""
    const type = searchParams.get("type") || ""

    const data = [
      {
        id: 1,
        user_id: 1,
        user_name: "John Kamau",
        user_email: "john.kamau@email.com",
        tournament_id: 1,
        tournament_name: "Weekend Warriors Cup",
        type: "entry_fee",
        amount: 500,
        currency: "KES",
        status: "completed",
        payment_method: "mpesa",
        mpesa_transaction_id: "OGE123456789",
        mpesa_receipt_number: "OGE123456789",
        phone_number: "+254712345678",
        reference: "TXN001",
        description: "Tournament entry fee",
        processed_at: "2024-01-20T10:30:00Z",
        created_at: "2024-01-20T10:25:00Z",
        updated_at: "2024-01-20T10:30:00Z",
      },
      {
        id: 2,
        user_id: 2,
        user_name: "Mary Wanjiku",
        user_email: "mary.wanjiku@email.com",
        tournament_id: 2,
        tournament_name: "Champions League",
        type: "entry_fee",
        amount: 1000,
        currency: "KES",
        status: "pending",
        payment_method: "mpesa",
        phone_number: "+254723456789",
        reference: "TXN002",
        description: "Tournament entry fee",
        created_at: "2024-01-20T11:15:00Z",
        updated_at: "2024-01-20T11:15:00Z",
      },
      {
        id: 3,
        user_id: 1,
        user_name: "John Kamau",
        user_email: "john.kamau@email.com",
        tournament_id: 1,
        tournament_name: "Weekend Warriors Cup",
        type: "prize_payout",
        amount: 5000,
        currency: "KES",
        status: "completed",
        payment_method: "mpesa",
        mpesa_transaction_id: "OGE987654321",
        mpesa_receipt_number: "OGE987654321",
        phone_number: "+254712345678",
        reference: "PAY001",
        description: "Tournament prize payout - 1st place",
        processed_at: "2024-01-21T14:20:00Z",
        created_at: "2024-01-21T14:15:00Z",
        updated_at: "2024-01-21T14:20:00Z",
      },
    ] as any[]

    const filtered = data.filter((p) => {
      const matchesSearch =
        !search ||
        p.user_name.toLowerCase().includes(search) ||
        p.user_email.toLowerCase().includes(search) ||
        (p.tournament_name || "").toLowerCase().includes(search) ||
        (p.reference || "").toLowerCase().includes(search)
      const matchesStatus = !status || p.status === status
      const matchesType = !type || p.type === type
      return matchesSearch && matchesStatus && matchesType
    })

    return NextResponse.json({ success: true, data: filtered })
  } catch (error) {
    console.error("Admin payments GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to load payments" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    requireRole(request, ["admin", "manager"]) // authorize
    const body = await request.json()
    const { paymentId, action } = body
    console.log(`Admin payments action: ${action} -> ${paymentId}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin payments PUT error:", error)
    return NextResponse.json({ success: false, error: "Failed to update payment" }, { status: 500 })
  }
}


