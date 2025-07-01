import { Resend } from "resend"

// Initialize Resend client
let resend: Resend | null = null

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY)
}

// Check if email service is available
export function isEmailServiceAvailable(): boolean {
  return resend !== null && !!process.env.RESEND_API_KEY && !!process.env.FROM_EMAIL
}

// Send email function
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text?: string
}): Promise<boolean> {
  if (!isEmailServiceAvailable()) {
    console.log("⚠️ Email service not configured, skipping email send")
    return false
  }

  try {
    const result = await resend!.emails.send({
      from: process.env.FROM_EMAIL!,
      to,
      subject,
      html,
      text,
    })

    if (result.error) {
      console.error("❌ Email send failed:", result.error)
      return false
    }

    console.log("✅ Email sent successfully:", result.data?.id)
    return true
  } catch (error) {
    console.error("❌ Email send error:", error)
    return false
  }
}

// Welcome email template
export function getWelcomeEmailTemplate(name: string, role: string): { subject: string; html: string; text: string } {
  const subject = `Welcome to ${process.env.NEXT_PUBLIC_APP_NAME || "PES Tournament Platform"}!`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1f2937; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to PES Tournament Platform!</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>Welcome to the ultimate PES tournament platform in Kenya! Your account has been successfully created with <strong>${role}</strong> privileges.</p>
          
          <h3>What's Next?</h3>
          <ul>
            <li>Complete your profile setup</li>
            <li>Browse upcoming tournaments</li>
            <li>Connect with other players</li>
            ${role === "organizer" ? "<li>Create your first tournament</li>" : ""}
            ${role === "player" ? "<li>Register for tournaments</li>" : ""}
          </ul>
          
          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://pestournament.ke"}/dashboard" class="button">
              Go to Dashboard
            </a>
          </p>
          
          <p>If you have any questions, feel free to contact our support team.</p>
          
          <p>Best regards,<br>The PES Tournament Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 ${process.env.NEXT_PUBLIC_COMPANY_NAME || "Iguanya Labs"}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Welcome to PES Tournament Platform!
    
    Hello ${name}!
    
    Welcome to the ultimate PES tournament platform in Kenya! Your account has been successfully created with ${role} privileges.
    
    What's Next?
    - Complete your profile setup
    - Browse upcoming tournaments
    - Connect with other players
    ${role === "organizer" ? "- Create your first tournament" : ""}
    ${role === "player" ? "- Register for tournaments" : ""}
    
    Visit your dashboard: ${process.env.NEXT_PUBLIC_APP_URL || "https://pestournament.ke"}/dashboard
    
    If you have any questions, feel free to contact our support team.
    
    Best regards,
    The PES Tournament Team
  `

  return { subject, html, text }
}

// Send welcome email
export async function sendWelcomeEmail(email: string, name: string, role = "player"): Promise<boolean> {
  const template = getWelcomeEmailTemplate(name, role)
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
}

// Password reset email template
export function getPasswordResetEmailTemplate(
  name: string,
  resetToken: string,
): { subject: string; html: string; text: string } {
  const subject = "Reset Your Password"
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://pestournament.ke"}/auth/reset-password?token=${resetToken}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .button { display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .warning { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>We received a request to reset your password for your PES Tournament Platform account.</p>
          
          <p>
            <a href="${resetUrl}" class="button">
              Reset Password
            </a>
          </p>
          
          <div class="warning">
            <strong>Security Notice:</strong>
            <ul>
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Never share this link with anyone</li>
            </ul>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          
          <p>Best regards,<br>The PES Tournament Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 ${process.env.NEXT_PUBLIC_COMPANY_NAME || "Iguanya Labs"}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Password Reset Request
    
    Hello ${name}!
    
    We received a request to reset your password for your PES Tournament Platform account.
    
    Reset your password: ${resetUrl}
    
    Security Notice:
    - This link will expire in 1 hour
    - If you didn't request this reset, please ignore this email
    - Never share this link with anyone
    
    Best regards,
    The PES Tournament Team
  `

  return { subject, html, text }
}
