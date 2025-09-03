"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Upload, Camera, ArrowLeft, Trophy } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SubmitMatchResultPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [activeTournaments, setActiveTournaments] = useState<any[]>([])
  const [formData, setFormData] = useState({
    matchId: "",
    tournament: "",
    opponent: "",
    myScore: "",
    opponentScore: "",
    matchNotes: "",
    resultType: "win", // win, loss, draw
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [recentMatches, setRecentMatches] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    // Fetch user's matches
    const fetchMatches = async () => {
      try {
        const res = await fetch("/api/matches/submit")
        const json = await res.json()
        if (json.success) {
          setMatches(json.data)
        }
      } catch (err) {
        console.log("Failed to fetch matches:", err)
        setError("Failed to load matches.")
      }
    }
    fetchMatches()

    // Fetch active tournaments (all, no status filter)
    const fetchTournaments = async () => {
      try {
        const res = await fetch("/api/tournaments")
        const json = await res.json()
        if (json.success) {
          setActiveTournaments(json.data)
        }
      } catch (err) {
        console.log("Failed to fetch tournaments:", err)
        setError("Failed to load tournaments.")
      }
    }
    fetchTournaments()

    // Fetch recent match submissions
    const fetchRecentMatches = async () => {
      try {
        const res = await fetch("/api/matches/submit?recent=true")
        const json = await res.json()
        if (json.success) {
          setRecentMatches(json.data)
        }
      } catch (err) {
        console.log("Failed to fetch recent matches:", err)
        setError("Failed to load recent matches.")
      }
    }
    fetchRecentMatches()
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const fd = new FormData()
      fd.append("match_id", formData.matchId)
      fd.append("tournament_id", formData.tournament)
      fd.append("opponent", formData.opponent)
      fd.append("my_score", formData.myScore)
      fd.append("opponent_score", formData.opponentScore)
      fd.append("match_notes", formData.matchNotes)
      if (selectedFile) {
        fd.append("screenshot", selectedFile)
      }
      const res = await fetch("/api/matches/submit", {
        method: "POST",
        body: fd,
      })
      const json = await res.json()
      if (res.ok && json.success) {
        setSuccess(json.message || "Match result submitted successfully!")
        setTimeout(() => router.push("/dashboard"), 1500)
      } else {
        setError(json.error || "Failed to submit match result.")
      }
    } catch (err) {
      setError("Failed to submit match result.")
    } finally {
      setIsLoading(false)
    }
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
            <h1 className="text-xl font-bold">Submit Match Result</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Match Result Submission</CardTitle>
            <CardDescription>Submit your match result with screenshot verification</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
            
              {/* Tournament Selection */}
              <div className="space-y-2">
                <Label htmlFor="tournament">Tournament</Label>
                <Select
                  value={formData.tournament}
                  onValueChange={(value) => setFormData({ ...formData, tournament: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tournament" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTournaments.map((tournament: any) => (
                      <SelectItem key={tournament.id} value={tournament.id.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span>{tournament.name}</span>
                          <Badge variant="secondary" className="ml-2">
                            {tournament.status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Opponent */}
              <div className="space-y-2">
                <Label htmlFor="opponent">Opponent</Label>
                <Input
                  id="opponent"
                  placeholder="Enter opponent's gamertag"
                  value={formData.opponent}
                  onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                  required
                />
              </div>
              {/* Match Result */}
              <div className="space-y-4">
                <Label>Match Result</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="myScore">Your Score</Label>
                    <Input
                      id="myScore"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.myScore}
                      onChange={(e) => setFormData({ ...formData, myScore: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex items-end justify-center pb-2">
                    <span className="text-2xl font-bold text-gray-400">-</span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opponentScore">Opponent Score</Label>
                    <Input
                      id="opponentScore"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.opponentScore}
                      onChange={(e) => setFormData({ ...formData, opponentScore: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Result Type Auto-Detection */}
                {formData.myScore && formData.opponentScore && (
                  <div className="text-center">
                    <Badge
                      variant={
                        Number.parseInt(formData.myScore) > Number.parseInt(formData.opponentScore)
                          ? "default"
                          : Number.parseInt(formData.myScore) < Number.parseInt(formData.opponentScore)
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {Number.parseInt(formData.myScore) > Number.parseInt(formData.opponentScore)
                        ? "Victory"
                        : Number.parseInt(formData.myScore) < Number.parseInt(formData.opponentScore)
                          ? "Defeat"
                          : "Draw"}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Screenshot Upload */}
              <div className="space-y-4">
                <Label>Match Screenshot</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {selectedFile ? (
                    <div className="space-y-2">
                      <Camera className="h-8 w-8 text-green-600 mx-auto" />
                      <p className="text-sm font-medium text-green-600">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">Screenshot uploaded successfully</p>
                      <Button type="button" variant="outline" size="sm" onClick={() => setSelectedFile(null)}>
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                      <div>
                        <label htmlFor="screenshot" className="cursor-pointer">
                          <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                            Upload screenshot
                          </span>
                          <input
                            id="screenshot"
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  <strong>Tip:</strong> Take a clear screenshot of the final score screen for automatic verification
                </p>
              </div>

              {/* Match Notes */}
              <div className="space-y-2">
                <Label htmlFor="matchNotes">Match Notes (Optional)</Label>
                <Textarea
                  id="matchNotes"
                  placeholder="Any additional details about the match..."
                  value={formData.matchNotes}
                  onChange={(e) => setFormData({ ...formData, matchNotes: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Error/Success Messages */}
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}

              {/* OCR Processing Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Automatic Verification</h4>
                <p className="text-sm text-blue-800">
                  Our system will automatically extract the score from your screenshot using OCR technology. Your
                  opponent will be notified to confirm the result.
                </p>
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="button" variant="outline" className="flex-1 bg-transparent" asChild>
                  <Link href="/dashboard">Cancel</Link>
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading || !selectedFile}>
                  {isLoading ? "Processing..." : "Submit Result"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Recent Matches */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Matches</CardTitle>
            <CardDescription>Your latest match submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMatches.length === 0 ? (
                <div className="text-gray-500 text-sm">No recent match submissions.</div>
              ) : (
                recentMatches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        vs Player {match.player1_id === match.player2_id ? match.player1_id : (match.player1_id && match.player2_id ? `${match.player1_id === match.player2_id ? match.player1_id : match.player2_id}` : "?")}
                      </p>
                      <p className="text-sm text-gray-600">{match.tournament_name}</p>
                      <p className="text-xs text-gray-500">{new Date(match.submission_time).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{match.player1_score} - {match.player2_score}</p>
                      <Badge variant={match.is_confirmed ? "default" : "secondary"}>{match.is_confirmed ? "Confirmed" : "Pending"}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
