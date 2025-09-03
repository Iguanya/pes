"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/ui/table";
import { Database } from "lucide-react";

const mockTables = [
  { name: "Users", rows: 5247, status: "Healthy" },
  { name: "Tournaments", rows: 342, status: "Healthy" },
  { name: "Payments", rows: 1200, status: "Healthy" },
  { name: "Disputes", rows: 15, status: "Warning" },
];

const mockChanges = [
  { id: 1, table: "Users", action: "INSERT", user: "admin", date: "2024-06-01" },
  { id: 2, table: "Payments", action: "UPDATE", user: "john.doe", date: "2024-06-02" },
  { id: 3, table: "Disputes", action: "DELETE", user: "admin", date: "2024-06-03" },
];

export default function AdminDatabase() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Database Overview</CardTitle>
          <CardDescription>Monitor database tables and recent changes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {mockTables.map((t) => (
              <div key={t.name} className="flex items-center space-x-3">
                <Database className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="font-semibold text-lg">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.rows} rows</div>
                  <div className={`text-xs ${t.status === "Healthy" ? "text-green-600" : "text-yellow-600"}`}>{t.status}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <Table>
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Table</Th>
                  <Th>Action</Th>
                  <Th>User</Th>
                  <Th>Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                {mockChanges.map((c) => (
                  <Tr key={c.id}>
                    <Td>{c.id}</Td>
                    <Td>{c.table}</Td>
                    <Td>{c.action}</Td>
                    <Td>{c.user}</Td>
                    <Td>{c.date}</Td>
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