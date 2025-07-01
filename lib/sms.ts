import AfricasTalking from "africastalking"

// Initialize Africa's Talking only if credentials are available
let sms: any = null
let smsServiceAvailable = false

try {
  const username = process.env.AFRICASTALKING_USERNAME
  const apiKey = process.env.AFRICASTALKING_API_KEY

  if (username && apiKey && username.trim() !== "" && apiKey.trim() !== "") {
    const africasTalking = AfricasTalking({
      apiKey: apiKey,
      username: username,
    })
    sms = africasTalking.SMS
    smsServiceAvailable = true
    console.log("✅ SMS service (Africa's Talking) initialized successfully")
  } else {
    console.log("⚠️ SMS service not configured - Africa's Talking credentials not found")
  }
} catch (error) {
  console.error("❌ Failed to initialize SMS service:", error)
  smsServiceAvailable = false
}

export interface SMSData {
  to: string
  message: string
  from?: string
}

export async function sendSMS(smsData: SMSData): Promise<boolean> {
  if (!smsServiceAvailable || !sms) {
    console.log("⚠️ SMS service not available, skipping SMS send")
    return false
  }

  try {
    // Ensure phone number is in international format
    let phoneNumber = smsData.to
    if (phoneNumber.startsWith("0")) {
      phoneNumber = "+254" + phoneNumber.substring(1)
    } else if (!phoneNumber.startsWith("+")) {
      phoneNumber = "+254" + phoneNumber
    }

    const options = {
      to: [phoneNumber],
      message: smsData.message,
      from: smsData.from || "PES_TOURNAMENT",
    }

    const result = await sms.send(options)
    console.log("✅ SMS sent successfully:", result)
    return true
  } catch (error) {
    console.error("❌ Failed to send SMS:", error)
    return false
  }
}

export async function sendWelcomeSMS(phoneNumber: string, userName: string): Promise<boolean> {
  const message = `Welcome to PES Tournament Platform, ${userName}! Start competing in tournaments and track your progress. Visit our platform to get started.`

  return await sendSMS({
    to: phoneNumber,
    message: message,
  })
}

export async function sendTournamentSMS(
  phoneNumber: string,
  userName: string,
  tournamentName: string,
  message: string,
): Promise<boolean> {
  const smsMessage = `Hi ${userName}, Tournament Update: ${tournamentName} - ${message}`

  return await sendSMS({
    to: phoneNumber,
    message: smsMessage,
  })
}

export function isSMSServiceAvailable(): boolean {
  return smsServiceAvailable
}
