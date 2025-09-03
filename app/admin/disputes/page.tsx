"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Eye, Gavel, CheckCircle, XCircle, Search, MoreHorizontal } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Dispute {
  id: number
  tournament_id: number
  tournament_name: string
  match_id: number
  raised_by_id: number
  raised_by_name: string
  opponent_id: number
  opponent_name: string
  reason: string
  evidence_urls: string[]
  status: "open" | "in_review" | "resolved" | "rejected"
  created_at: string
  updated_at: string
}

export default function DisputesManagement() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)

  useEffect(() => {
    loadDisputes()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => loadDisputes(controller.signal), 300)
    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [searchTerm, statusFilter])

  const loadDisputes = async (signal?: AbortSignal) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.set("search", searchTerm)
      if (statusFilter !== "all") params.set("status", statusFilter)
      const res = await fetch(`/api/admin/disputes?${params.toString()}`, { signal })
      const json = await res.json()
      if (json.success) setDisputes(json.data)
      else setDisputes([])
    } catch (error) {
      console.error("Failed to load disputes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisputeAction = async (
    disputeId: number,
    action: "resolve" | "reject" | "review",
    resolution?: { note?: string },
  ) => {
    try {
      await fetch("/api/admin/disputes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disputeId, action, resolution }),
      })

      setDisputes((prev) =>
        prev.map((d) => {
          if (d.id !== disputeId) return d
          if (action === "resolve") return { ...d, status: "resolved" }
          if (action === "reject") return { ...d, status: "rejected" }
          return { ...d, status: "in_review" }
        }),
      )
    } catch (error) {
      console.error("Failed to update dispute:", error)
    }
  }

  const getStatusBadge = (status: Dispute["status"]) => {
    switch (status) {
      case "open":
        return <Badge className="bg-yellow-100 text-yellow-800">Open</Badge>
      case "in_review":
        return <Badge className="bg-blue-100 text-blue-800">In Review</Badge>
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
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

  const filtered = disputes

  return (
    <div className="space-y-6">
      <PageHeader title="Disputes Management" description="Review and resolve match disputes">
        <Button variant="outline">
          <AlertTriangle className="mr-2 h-4 w-4" />
          View Policies
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Disputes</CardTitle>
          <CardDescription>Investigate and act on raised disputes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by tournament, player, or reason..."
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
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tournament</TableHead>
                  <TableHead>Players</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>#{d.id}</TableCell>
                    <TableCell>{d.tournament_name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{d.raised_by_name}</div>
                        <div className="text-muted-foreground">vs {d.opponent_name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">{d.reason}</TableCell>
                    <TableCell>{getStatusBadge(d.status)}</TableCell>
                    <TableCell>{formatDate(d.created_at)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setSelectedDispute(d)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDisputeAction(d.id, "review")}>
                            <Gavel className="mr-2 h-4 w-4" />
                            Move to Review
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDisputeAction(d.id, "resolve") }>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Resolve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDisputeAction(d.id, "reject") } className="text-red-600">
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
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

      <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Dispute Details</DialogTitle>
            <DialogDescription>Review information and evidence</DialogDescription>
          </DialogHeader>
          {selectedDispute && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tournament:</span> {selectedDispute.tournament_name}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Match ID:</span> #{selectedDispute.match_id}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Players:</span> {selectedDispute.raised_by_name} vs {selectedDispute.opponent_name}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reason:</span> {selectedDispute.reason}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span> {getStatusBadge(selectedDispute.status)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created:</span> {formatDate(selectedDispute.created_at)}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Evidence</h3>
                  <div className="space-y-2">
                    {selectedDispute.evidence_urls?.length ? (
                      selectedDispute.evidence_urls.map((url) => (
                        <div key={url} className="text-sm text-blue-600 underline cursor-pointer">{url}</div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">No evidence provided</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={() => handleDisputeAction(selectedDispute.id, "review")}>
                  <Gavel className="mr-2 h-4 w-4" />
                  Move to Review
                </Button>
                <Button onClick={() => handleDisputeAction(selectedDispute.id, "resolve")}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Resolve
                </Button>
                <Button variant="destructive" onClick={() => handleDisputeAction(selectedDispute.id, "reject")}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Filter } from "lucide-react";

const mockDisputes = [
  { id: 1, user: "john.doe@email.com", tournament: "Champions Cup", reason: "Score dispute", status: "Open", date: "2024-06-01" },
  { id: 2, user: "jane.smith@email.com", tournament: "Weekend Warriors", reason: "Cheating", status: "Resolved", date: "2024-06-02" },
  { id: 3, user: "pro.gamer@email.com", tournament: "Pro League", reason: "Late result", status: "Pending", date: "2024-06-03" },
];

export default function AdminDisputes() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredDisputes = mockDisputes.filter((d) => {
    return (
      (!search || d.user.toLowerCase().includes(search.toLowerCase()) || d.tournament.toLowerCase().includes(search.toLowerCase())) &&
      (!statusFilter || d.status === statusFilter)
    );
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Disputes Management</CardTitle>
          <CardDescription>Review and resolve match disputes raised by users.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div>
                <div className="font-semibold text-lg">3</div>
                <div className="text-xs text-muted-foreground">Total Disputes</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8 text-green-600" />
              <div>
                <div className="font-semibold text-lg">1</div>
                <div className="text-xs text-muted-foreground">Resolved</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <div className="font-semibold text-lg">2</div>
                <div className="text-xs text-muted-foreground">Open/Pending</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
            <Input
              placeholder="Search by user or tournament..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-2 md:mb-0"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
            </select>
            <Button variant="outline" className="flex items-center space-x-2 mt-2 md:mt-0">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>User</Th>
                  <Th>Tournament</Th>
                  <Th>Reason</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredDisputes.map((d) => (
                  <Tr key={d.id}>
                    <Td>{d.id}</Td>
                    <Td>{d.user}</Td>
                    <Td>{d.tournament}</Td>
                    <Td>{d.reason}</Td>
                    <Td>{d.status}</Td>
                    <Td>{d.date}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}