import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const admin = requireRole(request, ["admin"])

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""
    const status = searchParams.get("status") || ""

    // Mock data - replace with actual database query
    const mockUsers = [
      {
        id: 1,
        name: "John Kamau",
        email: "john.kamau@email.com",
        phone: "+254712345678",
        gamertag: "JohnPES",
        role: "player",
        status: "active",
        created_at: "2024-01-15T10:00:00Z",
        last_login: "2024-01-20T14:30:00Z",
        tournaments_joined: 15,
        total_earnings: 25000,
        win_rate: 68,
      },
      // Add more mock users...
    ]

    // Apply filters
    let filteredUsers = mockUsers
    if (search) {
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          user.gamertag.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (role) {
      filteredUsers = filteredUsers.filter((user) => user.role === role)
    }

    if (status) {
      filteredUsers = filteredUsers.filter((user) => user.status === status)
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit),
      },
    })
  } catch (error) {
    console.error("Admin users API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin access
    const admin = requireRole(request, ["admin"])

    const body = await request.json()
    const { userId, action, data } = body

    // Mock implementation - replace with actual database operations
    switch (action) {
      case "suspend":
        // Suspend user
        console.log(`Suspending user ${userId}`)
        break
      case "activate":
        // Activate user
        console.log(`Activating user ${userId}`)
        break
      case "change_role":
        // Change user role
        console.log(`Changing role for user ${userId} to ${data.role}`)
        break
      case "ban":
        // Ban user
        console.log(`Banning user ${userId}`)
        break
      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
    })
  } catch (error) {
    console.error("Admin user update error:", error)
    return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 })
  }
}
