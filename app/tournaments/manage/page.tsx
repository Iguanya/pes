"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"

interface Tournament {
  id: string
  name: string
  description: string
  format: string
  maxPlayers: number
  entryFee: number
  prizeDistribution: string
  startDate: string
  registrationDeadline: string
}

export default function ManageTournamentPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await fetch("/api/tournaments")
        const json = await res.json()
        if (json.success) {
          setTournaments(json.data)
          console.log(json)
        }
      } catch (error) {
        console.error("Failed to load tournaments", error)
      }
      setIsLoading(false)
    }
    fetchTournaments()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this tournament?")) {
      const res = await fetch(`/api/tournaments/${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setTournaments(tournaments.filter(tournament => tournament.id !== id))
      } else {
        alert("Failed to delete tournament")
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
        <Navbar />
      <header className="bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            
          <h1 className="text-xl font-bold">Manage Tournaments</h1>
          <Button asChild>
            <Link href="/tournaments/create">Create New Tournament</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <p>Loading tournaments...</p>
        ) : (
          <>
            {tournaments.length === 0 ? (
              <p>No tournaments found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4  p-4">
                {tournaments.map(tournament => (
                  <Card
                    key={tournament.id}
                    className="flex flex-col justify-between shadow hover:shadow-lg transition bg-blue-100 hover:bg-blue-300"
                  >
                    <CardHeader>
                      <CardTitle>{tournament.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p>{tournament.description}</p>
                      <div className="flex justify-between">
                        <Button
                          asChild
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Link href={`/tournaments/edit/${tournament.id}`}>
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          className="bg-red-500 text-white hover:bg-red-600"
                          onClick={() => handleDelete(tournament.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
