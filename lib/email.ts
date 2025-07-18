import nodemailer from "nodemailer"

const transporter = nodemailer.createTransporter({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

const FROM_EMAIL = process.env.FROM_EMAIL || process.env.GMAIL_USER || "noreply@example.com"

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"PES Tournaments" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    })
    console.log("✅ Email sent to", to)
    return true
  } catch (error) {
    console.error("❌ Email sending failed:", error)
    return false
  }
}

export async function sendWelcomeEmail(to: string, name: string): Promise<boolean> {
  const html = `
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
  `

  return await sendEmail(to, "Welcome to PES Tournament Platform!", html)
}

export async function sendTournamentNotification(
  to: string,
  name: string,
  tournamentName: string,
  message: string,
): Promise<boolean> {
  const html = `
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
  `
  return await sendEmail(to, `Tournament Update: ${tournamentName}`, html)
}

export async function sendPasswordResetEmail(to: string, name: string, resetToken: string): Promise<boolean> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`

  const html = `
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
      
      <p>Best regards,<br/><strong>The PES Tournament Team</strong></p>
      
      <hr style="margin: 20px 0;">
      <p style="font-size: 12px; color: #666;">
        If the button doesn't work, copy and paste this link: ${resetUrl}
      </p>
    </div>
  `
  return await sendEmail(to, "Reset Your Password - PES Tournament Platform", html)
}

export function isEmailConfigured(): boolean {
  return !!process.env.GMAIL_USER && !!process.env.GMAIL_APP_PASSWORD
}
