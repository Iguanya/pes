import { type NextRequest, NextResponse } from "next/server"

// Mock M-Pesa API integration
async function initiateMpesaPayment(phoneNumber: string, amount: number, accountReference: string) {
  // Simulate M-Pesa API call delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Mock successful response
  return {
    MerchantRequestID: `MPESA_${Date.now()}`,
    CheckoutRequestID: `CHECKOUT_${Date.now()}`,
    ResponseCode: "0",
    ResponseDescription: "Success. Request accepted for processing",
    CustomerMessage: "Success. Request accepted for processing",
  }
}

async function queryMpesaPaymentStatus(checkoutRequestId: string) {
  // Simulate status check delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock successful payment
  return {
    ResponseCode: "0",
    ResponseDescription: "The service request has been accepted successfully",
    MerchantRequestID: `MPESA_${Date.now()}`,
    CheckoutRequestID: checkoutRequestId,
    ResultCode: "0",
    ResultDesc: "The service request is processed successfully.",
    Amount: 500,
    MpesaReceiptNumber: `MPR${Date.now()}`,
    TransactionDate: new Date().toISOString(),
    PhoneNumber: "254712345678",
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone_number, amount, tournament_id, user_id, type = "entry_fee" } = body

    // Validate required fields
    if (!phone_number || !amount || !user_id) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Format phone number (ensure it starts with 254)
    let formattedPhone = phone_number.replace(/\D/g, "")
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.substring(1)
    } else if (!formattedPhone.startsWith("254")) {
      formattedPhone = "254" + formattedPhone
    }

    // Generate account reference
    const accountReference = tournament_id ? `TOURNAMENT${tournament_id}` : `USER${user_id}_${Date.now()}`

    try {
      // Initiate M-Pesa payment
      const mpesaResponse = await initiateMpesaPayment(formattedPhone, amount, accountReference)

      if (mpesaResponse.ResponseCode !== "0") {
        return NextResponse.json(
          {
            success: false,
            error: "M-Pesa payment initiation failed",
            details: mpesaResponse.ResponseDescription,
          },
          { status: 400 },
        )
      }

      // Create payment record (mock)
      const payment = {
        id: Math.floor(Math.random() * 1000),
        user_id: user_id,
        tournament_id: tournament_id,
        type: type,
        amount: amount,
        currency: "KES",
        phone_number: formattedPhone,
        mpesa_checkout_request_id: mpesaResponse.CheckoutRequestID,
        mpesa_merchant_request_id: mpesaResponse.MerchantRequestID,
        status: "pending",
        created_at: new Date().toISOString(),
      }

      return NextResponse.json(
        {
          success: true,
          data: payment,
          mpesa_response: mpesaResponse,
          message: "Payment initiated successfully. Please complete the payment on your phone.",
        },
        { status: 201 },
      )
    } catch (mpesaError) {
      console.error("M-Pesa API error:", mpesaError)
      return NextResponse.json(
        {
          success: false,
          error: "M-Pesa service temporarily unavailable",
        },
        { status: 503 },
      )
    }
  } catch (error) {
    console.error("Payment initiation error:", error)
    return NextResponse.json({ success: false, error: "Failed to initiate payment" }, { status: 500 })
  }
}

// Check payment status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const checkoutRequestId = searchParams.get("checkout_request_id")

  if (!checkoutRequestId) {
    return NextResponse.json({ success: false, error: "checkout_request_id is required" }, { status: 400 })
  }

  try {
    const statusResponse = await queryMpesaPaymentStatus(checkoutRequestId)

    // Update payment status in database (mock)
    const updatedPayment = {
      checkout_request_id: checkoutRequestId,
      status: statusResponse.ResultCode === "0" ? "completed" : "failed",
      mpesa_receipt_number: statusResponse.MpesaReceiptNumber,
      transaction_date: statusResponse.TransactionDate,
      amount: statusResponse.Amount,
      phone_number: statusResponse.PhoneNumber,
    }

    return NextResponse.json({
      success: true,
      data: updatedPayment,
      mpesa_response: statusResponse,
    })
  } catch (error) {
    console.error("Payment status check error:", error)
    return NextResponse.json({ success: false, error: "Failed to check payment status" }, { status: 500 })
  }
}
