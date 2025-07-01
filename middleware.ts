import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getAuthUser, hasPermission } from "@/lib/auth"

// Define route permissions
const routePermissions = {
  // Public routes (no authentication required)
  public: ["/", "/auth/login", "/auth/signup", "/api/auth/login", "/api/auth/register", "/api/health"],

  // Player routes (requires player role or higher)
  player: ["/dashboard", "/tournaments", "/profile"],

  // Organizer routes (requires organizer role or higher)
  organizer: ["/tournaments/create", "/tournaments/manage"],

  // Manager routes (requires manager role or higher)
  manager: ["/admin/tournaments", "/admin/users"],

  // Admin routes (requires admin role)
  admin: ["/admin", "/admin/settings", "/admin/analytics"],
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes that don't need auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Check if route is public
  const isPublicRoute = routePermissions.public.some((route) => pathname === route || pathname.startsWith(route))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Get authenticated user
  const user = getAuthUser(request)

  // If no user and route requires authentication, redirect to login
  if (!user) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check role-based permissions
  let hasAccess = false

  // Check admin routes
  if (routePermissions.admin.some((route) => pathname.startsWith(route))) {
    hasAccess = hasPermission(user, "admin")
  }
  // Check manager routes
  else if (routePermissions.manager.some((route) => pathname.startsWith(route))) {
    hasAccess = hasPermission(user, "manager")
  }
  // Check organizer routes
  else if (routePermissions.organizer.some((route) => pathname.startsWith(route))) {
    hasAccess = hasPermission(user, "organizer")
  }
  // Check player routes
  else if (routePermissions.player.some((route) => pathname.startsWith(route))) {
    hasAccess = hasPermission(user, "player")
  }
  // Default to allowing access for authenticated users
  else {
    hasAccess = true
  }

  if (!hasAccess) {
    return NextResponse.json(
      {
        success: false,
        error: "Access denied. Insufficient permissions.",
      },
      { status: 403 },
    )
  }

  // Add user info to request headers for API routes
  const response = NextResponse.next()
  response.headers.set("x-user-id", user.userId.toString())
  response.headers.set("x-user-role", user.role)
  response.headers.set("x-user-email", user.email)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}
