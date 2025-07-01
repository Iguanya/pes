import { NextResponse } from "next/server"
import { testConnection, getConnectionStatus } from "@/lib/database"
import { isEmailServiceAvailable } from "@/lib/email"
import { isSMSServiceAvailable } from "@/lib/sms"

export async function GET() {
  try {
    // Test database connection
    const dbConnected = await testConnection(1) // Single attempt for health check
    const dbStatus = getConnectionStatus()

    // Check service availability
    const emailAvailable = isEmailServiceAvailable()
    const smsAvailable = isSMSServiceAvailable()

    // Determine overall health status
    const isHealthy = dbConnected || dbStatus === "build-time"

    const healthData = {
      status: isHealthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      services: {
        database: dbConnected ? "connected" : dbStatus,
        email: emailAvailable ? "configured" : "not configured",
        sms: smsAvailable ? "configured" : "not configured",
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDbConfig: !!(process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD),
        hasEmailConfig: !!process.env.RESEND_API_KEY,
        hasSmsConfig: !!(process.env.AFRICASTALKING_USERNAME && process.env.AFRICASTALKING_API_KEY),
        appUrl: process.env.NEXT_PUBLIC_APP_URL || "not set",
      },
      database: {
        host: process.env.DB_HOST || "not set",
        port: process.env.DB_PORT || "not set",
        name: process.env.DB_NAME || "not set",
        connectionStatus: dbStatus,
      },
    }

    return NextResponse.json(healthData, {
      status: isHealthy ? 200 : 503,
    })
  } catch (error) {
    console.error("Health check error:", error)

    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        services: {
          database: "error",
          email: "unknown",
          sms: "unknown",
        },
      },
      { status: 500 },
    )
  }
}
