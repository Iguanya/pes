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