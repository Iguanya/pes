"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Filter } from "lucide-react";

const mockMessages = [
  { id: 1, user: "john.doe@email.com", subject: "Account Issue", status: "Unread", date: "2024-06-01" },
  { id: 2, user: "jane.smith@email.com", subject: "Tournament Inquiry", status: "Read", date: "2024-06-02" },
  { id: 3, user: "pro.gamer@email.com", subject: "Payment Delay", status: "Unread", date: "2024-06-03" },
];

export default function AdminMessages() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredMessages = mockMessages.filter((m) => {
    return (
      (!search || m.user.toLowerCase().includes(search.toLowerCase()) || m.subject.toLowerCase().includes(search.toLowerCase())) &&
      (!statusFilter || m.status === statusFilter)
    );
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Messages</CardTitle>
          <CardDescription>View and respond to messages sent by users.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
            <Input
              placeholder="Search by user or subject..."
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
              <option value="Unread">Unread</option>
              <option value="Read">Read</option>
            </select>
            <Button variant="outline" className="flex items-center space-x-2 mt-2 md:mt-0">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Subject</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{m.id}</td>
                    <td className="px-4 py-2">{m.user}</td>
                    <td className="px-4 py-2">{m.subject}</td>
                    <td className="px-4 py-2">{m.status}</td>
                    <td className="px-4 py-2">{m.date}</td>
                    <td className="px-4 py-2">
                      <Button size="sm" variant="outline">View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}