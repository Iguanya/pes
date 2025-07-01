import AfricasTalking from "africastalking"

// Initialize Africa's Talking client
let africasTalking: any = null

if (process.env.AFRICASTALKING_USERNAME && process.env.AFRICASTALKING_API_KEY) {
  africasTalking = AfricasTalking({
    apiKey: process.env.AFRICASTALKING_API_KEY,
    username: process.env.AFRICASTALKING_USERNAME,
  })
}

// Check if SMS service is available
export function isSMSServiceAvailable(): boolean {
  return africasTalking !== null && !!process.env.AFRICASTALKING_USERNAME && !!process.env.AFRICASTALKING_API_KEY
}

// Send SMS function
export async function sendSMS({
  to,
  message,
}: {
  to: string
  message: string
}): Promise<boolean> {
  if (!isSMSServiceAvailable()) {
    console.log("⚠️ SMS service not configured, skipping SMS send")
    return false
  }

  try {
    // Format phone number for Africa's Talking
    let formattedPhone = to.replace(/\s/g, "")
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "+254" + formattedPhone.substring(1)
    } else if (formattedPhone.startsWith("254")) {
      formattedPhone = "+" + formattedPhone
    } else if (!formattedPhone.startsWith("+254")) {
      formattedPhone = "+254" + formattedPhone
    }

    const sms = africasTalking.SMS
    const result = await sms.send({
      to: [formattedPhone],
      message,
      from: process.env.AFRICASTALKING_SHORTCODE || undefined,
    })

    if (result.SMSMessageData.Recipients[0].status === "Success") {
      console.log("✅ SMS sent successfully:", result.SMSMessageData.Recipients[0].messageId)
      return true
    } else {
      console.error("❌ SMS send failed:", result.SMSMessageData.Recipients[0].status)
      return false
    }
  } catch (error) {
    console.error("❌ SMS send error:", error)
    return false
  }
}

// Welcome SMS template
export function getWelcomeSMSTemplate(name: string, role: string): string {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "PES Tournament Platform"
  return `Welcome to ${appName}, ${name}! Your ${role} account is ready. Start competing in PES tournaments across Kenya. Visit ${process.env.NEXT_PUBLIC_APP_URL || "pestournament.ke"} to get started.`
}

// Send welcome SMS
export async function sendWelcomeSMS(phone: string, name: string, role = "player"): Promise<boolean> {
  const message = getWelcomeSMSTemplate(name, role)
  return sendSMS({ to: phone, message })
}

// Tournament notification SMS template
export function getTournamentNotificationSMS(name: string, tournamentName: string, action: string): string {
  const messages = {
    registered: `Hi ${name}! You've successfully registered for "${tournamentName}". Good luck!`,
    started: `Hi ${name}! Tournament "${tournamentName}" has started. Check your matches now.`,
    winner: `Congratulations ${name}! You won "${tournamentName}". Prize details will be sent soon.`,
    reminder: `Hi ${name}! Tournament "${tournamentName}" starts in 1 hour. Be ready!`,
  }

  return messages[action as keyof typeof messages] || `Hi ${name}! Update on tournament "${tournamentName}".`
}

// Send tournament notification SMS
export async function sendTournamentNotificationSMS(
  phone: string,
  name: string,
  tournamentName: string,
  action: string,
): Promise<boolean> {
  const message = getTournamentNotificationSMS(name, tournamentName, action)
  return sendSMS({ to: phone, message })
}

// Payment confirmation SMS template
export function getPaymentConfirmationSMS(name: string, amount: number, tournamentName: string): string {
  return `Hi ${name}! Payment of KES ${amount} confirmed for "${tournamentName}". You're all set to compete!`
}

// Send payment confirmation SMS
export async function sendPaymentConfirmationSMS(
  phone: string,
  name: string,
  amount: number,
  tournamentName: string,
): Promise<boolean> {
  const message = getPaymentConfirmationSMS(name, amount, tournamentName)
  return sendSMS({ to: phone, message })
}
