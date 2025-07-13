"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Trophy, Users, DollarSign, Calendar, ArrowLeft, Smartphone } from "lucide-react"
import Link from "next/link"

export default function RegisterTournamentPage({ params }: { params: { id: string } }) {
  const [tournament, setTournament] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showMpesaModal, setShowMpesaModal] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const res = await fetch(`/api/tournaments/${params.id}`)
        if (!res.ok) throw new Error("Tournament not found")
        const json = await res.json()

        if (!json.success || !json.data) {
          throw new Error("Invalid data structure from API")
        }

        setTournament(json.data)
      } catch (err: any) {
        console.error("❌ Failed to fetch tournament:", err)
        setError("Unable to load tournament.")
      } finally {
        setFetching(false)
      }
    }

    fetchTournament()
  }, [params.id])

  const handleRegister = () => {
    if (!agreedToTerms) {
      alert("Please agree to the terms and conditions")
      return
    }

    setShowMpesaModal(true)
  }

  const handleMpesaPayment = async () => {
    setIsLoading(true)

    try {
      // Simulate payment delay
      await new Promise((resolve) => setTimeout(resolve, 3000))
      // Register the player for the tournament
      const res = await fetch(`/api/tournaments/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json()
      if (res.ok && data.success) {
        alert("Payment successful! You are now registered.")
        router.push("/dashboard")
      } else {
        alert(data.error || "Registration failed. Please try again.")
      }
    } catch (err) {
      alert("Payment or registration failed. Please try again.")
      console.error("Payment failed:", err)
    } finally {
      setIsLoading(false)
      setShowMpesaModal(false)
    }
  }

  if (fetching) {
    return <div className="p-10 text-center">Loading tournament...</div>
  }

  if (error || !tournament) {
    return <div className="p-10 text-center text-red-600">{error || "Tournament not found."}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/tournaments">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tournaments
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-green-600" />
            <h1 className="text-xl font-bold">Tournament Registration</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{tournament.name}</CardTitle>
                    <CardDescription className="mt-2 text-base">{tournament.description}</CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-800">{tournament.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Format</p>
                        <p className="text-sm text-gray-600">{tournament.format}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Players</p>
                        <p className="text-sm text-gray-600">
                          {tournament.current_players}/{tournament.max_players} registered
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Start Date</p>
                        <p className="text-sm text-gray-600">{new Date(tournament.start_date).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Entry Fee</p>
                        <p className="text-sm text-gray-600">KSh {Number(tournament.entry_fee).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Tournament Rules</h3>
                  <ul className="space-y-2">
                    {tournament.rules.map((rule: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
                  />
                  <label htmlFor="terms" className="text-sm font-medium">
                    I agree to the tournament rules and terms
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Registration Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Registration Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Entry Fee</span>
                    <span className="font-medium">KSh {Number(tournament.entry_fee).toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>KSh {Number(tournament.entry_fee).toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-800">Prize Pool</span>
                    <span className="text-lg font-bold text-green-600">
                      KSh {Number(tournament.current_prize_pool).toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button className="w-full" onClick={handleRegister} disabled={!agreedToTerms}>
                  Register & Pay with M-Pesa
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Registration closes on {new Date(tournament.registration_deadline).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{tournament.organizer_name}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* M-Pesa Modal */}
      {showMpesaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Smartphone className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle>M-Pesa Payment</CardTitle>
              <CardDescription>Complete your tournament registration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-green-800 mb-2">Amount to Pay</p>
                <p className="text-2xl font-bold text-green-600">
                  KSh {Number(tournament.entry_fee).toLocaleString()}
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Paybill Number:</span>
                  <span className="font-mono font-bold">174379</span>
                </div>
                <div className="flex justify-between">
                  <span>Account Number:</span>
                  <span className="font-mono font-bold">TOURNAMENT{tournament.id}</span>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800">
                1. Go to M-Pesa menu<br />
                2. Lipa na M-Pesa → Pay Bill<br />
                3. Enter Paybill 174379<br />
                4. Enter Account: TOURNAMENT{tournament.id}<br />
                5. Enter amount: KSh {tournament.entry_fee}<br />
                6. Enter PIN to complete
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowMpesaModal(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleMpesaPayment} disabled={isLoading}>
                  {isLoading ? "Processing..." : "I've Paid"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
