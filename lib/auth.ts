import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"
import { getUserById } from "./database"

export interface AuthUser {
  userId: number
  email: string
  role: string
  gamertag: string
  name: string
}

export interface JWTPayload {
  userId: number
  email: string
  role: string
  gamertag: string
  name: string
  iat?: number
  exp?: number
}

// Generate JWT token
export function generateToken(user: {
  id: number
  email: string
  role: string
  gamertag: string
  name: string
}): string {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured")
  }

  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    gamertag: user.gamertag,
    name: user.name,
  }

  return jwt.sign(payload, jwtSecret, {
    expiresIn: "7d",
    issuer: "pes-tournament-platform",
    audience: "pes-users",
  })
}

// Verify JWT token
export function verifyToken(token: string): AuthUser | null {
  try {
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured")
    }

    const decoded = jwt.verify(token, jwtSecret, {
      issuer: "pes-tournament-platform",
      audience: "pes-users",
    }) as JWTPayload

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      gamertag: decoded.gamertag,
      name: decoded.name,
    }
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

// Get authenticated user from request
export function getAuthUser(request: NextRequest): AuthUser | null {
  // Try to get token from Authorization header first
  const authHeader = request.headers.get("authorization")
  let token = authHeader?.replace("Bearer ", "")

  // If no Authorization header, try cookie
  if (!token) {
    token = request.cookies.get("auth-token")?.value
  }

  if (!token) {
    return null
  }

  return verifyToken(token)
}

// Require authentication
export function requireAuth(request: NextRequest): AuthUser {
  const user = getAuthUser(request)
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

// Require specific role
export function requireRole(request: NextRequest, allowedRoles: string[]): AuthUser {
  const user = requireAuth(request)
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Access denied. Required roles: ${allowedRoles.join(", ")}`)
  }
  return user
}

// Check if user has permission
export function hasPermission(user: AuthUser, requiredRole: string): boolean {
  const roleHierarchy = {
    admin: 4,
    manager: 3,
    organizer: 2,
    player: 1,
  }

  const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0

  return userLevel >= requiredLevel
}

// Refresh token (get fresh user data)
export async function refreshToken(userId: number): Promise<string | null> {
  try {
    const user = await getUserById(userId)
    if (!user) {
      return null
    }

    return generateToken(user)
  } catch (error) {
    console.error("Token refresh failed:", error)
    return null
  }
}

// Decode token without verification (for debugging)
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload
  } catch (error) {
    console.error("Token decode failed:", error)
    return null
  }
}
