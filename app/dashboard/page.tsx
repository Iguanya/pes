"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/layout/navbar"
import { PageHeader } from "@/components/ui/page-header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { Trophy, Users, DollarSign, Plus, Target, TrendingUp, Award } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface User {
  id: number
  name: string
  email: string
  role: string
  gamertag: string
}

interface DashboardStats {
  // Player stats
  tournaments_joined?: number
  active_tournaments?: number
  total_matches?: number
  wins?: number
  win_rate?: number
  total_earnings?: number
  total_spent?: number

  // Organizer stats
  total_tournaments?: number
  completed_tournaments?: number
  total_participants?: number
  actual_revenue?: number
  potential_revenue?: number

  // Admin stats
  total_users?: number
  active_users?: number
  total_players?: number
  total_organizers?: number
  total_revenue?: number
  monthly_revenue?: number
  pending_disputes?: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<any | null>(null)
  const [activity, setActivity] = useState<any[]>([])
  const [tournaments, setTournaments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Get current user
      const userResponse = await fetch("/api/auth/me")
      if (!userResponse.ok) {
        router.push("/auth/login")
        return
      }
      const userData = await userResponse.json()
      setUser(userData.user)

      // Get dashboard stats
      const statsResponse = await fetch("/api/dashboard/stats")
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.data)
      }

      // Get recent activity
      const activityResponse = await fetch("/api/dashboard/activity?limit=5")
      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        setActivity(activityData.data)
      }

      // Get tournaments based on role
      const tournamentsResponse = await fetch("/api/tournaments?limit=5")
      if (tournamentsResponse.ok) {
        const tournamentsData = await tournamentsResponse.json()
        setTournaments(tournamentsData.data || [])
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (!user || !stats) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <EmptyState
            icon={Award}
            title="Unable to load dashboard"
            description="There was an error loading your dashboard data. Please try again."
            action={{
              label: "Retry",
              onClick: () => window.location.reload(),
            }}
          />
        </div>
      </div>
    )
  }

  const isAdmin = user.role === "admin" || user.role === "manager"
  const isOrganizer = user.role === "organizer"
  const isPlayer = user.role === "player"

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <PageHeader className="text-center font:sm "
          title={`Welcome back, ${user.name}!`}
          description={`Your ${user.role} dashboard - Track your progress and manage your activities`}
        >
        </PageHeader>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isAdmin && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_users?.toLocaleString() || 0}</div>
                  <p className="text-xs text-muted-foreground">{stats.active_users || 0} active users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">KSh {(stats.total_revenue || 0).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    KSh {(stats.monthly_revenue || 0).toLocaleString()} this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Tournaments</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.active_tournaments || 0}</div>
                  <p className="text-xs text-muted-foreground">{stats.total_tournaments || 0} total tournaments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Disputes</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pending_disputes || 0}</div>
                  <p className="text-xs text-muted-foreground">Require attention</p>
                </CardContent>
              </Card>
            </>
          )}

          {isOrganizer && (
            <>
              <Card className="bg-blue-100 hover:bg-blue-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Tournaments</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_tournaments || 0}</div>
                </CardContent>
              </Card>

              <Card className="bg-blue-100 hover:bg-blue-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_participants || 0}</div>
                  <p className="text-xs text-muted-foreground">Across all tournaments</p>
                </CardContent>
              </Card>

              <Card className="bg-blue-100 hover:bg-blue-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">KSh {(stats.actual_revenue || 0).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">From entry fees</p>
                </CardContent>
              </Card>

              <Card className="bg-blue-100 hover:bg-blue-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.total_tournaments
                      ? Math.round(((stats.completed_tournaments || 0) / stats.total_tournaments) * 100)
                      : 0}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground">Tournaments completed</p>
                </CardContent>
              </Card>
            </>
          )}

          {isPlayer && (
            <>
              <Card className="bg-blue-100 hover:bg-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tournaments Joined</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.tournaments_joined || 0}</div>
                  <p className="text-xs text-muted-foreground">{stats.active_tournaments || 0} currently active</p>
                </CardContent>
              </Card>

              <Card className="bg-blue-100 hover:bg-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Matches Played</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_matches || 0}</div>
                  <p className="text-xs text-muted-foreground">{stats.wins || 0} wins</p>
                </CardContent>
              </Card>

              <Card className="bg-blue-100 hover:bg-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">KSh {(stats.total_earnings || 0).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Spent: KSh {(stats.total_spent || 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-blue-100 hover:bg-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.win_rate || 0}%</div>
                  <p className="text-xs text-muted-foreground">Overall performance</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card className="bg-purple-100 hover:bg-purple-200">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                {isAdmin
                  ? "Platform management tools"
                  : isOrganizer
                    ? "Tournament management"
                    : "Join tournaments and track progress"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isAdmin && (
                <>
                  <Button className="w-full justify-start" asChild>
                    <Link href="/admin/users">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Users
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="/admin/tournaments">
                      <Trophy className="mr-2 h-4 w-4" />
                      Manage Tournaments
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="/admin/analytics">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      View Analytics
                    </Link>
                  </Button>
                </>
              )}

              {isOrganizer && (
                <>
                  <Button className="w-18 justify-center" asChild>
                    <Link href="/tournaments/create">
                      <Plus className="mr-2 h-2 w-2" />
                      Create Tournament
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="/tournaments/manage">
                      <Trophy className="mr-2 h-4 w-4" />
                      Manage Tournaments
                    </Link>
                  </Button>
                </>
              )}

              {isPlayer && (
                <>
                  <Button className="w-full justify-start" asChild>
                    <Link href="/tournaments">
                      <Trophy className="mr-2 h-4 w-4" />
                      Browse Tournaments
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="/matches/submit">
                      <Target className="mr-2 h-4 w-4" />
                      Submit Match Result
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="/profile">
                      <Users className="mr-2 h-4 w-4" />
                      View Profile
                    </Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-purple-100 hover:bg-purple-200">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest platform activity</CardDescription>
            </CardHeader>
            <CardContent>
              {activity.length > 0 ? (
                <div className="space-y-4">
                  {activity.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.description}</p>
                        <p className="text-xs text-gray-500">{formatTimeAgo(item.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Award}
                  title="No recent activity"
                  description="Your recent activities will appear here"
                />
              )}
            </CardContent>
          </Card>

          
        </div>

        {/* Active Tournaments */}
        <Card className="mt-8 bg-blue-100">
          <CardHeader>
            <CardTitle>{isOrganizer ? "Your Tournaments" : "Available Tournaments"}</CardTitle>
            <CardDescription>
              {isOrganizer ? "Tournaments you're organizing" : "Tournaments you can join"}
            </CardDescription>
          </CardHeader>
          <CardContent>
  {tournaments.length > 0 ? (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {tournaments.map((tournament) => (
        <div key={tournament.id} className="p-4 border rounded-lg bg-white shadow hover:bg-gray-300 transition-colors">
          <div className="mb-2">
            <h3 className="font-semibold text-lg">{tournament.name}</h3>
            <p className="text-sm text-gray-600">
              {tournament.current_players}/{tournament.max_players} players • KSh{" "}
              {tournament.entry_fee.toLocaleString()} entry
            </p>
          </div>
          <Badge variant="secondary" className="capitalize bg-gray-200 text-gray-800 mb-2">
            {tournament.status}
          </Badge>
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700">Prize Pool</p>
            <p className="text-lg font-bold text-green-600">
              KSh {(tournament.current_prize_pool || 0).toLocaleString()}
            </p>
          </div>
          <div className="mt-4">
            <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white">
              <Link href={`/tournaments/${tournament.id}/register`}>Register Now</Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <EmptyState
      icon={Trophy}
      title="No tournaments found"
      description={
        isOrganizer
          ? "Create your first tournament to get started"
          : "No active tournaments available right now"
      }
      action={
        isOrganizer
          ? {
              label: "Create Tournament",
              onClick: () => router.push("/tournaments/create"),
            }
          : undefined
      }
    />
  )}
</CardContent>

</Card>
</div>
</div>
  )
}