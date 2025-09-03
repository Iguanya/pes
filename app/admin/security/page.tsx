"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/ui/table";
import { Shield, AlertTriangle } from "lucide-react";

const mockSettings = [
  { name: "2FA Enabled", value: "Yes" },
  { name: "Session Timeout", value: "30 min" },
  { name: "Max Login Attempts", value: "5" },
  { name: "Email Verification", value: "Required" },
];

const mockEvents = [
  { id: 1, event: "Failed Login", user: "john.doe", date: "2024-06-01", status: "Warning" },
  { id: 2, event: "Password Changed", user: "admin", date: "2024-06-02", status: "Success" },
  { id: 3, event: "2FA Enabled", user: "jane.smith", date: "2024-06-03", status: "Success" },
];

export default function AdminSecurity() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Security Overview</CardTitle>
          <CardDescription>Review security settings and recent security events.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {mockSettings.map((s) => (
              <div key={s.name} className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-green-600" />
                <div>
                  <div className="font-semibold text-lg">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.value}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <Table>
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Event</Th>
                  <Th>User</Th>
                  <Th>Date</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {mockEvents.map((e) => (
                  <Tr key={e.id}>
                    <Td>{e.id}</Td>
                    <Td>{e.event}</Td>
                    <Td>{e.user}</Td>
                    <Td>{e.date}</Td>
                    <Td>
                      {e.status === "Warning" ? (
                        <span className="text-yellow-600 flex items-center"><AlertTriangle className="h-4 w-4 mr-1" /> Warning</span>
                      ) : (
                        <span className="text-green-600">Success</span>
                      )}
                    </Td>
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