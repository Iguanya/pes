"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Trophy, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CreateTournamentPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    format: "",
    maxPlayers: "",
    entryFee: "",
    prizeDistribution: "winner-takes-all",
    startDate: "",
    registrationDeadline: "",
    rules: "",
    requireScreenshots: true,
    allowDisputes: true,
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-green-600" />
            <h1 className="text-xl font-bold">Create Tournament</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Tournament Details</CardTitle>
            <CardDescription>Set up your tournament with custom rules and prize distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="name">Tournament Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Weekend Warriors Cup"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your tournament..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="format">Tournament Format</Label>
                    <Select
                      value={formData.format}
                      onValueChange={(value) => setFormData({ ...formData, format: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="knockout">Single Elimination</SelectItem>
                        <SelectItem value="double-elimination">Double Elimination</SelectItem>
                        <SelectItem value="round-robin">Round Robin</SelectItem>
                        <SelectItem value="swiss">Swiss System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxPlayers">Max Players</Label>
                    <Select
                      value={formData.maxPlayers}
                      onValueChange={(value) => setFormData({ ...formData, maxPlayers: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8">8 Players</SelectItem>
                        <SelectItem value="16">16 Players</SelectItem>
                        <SelectItem value="32">32 Players</SelectItem>
                        <SelectItem value="64">64 Players</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Financial Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Financial Settings</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entryFee">Entry Fee (KSh)</Label>
                    <Input
                      id="entryFee"
                      type="number"
                      placeholder="500"
                      value={formData.entryFee}
                      onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prizeDistribution">Prize Distribution</Label>
                    <Select
                      value={formData.prizeDistribution}
                      onValueChange={(value) => setFormData({ ...formData, prizeDistribution: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select distribution" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="winner-takes-all">Winner Takes All</SelectItem>
                        <SelectItem value="top-3">Top 3 (60/30/10%)</SelectItem>
                        <SelectItem value="top-4">Top 4 (50/30/15/5%)</SelectItem>
                        <SelectItem value="custom">Custom Distribution</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Schedule</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                    <Input
                      id="registrationDeadline"
                      type="datetime-local"
                      value={formData.registrationDeadline}
                      onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Tournament Start</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Rules and Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Rules & Settings</h3>

                <div className="space-y-2">
                  <Label htmlFor="rules">Tournament Rules</Label>
                  <Textarea
                    id="rules"
                    placeholder="Specify match duration, difficulty level, allowed teams, etc."
                    value={formData.rules}
                    onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Screenshots</Label>
                      <p className="text-sm text-gray-600">Players must upload match result screenshots</p>
                    </div>
                    <Switch
                      checked={formData.requireScreenshots}
                      onCheckedChange={(checked) => setFormData({ ...formData, requireScreenshots: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Disputes</Label>
                      <p className="text-sm text-gray-600">Players can dispute match results</p>
                    </div>
                    <Switch
                      checked={formData.allowDisputes}
                      onCheckedChange={(checked) => setFormData({ ...formData, allowDisputes: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="button" variant="outline" className="flex-1 bg-transparent" asChild>
                  <Link href="/dashboard">Cancel</Link>
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Tournament"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
