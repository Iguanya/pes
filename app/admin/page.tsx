"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Users,
  Trophy,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalTournaments: number
  activeTournaments: number
  totalRevenue: number
  monthlyRevenue: number
  pendingDisputes: number
  systemHealth: "healthy" | "warning" | "critical"
}

interface RecentActivity {
  id: number
  type: "user_registration" | "tournament_created" | "payment_processed" | "dispute_raised"
  description: string
  timestamp: string
  status: "success" | "warning" | "error"
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Mock data - replace with actual API calls
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setStats({
        totalUsers: 5247,
        activeUsers: 1834,
        totalTournaments: 342,
        activeTournaments: 28,
        totalRevenue: 2847500,
        monthlyRevenue: 485600,
        pendingDisputes: 7,
        systemHealth: "healthy",
      })

      setRecentActivity([
        {
          id: 1,
          type: "user_registration",
          description: "New user registered: john.doe@email.com",
          timestamp: "2 minutes ago",
          status: "success",
        },
        {
          id: 2,
          type: "tournament_created",
          description: "Tournament 'Weekend Warriors' created by ProGamer",
          timestamp: "15 minutes ago",
          status: "success",
        },
        {
          id: 3,
          type: "payment_processed",
          description: "Payment of KSh 1,500 processed for Tournament #234",
          timestamp: "32 minutes ago",
          status: "success",
        },
        {
          id: 4,
          type: "dispute_raised",
          description: "Match dispute raised in Tournament 'Champions Cup'",
          timestamp: "1 hour ago",
          status: "warning",
        },
      ])
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!stats) {
    return <div>Failed to load dashboard data</div>
  }

  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "user_registration":
        return <Users className="h-4 w-4" />
      case "tournament_created":
        return <Trophy className="h-4 w-4" />
      case "payment_processed":
        return <DollarSign className="h-4 w-4" />
      case "dispute_raised":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: RecentActivity["status"]) => {
    switch (status) {
      case "success":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "error":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Admin Dashboard" description="Monitor and manage your PES Tournament Platform">
        <div className="flex items-center space-x-2">
          <Badge
            variant={stats.systemHealth === "healthy" ? "default" : "destructive"}
            className="flex items-center space-x-1"
          >
            <CheckCircle className="h-3 w-3" />
            <span className="capitalize">{stats.systemHealth}</span>
          </Badge>
        </div>
      </PageHeader>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12.5%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +8.2%
              </span>
              from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh {(stats.totalRevenue / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +15.3%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tournaments</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTournaments}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600 flex items-center">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                -2.1%
              </span>
              from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Healthy
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Payment Gateway</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Operational
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Email Service</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">SMS Service</span>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <Clock className="h-3 w-3 mr-1" />
                Delayed
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pending Disputes</span>
              <Badge variant="destructive" className="bg-red-100 text-red-800">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {stats.pendingDisputes} Open
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activities and events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`mt-1 ${getStatusColor(activity.status)}`}>{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/activity">View All Activity</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold">Manage Users</h3>
                <p className="text-sm text-muted-foreground">View and manage user accounts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <div>
                <h3 className="font-semibold">Tournament Control</h3>
                <p className="text-sm text-muted-foreground">Monitor and manage tournaments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold">Payment Overview</h3>
                <p className="text-sm text-muted-foreground">Track payments and payouts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-muted-foreground">View detailed analytics</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
