import { Resend } from "resend"

// Initialize Resend only if API key is available
let resend: Resend | null = null

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY)
  console.log("✅ Email service (Resend) initialized")
} else {
  console.warn("⚠️ RESEND_API_KEY not found - Email service disabled")
}

const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@pestournament.ke"

export async function sendWelcomeEmail(to: string, name: string): Promise<boolean> {
  if (!resend) {
    console.warn("Email service not configured - skipping welcome email")
    return false
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: "Welcome to PES Tournament Platform!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to PES Tournament Platform!</h1>
          <p>Hi ${name},</p>
          <p>Welcome to Kenya's premier PES tournament platform! We're excited to have you join our community of passionate PES players.</p>
          
          <h2>What's Next?</h2>
          <ul>
            <li>Complete your profile setup</li>
            <li>Browse available tournaments</li>
            <li>Join your first tournament</li>
            <li>Connect with other players</li>
          </ul>
          
          <p>If you have any questions, feel free to reach out to our support team.</p>
          
          <p>Good luck and have fun!</p>
          <p><strong>The PES Tournament Team</strong></p>
          
          <hr style="margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            This email was sent by Iguanya Labs. If you didn't create an account, please ignore this email.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Failed to send welcome email:", error)
      return false
    }

    console.log("✅ Welcome email sent successfully:", data?.id)
    return true
  } catch (error) {
    console.error("Welcome email error:", error)
    return false
  }
}

export async function sendTournamentNotification(
  to: string,
  name: string,
  tournamentName: string,
  message: string,
): Promise<boolean> {
  if (!resend) {
    console.warn("Email service not configured - skipping tournament notification")
    return false
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Tournament Update: ${tournamentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Tournament Update</h1>
          <p>Hi ${name},</p>
          <p>We have an update regarding the tournament: <strong>${tournamentName}</strong></p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p>${message}</p>
          </div>
          
          <p>Visit your dashboard for more details and updates.</p>
          
          <p>Best regards,</p>
          <p><strong>The PES Tournament Team</strong></p>
        </div>
      `,
    })

    if (error) {
      console.error("Failed to send tournament notification:", error)
      return false
    }

    console.log("✅ Tournament notification sent successfully:", data?.id)
    return true
  } catch (error) {
    console.error("Tournament notification error:", error)
    return false
  }
}

export async function sendPasswordResetEmail(to: string, name: string, resetToken: string): Promise<boolean> {
  if (!resend) {
    console.warn("Email service not configured - skipping password reset email")
    return false
  }

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: "Reset Your Password - PES Tournament Platform",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Password Reset Request</h1>
          <p>Hi ${name},</p>
          <p>We received a request to reset your password for your PES Tournament Platform account.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p>If you didn't request this password reset, please ignore this email. The link will expire in 1 hour.</p>
          
          <p>For security reasons, please don't share this link with anyone.</p>
          
          <p>Best regards,</p>
          <p><strong>The PES Tournament Team</strong></p>
          
          <hr style="margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            If the button doesn't work, copy and paste this link: ${resetUrl}
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Failed to send password reset email:", error)
      return false
    }

    console.log("✅ Password reset email sent successfully:", data?.id)
    return true
  } catch (error) {
    console.error("Password reset email error:", error)
    return false
  }
}

export function isEmailConfigured(): boolean {
  return !!resend
}
