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

interface Tournament {
  id: number
  name: string
  status: string
  current_players: number
  max_players: number
  entry_fee: number
  prize_pool: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    tournaments: 0,
    matches: 0,
    earnings: 0,
    winRate: 0,
  })
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/auth/login")
      return
    }
    setUser(JSON.parse(userData))
    loadDashboardData()
  }, [router])

  const loadDashboardData = async () => {
    try {
      // Load tournaments
      const tournamentsResponse = await fetch("/api/tournaments?limit=5")
      if (tournamentsResponse.ok) {
        const tournamentsData = await tournamentsResponse.json()
        setTournaments(tournamentsData.data || [])
      }

      // Mock stats - in production, fetch from API
      setStats({
        tournaments: 3,
        matches: 24,
        earnings: 2500,
        winRate: 67,
      })
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
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

  if (!user) {
    return null
  }

  const isOrganizer = user.role === "organizer"

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title={`Welcome back, ${user.name}!`}
          description={`Your ${user.role} dashboard - Track your progress and manage your tournaments`}
        >
          <Badge variant={isOrganizer ? "default" : "secondary"} className="capitalize">
            {user.role}
          </Badge>
        </PageHeader>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isOrganizer ? "Active Tournaments" : "Tournaments Joined"}
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tournaments}</div>
              <p className="text-xs text-muted-foreground">+1 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isOrganizer ? "Total Participants" : "Matches Played"}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isOrganizer ? "127" : stats.matches}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{isOrganizer ? "Revenue" : "Earnings"}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KSh {isOrganizer ? "45,230" : stats.earnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{isOrganizer ? "Success Rate" : "Win Rate"}</CardTitle>
              {isOrganizer ? (
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Target className="h-4 w-4 text-muted-foreground" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isOrganizer ? "98%" : `${stats.winRate}%`}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                {isOrganizer ? "Manage your tournaments" : "Join tournaments and track progress"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isOrganizer ? (
                <>
                  <Button className="w-full justify-start" asChild>
                    <Link href="/tournaments/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Tournament
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="/tournaments/manage">
                      <Trophy className="mr-2 h-4 w-4" />
                      Manage Tournaments
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="/analytics">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      View Analytics
                    </Link>
                  </Button>
                </>
              ) : (
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
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest tournament activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {isOrganizer ? "Weekend Cup created" : "Registered for Weekend Cup"}
                    </p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {isOrganizer ? "Payout processed for Champions League" : "Won match vs PlayerX"}
                    </p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {isOrganizer ? "New participant joined" : "Match result submitted"}
                    </p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Your {isOrganizer ? "tournament" : "gaming"} performance this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">Performance Chart</p>
                  <p className="text-xs text-muted-foreground">Coming Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Tournaments */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{isOrganizer ? "Your Tournaments" : "Active Tournaments"}</CardTitle>
            <CardDescription>
              {isOrganizer ? "Tournaments you're organizing" : "Tournaments you can join"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tournaments.length > 0 ? (
              <div className="space-y-4">
                {tournaments.slice(0, 3).map((tournament) => (
                  <div key={tournament.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{tournament.name}</h3>
                      <p className="text-sm text-gray-600">
                        {tournament.current_players}/{tournament.max_players} players • KSh{" "}
                        {tournament.entry_fee.toLocaleString()} entry
                      </p>
                      <Badge variant="secondary" className="mt-1 capitalize">
                        {tournament.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Prize Pool</p>
                      <p className="text-lg font-bold text-green-600">KSh {tournament.prize_pool.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                <div className="text-center pt-4">
                  <Button variant="outline" asChild>
                    <Link href="/tournaments">View All Tournaments</Link>
                  </Button>
                </div>
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
