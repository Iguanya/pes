import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "KSh"): string {
  return `${currency} ${amount.toLocaleString()}`
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatPhoneNumber(phone: string): string {
  // Format Kenyan phone numbers
  let formatted = phone.replace(/\D/g, "")
  if (formatted.startsWith("0")) {
    formatted = "254" + formatted.substring(1)
  } else if (!formatted.startsWith("254")) {
    formatted = "254" + formatted
  }
  return `+${formatted}`
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + "..."
}

export function calculateWinRate(wins: number, totalMatches: number): number {
  if (totalMatches === 0) return 0
  return Math.round((wins / totalMatches) * 100)
}

export function getTimeAgo(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`

  return formatDate(date)
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidKenyanPhone(phone: string): boolean {
  const phoneRegex = /^(\+254|254|0)?[17]\d{8}$/
  return phoneRegex.test(phone.replace(/\s/g, ""))
}

export function generateTournamentCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
