"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Pencil } from "lucide-react";

const mockTemplates = [
  { id: 1, name: "Welcome Email", subject: "Welcome to PES!", updated: "2024-06-01" },
  { id: 2, name: "Password Reset", subject: "Reset your password", updated: "2024-06-02" },
  { id: 3, name: "Tournament Reminder", subject: "Upcoming Tournament", updated: "2024-06-03" },
];

export default function AdminEmailTemplates() {
  const [search, setSearch] = useState("");

  const filteredTemplates = mockTemplates.filter((t) => {
    return !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>Manage and edit email templates sent to users.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
            <Input
              placeholder="Search by name or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-2 md:mb-0"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Subject</th>
                  <th className="px-4 py-2">Last Updated</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTemplates.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{t.id}</td>
                    <td className="px-4 py-2">{t.name}</td>
                    <td className="px-4 py-2">{t.subject}</td>
                    <td className="px-4 py-2">{t.updated}</td>
                    <td className="px-4 py-2">
                      <Button size="sm" variant="outline">
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </Button>
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