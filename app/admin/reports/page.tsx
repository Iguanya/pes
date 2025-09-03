"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, Filter } from "lucide-react";

const mockReports = [
  { id: 1, type: "User Activity", created: "2024-06-01", status: "Ready" },
  { id: 2, type: "Payments", created: "2024-06-02", status: "Processing" },
  { id: 3, type: "Tournaments", created: "2024-06-03", status: "Ready" },
];

export default function AdminReports() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredReports = mockReports.filter((r) => {
    return (
      (!search || r.type.toLowerCase().includes(search.toLowerCase())) &&
      (!statusFilter || r.status === statusFilter)
    );
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>Generate and download platform reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <div className="font-semibold text-lg">3</div>
                <div className="text-xs text-muted-foreground">Total Reports</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-green-600" />
              <div>
                <div className="font-semibold text-lg">2</div>
                <div className="text-xs text-muted-foreground">Ready</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-yellow-600" />
              <div>
                <div className="font-semibold text-lg">1</div>
                <div className="text-xs text-muted-foreground">Processing</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
            <Input
              placeholder="Search by report type..."
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
              <option value="Ready">Ready</option>
              <option value="Processing">Processing</option>
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
                  <Th>Type</Th>
                  <Th>Created</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredReports.map((r) => (
                  <Tr key={r.id}>
                    <Td>{r.id}</Td>
                    <Td>{r.type}</Td>
                    <Td>{r.created}</Td>
                    <Td>{r.status}</Td>
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