import { NextResponse } from "next/server"
import { testConnection, getConnectionStatus } from "@/lib/database"
import { isEmailConfigured } from "@/lib/email"
import { isSMSConfigured } from "@/lib/sms"

export async function GET() {
  try {
    // Test database connection
    const dbConnected = await testConnection()
    const dbStatus = getConnectionStatus()

    // Check service configurations
    const emailConfigured = isEmailConfigured()
    const smsConfigured = isSMSConfigured()

    // Determine overall status
    let status = "ok"
    if (!dbConnected) {
      status = "degraded"
    }

    const response = {
      status,
      timestamp: new Date().toISOString(),
      services: {
        database: dbConnected ? "connected" : "failed",
        email: emailConfigured ? "configured" : "not configured",
        sms: smsConfigured ? "configured" : "not configured",
      },
      database: {
        host: process.env.DB_HOST || "not set",
        port: process.env.DB_PORT || "not set",
        name: process.env.DB_NAME || "not set",
        connectionStatus: dbStatus,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDbConfig: !!(process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD),
        hasEmailConfig: !!process.env.RESEND_API_KEY,
        hasSmsConfig: !!(process.env.AFRICASTALKING_USERNAME && process.env.AFRICASTALKING_API_KEY),
        appUrl: process.env.NEXT_PUBLIC_APP_URL || "not set",
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Health check failed",
      },
      { status: 500 },
    )
  }
}
