import AfricasTalking from "africastalking"

// Initialize Africa's Talking only if credentials are available
let sms: any = null

if (process.env.AFRICASTALKING_USERNAME && process.env.AFRICASTALKING_API_KEY) {
  const africasTalking = AfricasTalking({
    apiKey: process.env.AFRICASTALKING_API_KEY,
    username: process.env.AFRICASTALKING_USERNAME,
  })
  sms = africasTalking.SMS
  console.log("✅ SMS service (Africa's Talking) initialized")
} else {
  console.warn("⚠️ Africa's Talking credentials not found - SMS service disabled")
}

export async function sendWelcomeSMS(phone: string, name: string): Promise<boolean> {
  if (!sms) {
    console.warn("SMS service not configured - skipping welcome SMS")
    return false
  }

  // Ensure phone number is in correct format
  const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`

  try {
    const options = {
      to: [formattedPhone],
      message: `Hi ${name}! Welcome to PES Tournament Platform. Your account has been created successfully. Start competing in tournaments today! - Iguanya Labs`,
      from: process.env.AFRICASTALKING_SHORTCODE || undefined,
    }

    const response = await sms.send(options)

    if (response.SMSMessageData.Recipients[0].status === "Success") {
      console.log("✅ Welcome SMS sent successfully")
      return true
    } else {
      console.error("Failed to send welcome SMS:", response.SMSMessageData.Recipients[0])
      return false
    }
  } catch (error) {
    console.error("Welcome SMS error:", error)
    return false
  }
}

export async function sendTournamentSMS(phone: string, name: string, message: string): Promise<boolean> {
  if (!sms) {
    console.warn("SMS service not configured - skipping tournament SMS")
    return false
  }

  const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`

  try {
    const options = {
      to: [formattedPhone],
      message: `Hi ${name}! ${message} - PES Tournament Platform`,
      from: process.env.AFRICASTALKING_SHORTCODE || undefined,
    }

    const response = await sms.send(options)

    if (response.SMSMessageData.Recipients[0].status === "Success") {
      console.log("✅ Tournament SMS sent successfully")
      return true
    } else {
      console.error("Failed to send tournament SMS:", response.SMSMessageData.Recipients[0])
      return false
    }
  } catch (error) {
    console.error("Tournament SMS error:", error)
    return false
  }
}

export async function sendPaymentConfirmationSMS(
  phone: string,
  name: string,
  amount: number,
  tournamentName: string,
): Promise<boolean> {
  if (!sms) {
    console.warn("SMS service not configured - skipping payment confirmation SMS")
    return false
  }

  const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`

  try {
    const options = {
      to: [formattedPhone],
      message: `Hi ${name}! Payment of KSh ${amount} confirmed for ${tournamentName}. You're now registered! Good luck! - PES Tournament Platform`,
      from: process.env.AFRICASTALKING_SHORTCODE || undefined,
    }

    const response = await sms.send(options)

    if (response.SMSMessageData.Recipients[0].status === "Success") {
      console.log("✅ Payment confirmation SMS sent successfully")
      return true
    } else {
      console.error("Failed to send payment confirmation SMS:", response.SMSMessageData.Recipients[0])
      return false
    }
  } catch (error) {
    console.error("Payment confirmation SMS error:", error)
    return false
  }
}

export function isSMSConfigured(): boolean {
  return !!sms
}
