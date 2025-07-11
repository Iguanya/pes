"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Users, DollarSign, Calendar, Search, Filter } from "lucide-react"
import Link from "next/link"

type Tournament = {
  id: number
  name: string
  description: string
  format: string
  maxPlayers: number
  currentPlayers: number
  entryFee: number
  prizePool: number
  status: string
  startDate: string
  registrationDeadline: string
  organizer: string
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [formatFilter, setFormatFilter] = useState("all")

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await fetch("/api/tournaments")
        const json = await res.json()
        if (json.success) {
          setTournaments(json.data)
        }
      } catch (err) {
        console.error("Failed to load tournaments", err)
      }
    }
    fetchTournaments()
  }, [])

  const formatDisplayMap: Record<string, string> = {
    "knockout": "Single Elimination",
    "double-elimination": "Double Elimination",
    "round-robin": "Round Robin",
    "swiss": "Swiss System",
  }

  const statusDisplayMap: Record<string, string> = {
    "registration": "Registration Open",
    "ongoing": "Ongoing",
    "completed": "Completed",
    "cancelled": "Cancelled",
  }

  const filteredTournaments = tournaments.filter((tournament) => {
    const matchesSearch =
      tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournament.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === "all" ||
      tournament.status.toLowerCase().includes(statusFilter.toLowerCase())
    const matchesFormat =
      formatFilter === "all" ||
      formatDisplayMap[tournament.format]?.toLowerCase() === formatFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesFormat
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Registration Open":
        return "bg-green-100 text-green-800"
      case "Registration Closing Soon":
        return "bg-yellow-100 text-yellow-800"
      case "Ongoing":
        return "bg-blue-100 text-blue-800"
      case "Completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold">Tournaments</h1>
          </div>
          <Button asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Find Tournaments
            </CardTitle>
            <CardDescription>Search and filter tournaments to find the perfect competition</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tournaments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="registration">Registration Open</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={formatFilter} onValueChange={setFormatFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Formats</SelectItem>
                  <SelectItem value="Single Elimination">Single Elimination</SelectItem>
                  <SelectItem value="Double Elimination">Double Elimination</SelectItem>
                  <SelectItem value="Round Robin">Round Robin</SelectItem>
                  <SelectItem value="Swiss System">Swiss System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tournament Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => (
            <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{tournament.name}</CardTitle>
                    <CardDescription className="mt-1">{tournament.description}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(statusDisplayMap[tournament.status] || tournament.status)}>
                    {statusDisplayMap[tournament.status] || tournament.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>
                      {tournament.currentPlayers}/{tournament.maxPlayers}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-gray-500" />
                    <span>{formatDisplayMap[tournament.format]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span>
                    KSh {typeof tournament.entryFee === "number" ? tournament.entryFee.toLocaleString() : "0"}
                  </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{new Date(tournament.start_date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800">Prize Pool</span>
                    <span className="text-lg font-bold text-green-600">
                      KSh {typeof tournament.prize_pool === "number" ? tournament.prize_pool.toLocaleString() : "0"}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  <p>Organized by {tournament.organizer}</p>
                  <p>Registration closes: Registration closes: {new Date(tournament.registration_deadline).toLocaleString()}</p>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" asChild>
                    <Link href={`/tournaments/${tournament.id}/register`}>Register Now</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/tournaments/${tournament.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTournaments.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No tournaments found</h3>
              <p className="text-gray-500">
                Try adjusting your search criteria or check back later for new tournaments.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
