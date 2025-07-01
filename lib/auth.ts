import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"

export interface AuthUser {
  userId: number
  email: string
  role: string
  gamertag: string
}

export function verifyToken(token: string): AuthUser | null {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured")
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as AuthUser
    return decoded
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  const token = request.cookies.get("auth-token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    return null
  }

  return verifyToken(token)
}

export function requireAuth(request: NextRequest): AuthUser {
  const user = getAuthUser(request)
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

export function requireRole(request: NextRequest, allowedRoles: string[]): AuthUser {
  const user = requireAuth(request)
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Insufficient permissions")
  }
  return user
}
