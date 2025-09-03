"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DollarSign, Filter } from "lucide-react";

const mockPayments = [
  { id: 1, user: "john.doe@email.com", amount: 1500, method: "M-Pesa", status: "Completed", date: "2024-06-01" },
  { id: 2, user: "jane.smith@email.com", amount: 2000, method: "Card", status: "Pending", date: "2024-06-02" },
  { id: 3, user: "pro.gamer@email.com", amount: 500, method: "M-Pesa", status: "Failed", date: "2024-06-03" },
  { id: 4, user: "admin@email.com", amount: 3000, method: "Bank", status: "Completed", date: "2024-06-04" },
];

export default function AdminPayments() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredPayments = mockPayments.filter((p) => {
    return (
      (!search || p.user.toLowerCase().includes(search.toLowerCase())) &&
      (!statusFilter || p.status === statusFilter)
    );
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payments Overview</CardTitle>
          <CardDescription>Track and manage all platform payments and payouts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <div className="font-semibold text-lg">KSh 7,000</div>
                <div className="text-xs text-muted-foreground">Total Payments</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div>
                <div className="font-semibold text-lg">KSh 2,000</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <DollarSign className="h-8 w-8 text-red-600" />
              <div>
                <div className="font-semibold text-lg">KSh 500</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
            <Input
              placeholder="Search by user email..."
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
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
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
                  <Th>Amount</Th>
                  <Th>Method</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredPayments.map((p) => (
                  <Tr key={p.id}>
                    <Td>{p.id}</Td>
                    <Td>{p.user}</Td>
                    <Td>KSh {p.amount}</Td>
                    <Td>{p.method}</Td>
                    <Td>{p.status}</Td>
                    <Td>{p.date}</Td>
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