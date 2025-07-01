"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Trophy, Filter, Eye, Edit, Trash2, Play, Pause } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"

interface Tournament {
  id: number
  name: string
  organizer: string
  format: string
  status: "draft" | "registration" | "ongoing" | "completed" | "cancelled"
  participants: number
  max_participants: number
  entry_fee: number
  prize_pool: number
  start_date: string
  created_at: string
}

export default function TournamentsManagement() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadTournaments()
  }, [])

  const loadTournaments = async () => {
    try {
      // Mock data - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockTournaments: Tournament[] = [
        {
          id: 1,
          name: "Weekend Warriors Cup",
          organizer: "ProGamer",
          format: "Single Elimination",
          status: "ongoing",
          participants: 14,
          max_participants: 16,
          entry_fee: 500,
          prize_pool: 8000,
          start_date: "2024-01-20T10:00:00Z",
          created_at: "2024-01-15T08:00:00Z",
        },
        {
          id: 2,
          name: "Champions League",
          organizer: "EliteGaming",
          format: "Double Elimination",
          status: "registration",
          participants: 28,
          max_participants: 32,
          entry_fee: 1000,
          prize_pool: 32000,
          start_date: "2024-01-25T14:00:00Z",
          created_at: "2024-01-18T12:00:00Z",
        },
        {
          id: 3,
          name: "Monthly Masters",
          organizer: "TournamentPro",
          format: "Swiss System",
          status: "completed",
          participants: 64,
          max_participants: 64,
          entry_fee: 2000,
          prize_pool: 128000,
          start_date: "2024-01-10T12:00:00Z",
          created_at: "2024-01-05T10:00:00Z",
        },
      ]

      setTournaments(mockTournaments)
    } catch (error) {
      console.error("Failed to load tournaments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTournaments = tournaments.filter(
    (tournament) =>
      tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournament.organizer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: Tournament["status"]) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>
      case "registration":
        return <Badge className="bg-blue-100 text-blue-800">Registration</Badge>
      case "ongoing":
        return <Badge className="bg-green-100 text-green-800">Ongoing</Badge>
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Tournament Management" description="Monitor and manage all tournaments on the platform">
        <Button>
          <Trophy className="mr-2 h-4 w-4" />
          Create Tournament
        </Button>
      </PageHeader>

      {/* Tournament Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tournaments</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tournaments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tournaments</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tournaments.filter((t) => t.status === "ongoing" || t.status === "registration").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prize Pool</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(tournaments.reduce((sum, t) => sum + t.prize_pool, 0))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tournaments.reduce((sum, t) => sum + t.participants, 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tournaments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tournaments</CardTitle>
          <CardDescription>View and manage all platform tournaments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tournaments by name or organizer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tournament</TableHead>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Prize Pool</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTournaments.map((tournament) => (
                  <TableRow key={tournament.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{tournament.name}</div>
                        <div className="text-sm text-muted-foreground">{tournament.format}</div>
                      </div>
                    </TableCell>
                    <TableCell>{tournament.organizer}</TableCell>
                    <TableCell>{getStatusBadge(tournament.status)}</TableCell>
                    <TableCell>
                      {tournament.participants}/{tournament.max_participants}
                    </TableCell>
                    <TableCell>{formatCurrency(tournament.prize_pool)}</TableCell>
                    <TableCell>{formatDate(tournament.start_date)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Tournament
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {tournament.status === "ongoing" ? (
                            <DropdownMenuItem>
                              <Pause className="mr-2 h-4 w-4" />
                              Pause Tournament
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem>
                              <Play className="mr-2 h-4 w-4" />
                              Start Tournament
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Cancel Tournament
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
