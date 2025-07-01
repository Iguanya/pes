"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, Users, Trophy, DollarSign, Download, ArrowUpRight, ArrowDownRight } from "lucide-react"

interface AnalyticsData {
  userGrowth: { month: string; users: number; active: number }[]
  tournamentStats: { month: string; tournaments: number; participants: number }[]
  revenueData: { month: string; revenue: number; fees: number }[]
  topPerformers: { name: string; earnings: number; tournaments: number; winRate: number }[]
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("6months")

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    try {
      // Mock data - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockData: AnalyticsData = {
        userGrowth: [
          { month: "Jul", users: 1200, active: 800 },
          { month: "Aug", users: 1450, active: 950 },
          { month: "Sep", users: 1800, active: 1200 },
          { month: "Oct", users: 2200, active: 1500 },
          { month: "Nov", users: 2800, active: 1900 },
          { month: "Dec", users: 3400, active: 2300 },
        ],
        tournamentStats: [
          { month: "Jul", tournaments: 25, participants: 450 },
          { month: "Aug", tournaments: 32, participants: 580 },
          { month: "Sep", tournaments: 28, participants: 520 },
          { month: "Oct", tournaments: 35, participants: 650 },
          { month: "Nov", tournaments: 42, participants: 780 },
          { month: "Dec", tournaments: 38, participants: 720 },
        ],
        revenueData: [
          { month: "Jul", revenue: 125000, fees: 12500 },
          { month: "Aug", revenue: 158000, fees: 15800 },
          { month: "Sep", revenue: 142000, fees: 14200 },
          { month: "Oct", revenue: 185000, fees: 18500 },
          { month: "Nov", revenue: 220000, fees: 22000 },
          { month: "Dec", revenue: 195000, fees: 19500 },
        ],
        topPerformers: [
          { name: "John Kamau", earnings: 45000, tournaments: 28, winRate: 78 },
          { name: "Mary Wanjiku", earnings: 38000, tournaments: 22, winRate: 72 },
          { name: "David Ochieng", earnings: 32000, tournaments: 35, winRate: 65 },
          { name: "Sarah Muthoni", earnings: 28000, tournaments: 18, winRate: 81 },
        ],
      }

      setData(mockData)
    } catch (error) {
      console.error("Failed to load analytics data:", error)
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

  if (!data) {
    return <div>Failed to load analytics data</div>
  }

  const currentMonth = data.userGrowth[data.userGrowth.length - 1]
  const previousMonth = data.userGrowth[data.userGrowth.length - 2]
  const userGrowthRate = ((currentMonth.users - previousMonth.users) / previousMonth.users) * 100

  const currentRevenue = data.revenueData[data.revenueData.length - 1]
  const previousRevenue = data.revenueData[data.revenueData.length - 2]
  const revenueGrowthRate = ((currentRevenue.revenue - previousRevenue.revenue) / previousRevenue.revenue) * 100

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics Dashboard" description="Comprehensive platform analytics and insights">
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
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
            <div className="text-2xl font-bold">{currentMonth.users.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`flex items-center ${userGrowthRate > 0 ? "text-green-600" : "text-red-600"}`}>
                {userGrowthRate > 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {Math.abs(userGrowthRate).toFixed(1)}%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMonth.active.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((currentMonth.active / currentMonth.users) * 100).toFixed(1)}% of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh {(currentRevenue.revenue / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">
              <span className={`flex items-center ${revenueGrowthRate > 0 ? "text-green-600" : "text-red-600"}`}>
                {revenueGrowthRate > 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {Math.abs(revenueGrowthRate).toFixed(1)}%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tournaments</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.tournamentStats[data.tournamentStats.length - 1].tournaments}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Total and active users over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-lg font-semibold">User Growth Chart</p>
                <p className="text-sm text-muted-foreground">Chart visualization coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
            <CardDescription>Revenue and fees breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-lg font-semibold">Revenue Chart</p>
                <p className="text-sm text-muted-foreground">Chart visualization coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>Highest earning players this period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topPerformers.map((performer, index) => (
              <div key={performer.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{performer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {performer.tournaments} tournaments • {performer.winRate}% win rate
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">KSh {performer.earnings.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total earnings</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tournament Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Tournament Analytics</CardTitle>
          <CardDescription>Tournament participation and engagement metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
              <p className="text-lg font-semibold">Tournament Analytics</p>
              <p className="text-sm text-muted-foreground">Detailed tournament metrics coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
