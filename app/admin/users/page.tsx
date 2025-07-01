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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MoreHorizontal, UserPlus, Filter, Eye, Ban, Mail, Shield } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"

interface User {
  id: number
  name: string
  email: string
  phone: string
  gamertag: string
  role: "player" | "organizer" | "admin"
  status: "active" | "suspended" | "banned"
  created_at: string
  last_login: string
  tournaments_joined: number
  total_earnings: number
  win_rate: number
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      // Mock data - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockUsers: User[] = [
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
        {
          id: 2,
          name: "Mary Wanjiku",
          email: "mary.wanjiku@email.com",
          phone: "+254723456789",
          gamertag: "MaryGamer",
          role: "organizer",
          status: "active",
          created_at: "2024-01-10T08:00:00Z",
          last_login: "2024-01-20T16:45:00Z",
          tournaments_joined: 8,
          total_earnings: 45000,
          win_rate: 75,
        },
        {
          id: 3,
          name: "David Ochieng",
          email: "david.ochieng@email.com",
          phone: "+254734567890",
          gamertag: "DavidPro",
          role: "player",
          status: "suspended",
          created_at: "2024-01-05T12:00:00Z",
          last_login: "2024-01-18T10:20:00Z",
          tournaments_joined: 22,
          total_earnings: 18500,
          win_rate: 45,
        },
      ]

      setUsers(mockUsers)
    } catch (error) {
      console.error("Failed to load users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.gamertag.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: User["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "suspended":
        return <Badge className="bg-yellow-100 text-yellow-800">Suspended</Badge>
      case "banned":
        return <Badge className="bg-red-100 text-red-800">Banned</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRoleBadge = (role: User["role"]) => {
    switch (role) {
      case "admin":
        return <Badge variant="destructive">Admin</Badge>
      case "organizer":
        return <Badge variant="default">Organizer</Badge>
      case "player":
        return <Badge variant="secondary">Player</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
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
      <PageHeader title="User Management" description="Manage user accounts, roles, and permissions">
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </PageHeader>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>View and manage all platform users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or gamertag..."
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

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tournaments</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Win Rate</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`/avatars/${user.id}.jpg`} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          <div className="text-xs text-muted-foreground">@{user.gamertag}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{user.tournaments_joined}</TableCell>
                    <TableCell>{formatCurrency(user.total_earnings)}</TableCell>
                    <TableCell>{user.win_rate}%</TableCell>
                    <TableCell>{formatDate(user.last_login)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Shield className="mr-2 h-4 w-4" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend User
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

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Detailed information about the selected user</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`/avatars/${selectedUser.id}.jpg`} alt={selectedUser.name} />
                  <AvatarFallback className="text-lg">{selectedUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {getRoleBadge(selectedUser.role)}
                    {getStatusBadge(selectedUser.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Account Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Gamertag:</span> @{selectedUser.gamertag}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone:</span> {selectedUser.phone}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Joined:</span> {formatDate(selectedUser.created_at)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Login:</span> {formatDate(selectedUser.last_login)}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Gaming Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tournaments Joined:</span>{" "}
                      {selectedUser.tournaments_joined}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Earnings:</span>{" "}
                      {formatCurrency(selectedUser.total_earnings)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Win Rate:</span> {selectedUser.win_rate}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
                <Button variant="outline">
                  <Shield className="mr-2 h-4 w-4" />
                  Change Role
                </Button>
                <Button variant="destructive">
                  <Ban className="mr-2 h-4 w-4" />
                  Suspend User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
