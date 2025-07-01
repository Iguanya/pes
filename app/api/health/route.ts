import { NextResponse } from "next/server"
import { testConnection, getConnectionStatus } from "@/lib/database"
import { isEmailServiceAvailable } from "@/lib/email"
import { isSMSServiceAvailable } from "@/lib/sms"

export async function GET() {
  try {
    // Test database connection
    const dbConnected = await testConnection()
    const dbStatus = getConnectionStatus()

    // Check service availability
    const emailAvailable = isEmailServiceAvailable()
    const smsAvailable = isSMSServiceAvailable()

    // Determine overall status
    let overallStatus = "ok"
    if (!dbConnected) {
      overallStatus = dbStatus === "build-time" ? "build-time" : "degraded"
    }

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        database: dbConnected ? "connected" : dbStatus === "build-time" ? "build-time" : "failed",
        email: emailAvailable ? "configured" : "not configured",
        sms: smsAvailable ? "configured" : "not configured",
      },
      database: {
        host: process.env.DB_HOST || "not set",
        port: process.env.DB_PORT || "not set",
        name: process.env.DB_NAME || "not set",
        connectionStatus: dbStatus,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || "development",
        hasDbConfig: !!(process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD),
        hasEmailConfig: !!(process.env.RESEND_API_KEY && process.env.FROM_EMAIL),
        hasSmsConfig: !!(process.env.AFRICASTALKING_USERNAME && process.env.AFRICASTALKING_API_KEY),
        hasJwtSecret: !!process.env.JWT_SECRET,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || "not set",
      },
      version: "1.0.0",
    }

    return NextResponse.json(response, {
      status: overallStatus === "ok" ? 200 : overallStatus === "build-time" ? 200 : 503,
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
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
