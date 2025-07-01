import { Resend } from "resend"

// Initialize Resend only if API key is available
let resend: Resend | null = null
let emailServiceAvailable = false

try {
  const apiKey = process.env.RESEND_API_KEY
  if (apiKey && apiKey.trim() !== "") {
    resend = new Resend(apiKey)
    emailServiceAvailable = true
    console.log("✅ Email service (Resend) initialized successfully")
  } else {
    console.log("⚠️ Email service not configured - RESEND_API_KEY not found")
  }
} catch (error) {
  console.error("❌ Failed to initialize email service:", error)
  emailServiceAvailable = false
}

export interface EmailData {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail(emailData: EmailData): Promise<boolean> {
  if (!emailServiceAvailable || !resend) {
    console.log("⚠️ Email service not available, skipping email send")
    return false
  }

  try {
    const fromEmail = emailData.from || process.env.FROM_EMAIL || "noreply@iguanyalabs.com"

    const result = await resend.emails.send({
      from: fromEmail,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
    })

    console.log("✅ Email sent successfully:", result.data?.id)
    return true
  } catch (error) {
    console.error("❌ Failed to send email:", error)
    return false
  }
}

export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
  const emailData: EmailData = {
    to: userEmail,
    subject: "Welcome to PES Tournament Platform!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to PES Tournament Platform!</h1>
        <p>Hi ${userName},</p>
        <p>Thank you for joining our PES tournament platform. You can now:</p>
        <ul>
          <li>Browse and join tournaments</li>
          <li>Create your own tournaments</li>
          <li>Track your performance</li>
          <li>Connect with other players</li>
        </ul>
        <p>Get started by exploring the available tournaments!</p>
        <p>Best regards,<br>The Iguanya Labs Team</p>
      </div>
    `,
  }

  return await sendEmail(emailData)
}

export async function sendTournamentNotification(
  userEmail: string,
  userName: string,
  tournamentName: string,
  message: string,
): Promise<boolean> {
  const emailData: EmailData = {
    to: userEmail,
    subject: `Tournament Update: ${tournamentName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Tournament Update</h1>
        <p>Hi ${userName},</p>
        <p>There's an update regarding the tournament: <strong>${tournamentName}</strong></p>
        <p>${message}</p>
        <p>Visit the platform to see more details.</p>
        <p>Best regards,<br>The Iguanya Labs Team</p>
      </div>
    `,
  }

  return await sendEmail(emailData)
}

export function isEmailServiceAvailable(): boolean {
  return emailServiceAvailable
}
