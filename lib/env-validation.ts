// Environment variable validation utility

export function validateEnvironment() {
  console.log("🔍 Validating Environment Variables...")

  const requiredEnvVars = ["JWT_SECRET", "DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"]

  const missingVars = requiredEnvVars.filter((varName) => {
    const value = process.env[varName]
    const isMissing = !value || value.trim() === ""
    if (isMissing) {
      console.error(`❌ Missing required environment variable: ${varName}`)
    } else {
      console.log(`✅ Found required environment variable: ${varName}`)
    }
    return isMissing
  })

  if (missingVars.length > 0) {
    console.error("❌ Missing required environment variables:", missingVars)
    return false
  }

  // Validate optional but recommended vars
  const optionalVars = ["RESEND_API_KEY", "AFRICASTALKING_API_KEY", "AFRICASTALKING_USERNAME"]

  const missingOptional = optionalVars.filter((varName) => {
    const value = process.env[varName]
    const isMissing = !value || value.trim() === ""
    if (isMissing) {
      console.warn(`⚠️ Missing optional environment variable: ${varName}`)
    } else {
      console.log(`✅ Found optional environment variable: ${varName}`)
    }
    return isMissing
  })

  if (missingOptional.length > 0) {
    console.warn("⚠️ Missing optional environment variables (some features may be disabled):", missingOptional)
  }

  console.log("✅ Environment validation completed")
  return true
}

export function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name]
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${name} is required`)
  }
  return value || defaultValue || ""
}

export function getOptionalEnvVar(name: string, defaultValue = ""): string {
  return process.env[name] || defaultValue
}

// Log all environment variables (excluding sensitive ones)
export function logEnvironmentInfo() {
  console.log("🌍 Environment Information:")
  console.log("NODE_ENV:", process.env.NODE_ENV)
  console.log("VERCEL_URL:", process.env.VERCEL_URL || "Not set")
  console.log("NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL)
  console.log("NEXT_PUBLIC_APP_NAME:", process.env.NEXT_PUBLIC_APP_NAME)
  console.log("NEXT_PUBLIC_COMPANY_NAME:", process.env.NEXT_PUBLIC_COMPANY_NAME)
}
