import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

// Define protected routes
const protectedRoutes = ["/dashboard", "/tournaments/create", "/matches/submit", "/profile"]
const authRoutes = ["/auth/login", "/auth/signup"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("auth-token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // If it's a protected route and no token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // If it's an auth route and user is already logged in, redirect to dashboard
  if (isAuthRoute && token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET!)
      return NextResponse.redirect(new URL("/dashboard", request.url))
    } catch {
      // Token is invalid, continue to auth page
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tournaments/create",
    "/matches/submit",
    "/profile/:path*",
    "/auth/login",
    "/auth/signup",
  ],
}
