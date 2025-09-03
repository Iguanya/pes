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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DollarSign, 
  Search, 
  MoreHorizontal, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Smartphone,
  Banknote,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"

interface Payment {
  id: number
  user_id: number
  user_name: string
  user_email: string
  tournament_id?: number
  tournament_name?: string
  type: "entry_fee" | "prize_payout" | "refund" | "withdrawal"
  amount: number
  currency: string
  status: "pending" | "completed" | "failed" | "cancelled" | "processing"
  payment_method: "mpesa" | "bank_transfer" | "card" | "wallet"
  mpesa_transaction_id?: string
  mpesa_receipt_number?: string
  phone_number?: string
  reference?: string
  description?: string
  processed_at?: string
  created_at: string
  updated_at: string
}

interface PaymentStats {
  totalRevenue: number
  totalPayouts: number
  pendingPayments: number
  failedPayments: number
  monthlyRevenue: number
  monthlyPayouts: number
  revenueGrowth: number
  payoutGrowth: number
}

export default function PaymentsManagement() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  useEffect(() => {
    loadPayments()
    loadStats()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => {
      loadPayments(controller.signal)
    }, 300)
    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [searchTerm, statusFilter, typeFilter])

  const loadPayments = async (signal?: AbortSignal) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.set("search", searchTerm)
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (typeFilter !== "all") params.set("type", typeFilter)
      const res = await fetch(`/api/admin/payments?${params.toString()}`, { signal })
      const json = await res.json()
      if (json.success) {
        setPayments(json.data)
      } else {
        setPayments([])
      }
    } catch (error) {
      console.error("Failed to load payments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Mock stats - replace with actual API call
      setStats({
        totalRevenue: 125000,
        totalPayouts: 45000,
        pendingPayments: 3,
        failedPayments: 1,
        monthlyRevenue: 85000,
        monthlyPayouts: 32000,
        revenueGrowth: 15.3,
        payoutGrowth: 8.7,
      })
    } catch (error) {
      console.error("Failed to load payment stats:", error)
    }
  }

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = 
      payment.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.tournament_name && payment.tournament_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      payment.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    const matchesType = typeFilter === "all" || payment.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeBadge = (type: Payment["type"]) => {
    switch (type) {
      case "entry_fee":
        return <Badge variant="default">Entry Fee</Badge>
      case "prize_payout":
        return <Badge className="bg-green-100 text-green-800">Prize Payout</Badge>
      case "refund":
        return <Badge className="bg-orange-100 text-orange-800">Refund</Badge>
      case "withdrawal":
        return <Badge className="bg-purple-100 text-purple-800">Withdrawal</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getPaymentMethodIcon = (method: Payment["payment_method"]) => {
    switch (method) {
      case "mpesa":
        return <Smartphone className="h-4 w-4 text-green-600" />
      case "bank_transfer":
        return <Banknote className="h-4 w-4 text-blue-600" />
      case "card":
        return <CreditCard className="h-4 w-4 text-purple-600" />
      case "wallet":
        return <DollarSign className="h-4 w-4 text-orange-600" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const handlePaymentAction = async (paymentId: number, action: string) => {
    try {
      await fetch("/api/admin/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, action }),
      })
      
      // Update local state
      setPayments(prev => prev.map(p => {
        if (p.id === paymentId) {
          switch (action) {
            case "approve":
              return { ...p, status: "completed" as const, processed_at: new Date().toISOString() }
            case "reject":
              return { ...p, status: "failed" as const }
            case "retry":
              return { ...p, status: "processing" as const }
            default:
              return p
          }
        }
        return p
      }))
    } catch (error) {
      console.error(`Failed to ${action} payment:`, error)
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
      <PageHeader title="Payments Management" description="Monitor transactions, process payouts, and manage payment issues">
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button>
            <DollarSign className="mr-2 h-4 w-4" />
            Process Payouts
          </Button>
        </div>
      </PageHeader>

      {/* Payment Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-xs text-green-600 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +{stats.revenueGrowth}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalPayouts)}</p>
                  <p className="text-sm text-muted-foreground">Total Payouts</p>
                  <p className="text-xs text-blue-600 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +{stats.payoutGrowth}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.pendingPayments}</p>
                  <p className="text-sm text-muted-foreground">Pending Payments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.failedPayments}</p>
                  <p className="text-sm text-muted-foreground">Failed Payments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
          <CardDescription>View and manage all payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, tournament, or reference..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="entry_fee">Entry Fee</SelectItem>
                <SelectItem value="prize_payout">Prize Payout</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
                <SelectItem value="withdrawal">Withdrawal</SelectItem>
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
                  <TableHead>Transaction</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.reference}</div>
                        <div className="text-sm text-muted-foreground">{payment.description}</div>
                        {payment.tournament_name && (
                          <div className="text-xs text-muted-foreground">{payment.tournament_name}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.user_name}</div>
                        <div className="text-sm text-muted-foreground">{payment.user_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(payment.type)}</TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {payment.type === "prize_payout" || payment.type === "withdrawal" ? "-" : "+"}
                        {formatCurrency(payment.amount)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getPaymentMethodIcon(payment.payment_method)}
                        <span className="capitalize">{payment.payment_method}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{formatDate(payment.created_at)}</div>
                        {payment.processed_at && (
                          <div className="text-xs text-muted-foreground">
                            Processed: {formatDate(payment.processed_at)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setSelectedPayment(payment)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {payment.status === "pending" && (
                            <>
                              <DropdownMenuItem onClick={() => handlePaymentAction(payment.id, "approve")}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve Payment
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePaymentAction(payment.id, "reject")}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject Payment
                              </DropdownMenuItem>
                            </>
                          )}
                          {payment.status === "failed" && (
                            <DropdownMenuItem onClick={() => handlePaymentAction(payment.id, "retry")}>
                              <Clock className="mr-2 h-4 w-4" />
                              Retry Payment
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download Receipt
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

      {/* Payment Details Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>Detailed information about the selected payment</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Transaction Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Reference:</span>
                      <p className="text-sm">{selectedPayment.reference}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Type:</span>
                      <span className="ml-2">{getTypeBadge(selectedPayment.type)}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Amount:</span>
                      <p className="text-sm font-medium">
                        {selectedPayment.type === "prize_payout" || selectedPayment.type === "withdrawal" ? "-" : "+"}
                        {formatCurrency(selectedPayment.amount)} {selectedPayment.currency}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Status:</span>
                      <span className="ml-2">{getStatusBadge(selectedPayment.status)}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Payment Method:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        {getPaymentMethodIcon(selectedPayment.payment_method)}
                        <span className="capitalize">{selectedPayment.payment_method}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Description:</span>
                      <p className="text-sm">{selectedPayment.description}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">User & Tournament Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">User:</span>
                      <p className="text-sm">{selectedPayment.user_name}</p>
                      <p className="text-sm text-muted-foreground">{selectedPayment.user_email}</p>
                    </div>
                    {selectedPayment.tournament_name && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Tournament:</span>
                        <p className="text-sm">{selectedPayment.tournament_name}</p>
                      </div>
                    )}
                    {selectedPayment.phone_number && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Phone:</span>
                        <p className="text-sm">{selectedPayment.phone_number}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Created:</span>
                      <p className="text-sm">{formatDate(selectedPayment.created_at)}</p>
                    </div>
                    {selectedPayment.processed_at && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Processed:</span>
                        <p className="text-sm">{formatDate(selectedPayment.processed_at)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedPayment.mpesa_transaction_id && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">M-Pesa Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Transaction ID:</span>
                      <p className="text-sm font-mono">{selectedPayment.mpesa_transaction_id}</p>
                    </div>
                    {selectedPayment.mpesa_receipt_number && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Receipt Number:</span>
                        <p className="text-sm font-mono">{selectedPayment.mpesa_receipt_number}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                {selectedPayment.status === "pending" && (
                  <>
                    <Button onClick={() => handlePaymentAction(selectedPayment.id, "approve")}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve Payment
                    </Button>
                    <Button variant="destructive" onClick={() => handlePaymentAction(selectedPayment.id, "reject")}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject Payment
                    </Button>
                  </>
                )}
                {selectedPayment.status === "failed" && (
                  <Button onClick={() => handlePaymentAction(selectedPayment.id, "retry")}>
                    <Clock className="mr-2 h-4 w-4" />
                    Retry Payment
                  </Button>
                )}
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}