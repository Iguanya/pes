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
import { Search, MoreHorizontal, Trophy, Filter, Eye, Edit, Trash2, Play, Pause, Square, Settings, Users, Calendar, DollarSign } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
interface Tournament {
  id: number
  name: string
  description?: string
  organizer: string
  organizer_id: number
  format: string
  status: "draft" | "registration" | "ongoing" | "completed" | "cancelled"
  participants: number
  max_participants: number
  entry_fee: number
  prize_pool: number
  start_date: string
  end_date?: string
  registration_deadline?: string
  created_at: string
  rules?: string
  require_screenshots?: boolean
  allow_disputes?: boolean
}

export default function TournamentsManagement() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)

  useEffect(() => {
    loadTournaments()
  }, [])

  useEffect(() => {
    // refetch when filters change
    const controller = new AbortController()
    const timeout = setTimeout(() => {
      loadTournaments(controller.signal)
    }, 300)
    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [searchTerm, statusFilter])

  const loadTournaments = async (signal?: AbortSignal) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.set("search", searchTerm)
      if (statusFilter !== "all") params.set("status", statusFilter)
      const res = await fetch(`/api/admin/tournaments?${params.toString()}`, { signal })
      const json = await res.json()
      if (json.success) {
        setTournaments(json.data)
      } else {
        setTournaments([])
      }
    } catch (error) {
      console.error("Failed to load tournaments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTournaments = tournaments.filter((tournament) => {
    const matchesSearch = 
      tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournament.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tournament.description && tournament.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === "all" || tournament.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleTournamentAction = async (tournamentId: number, action: string) => {
    try {
      await fetch("/api/admin/tournaments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId, action }),
      })
      
      // Update local state
      setTournaments(prev => prev.map(t => {
        if (t.id === tournamentId) {
          switch (action) {
            case "start":
              return { ...t, status: "ongoing" as const }
            case "pause":
              return { ...t, status: "registration" as const }
            case "complete":
              return { ...t, status: "completed" as const, end_date: new Date().toISOString() }
            case "cancel":
              return { ...t, status: "cancelled" as const }
            default:
              return t
          }
        }
        return t
      }))
    } catch (error) {
      console.error(`Failed to ${action} tournament:`, error)
    }
  }

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
        <Button >
          <Link href="/tournaments/create">
           <Trophy className="mr-2 h-4 w-4" />
          Create Tournament
          </Link>
         
        </Button>
      </PageHeader>

      {/* Tournament Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{tournaments.length}</p>
                <p className="text-sm text-muted-foreground">Total Tournaments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {tournaments.reduce((sum, t) => sum + t.participants, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Players</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(tournaments.reduce((sum, t) => sum + t.prize_pool, 0))}
                </p>
                <p className="text-sm text-muted-foreground">Total Prize Pool</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {tournaments.filter((t) => t.status === "ongoing").length}
                </p>
                <p className="text-sm text-muted-foreground">Active Tournaments</p>
              </div>
            </div>
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
                placeholder="Search tournaments by name, organizer, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="registration">Registration</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tournament</TableHead>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Entry Fee</TableHead>
                  <TableHead>Prize Pool</TableHead>
                  <TableHead>Status</TableHead>
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
                        <div className="text-sm text-muted-foreground">{tournament.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>{tournament.organizer}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{tournament.format}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{tournament.participants}/{tournament.max_participants}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(tournament.participants / tournament.max_participants) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(tournament.entry_fee)}</TableCell>
                    <TableCell>{formatCurrency(tournament.prize_pool)}</TableCell>
                    <TableCell>{getStatusBadge(tournament.status)}</TableCell>
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
                          <DropdownMenuItem onClick={() => setSelectedTournament(tournament)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Tournament
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {tournament.status === "registration" && (
                            <DropdownMenuItem onClick={() => handleTournamentAction(tournament.id, "start")}>
                              <Play className="mr-2 h-4 w-4" />
                              Start Tournament
                            </DropdownMenuItem>
                          )}
                          {tournament.status === "ongoing" && (
                            <>
                              <DropdownMenuItem onClick={() => handleTournamentAction(tournament.id, "pause")}>
                                <Pause className="mr-2 h-4 w-4" />
                                Pause Tournament
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleTournamentAction(tournament.id, "complete")}>
                                <Square className="mr-2 h-4 w-4" />
                                Complete Tournament
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            Tournament Settings
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleTournamentAction(tournament.id, "cancel")}
                          >
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

      {/* Tournament Details Dialog */}
      <Dialog open={!!selectedTournament} onOpenChange={() => setSelectedTournament(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Tournament Details</DialogTitle>
            <DialogDescription>Detailed information about the selected tournament</DialogDescription>
          </DialogHeader>
          {selectedTournament && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Name:</span>
                      <p className="text-sm">{selectedTournament.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Description:</span>
                      <p className="text-sm">{selectedTournament.description}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Organizer:</span>
                      <p className="text-sm">{selectedTournament.organizer}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Format:</span>
                      <Badge variant="outline" className="ml-2">{selectedTournament.format}</Badge>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Status:</span>
                      <span className="ml-2">{getStatusBadge(selectedTournament.status)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Tournament Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Players:</span>
                      <p className="text-sm">{selectedTournament.participants}/{selectedTournament.max_participants}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Entry Fee:</span>
                      <p className="text-sm">{formatCurrency(selectedTournament.entry_fee)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Prize Pool:</span>
                      <p className="text-sm">{formatCurrency(selectedTournament.prize_pool)}</p>
                    </div>
                    {selectedTournament.registration_deadline && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Registration Deadline:</span>
                        <p className="text-sm">{formatDate(selectedTournament.registration_deadline)}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Start Date:</span>
                      <p className="text-sm">{formatDate(selectedTournament.start_date)}</p>
                    </div>
                    {selectedTournament.end_date && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">End Date:</span>
                        <p className="text-sm">{formatDate(selectedTournament.end_date)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Tournament Rules & Settings</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Rules:</span>
                    <p className="text-sm mt-1">{selectedTournament.rules}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-muted-foreground">Screenshots Required:</span>
                      <Badge variant={selectedTournament.require_screenshots ? "default" : "secondary"}>
                        {selectedTournament.require_screenshots ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-muted-foreground">Disputes Allowed:</span>
                      <Badge variant={selectedTournament.allow_disputes ? "default" : "secondary"}>
                        {selectedTournament.allow_disputes ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Tournament
                </Button>
                <Button variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  View Participants
                </Button>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Tournament Settings
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
