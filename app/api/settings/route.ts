import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getUserSettings, updateUserSettings } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)

    const settings = await getUserSettings(user.id)

    return NextResponse.json({
      success: true,
      settings,
    })
  } catch (error) {
    console.error("Get settings error:", error)

    if (error instanceof Error && error.message.includes("Authentication required")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    return NextResponse.json({ success: false, error: "Failed to load settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = requireAuth(request)
    const settings = await request.json()

    // Validate settings structure
    if (!settings.notifications || !settings.preferences || !settings.privacy) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid settings format",
        },
        { status: 400 },
      )
    }

    // Validate notification settings
    const validNotificationKeys = [
      "email_tournaments",
      "email_matches",
      "email_marketing",
      "sms_tournaments",
      "sms_matches",
      "push_notifications",
    ]

    for (const key of validNotificationKeys) {
      if (typeof settings.notifications[key] !== "boolean") {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid notification setting: ${key}`,
          },
          { status: 400 },
        )
      }
    }

    // Validate preference settings
    const validLanguages = ["en", "sw"]
    const validTimezones = ["Africa/Nairobi", "UTC"]
    const validThemes = ["light", "dark", "system"]
    const validCurrencies = ["KES", "USD"]

    if (!validLanguages.includes(settings.preferences.language)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid language setting",
        },
        { status: 400 },
      )
    }

    if (!validTimezones.includes(settings.preferences.timezone)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid timezone setting",
        },
        { status: 400 },
      )
    }

    if (!validThemes.includes(settings.preferences.theme)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid theme setting",
        },
        { status: 400 },
      )
    }

    if (!validCurrencies.includes(settings.preferences.currency)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid currency setting",
        },
        { status: 400 },
      )
    }

    // Validate privacy settings
    const validVisibilityOptions = ["public", "friends", "private"]

    if (!validVisibilityOptions.includes(settings.privacy.profile_visibility)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid profile visibility setting",
        },
        { status: 400 },
      )
    }

    const validPrivacyKeys = ["show_stats", "show_earnings", "allow_friend_requests"]

    for (const key of validPrivacyKeys) {
      if (typeof settings.privacy[key] !== "boolean") {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid privacy setting: ${key}`,
          },
          { status: 400 },
        )
      }
    }

    // Save settings to database
    await updateUserSettings(user.id, settings)

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
    })
  } catch (error) {
    console.error("Save settings error:", error)

    if (error instanceof Error && error.message.includes("Authentication required")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    return NextResponse.json({ success: false, error: "Failed to save settings" }, { status: 500 })
  }
}
