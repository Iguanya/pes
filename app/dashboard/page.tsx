"use client";

import { ReactNode, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import Link from "next/link";
import { Trophy, Target, DollarSign, Gamepad2 } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  gamertag: string;
}

interface Tournament {
  entry_fee: ReactNode;
  id: number;
  name: string;
  description?: string;
  current_players: number;
  maxPlayers: number;
  entryFee: number;
  status: string;
}

interface UserStats {
  tournaments_joined: number;
  active_tournaments: number;
  total_spent: number;
  total_matches: number;
  wins: number;
  win_rate: number;
  total_earnings: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get current user
      const userResponse = await fetch("/api/auth/me");
      if (!userResponse.ok) {
        window.location.href = "/auth/login";
        return;
      }
      const userData = await userResponse.json();
      setUser(userData.user);

      // Fetch stats for player or organizer
      if (userData.user.role === "player" || userData.user.role === "organizer") {
        const statsResponse = await fetch("/api/dashboard/stats");
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.data);
        }
      }

      // Only fetch tournaments if player
      if (userData.user.role === "player") {
        const tournamentsResponse = await fetch(
          "/api/tournaments?status=registration"
        );
        if (tournamentsResponse.ok) {
          const tournamentsData = await tournamentsResponse.json();
          setTournaments(tournamentsData.data || []);
        }
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Navbar />
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Navbar />
        <div>Unable to load user data.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <Navbar />
      <div className="container mx-auto px-4 py-8 bg-cover bg-center">
        <h1 className="text-2xl font-bold mb-4 text-center">Welcome, {user.name}!</h1>
        
        {/* Player Stats Section */}
        {user.role === "player" && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Your Statistics</h2>
            {stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tournaments Joined</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.tournaments_joined}</div>
                    <p className="text-xs text-muted-foreground">{stats.active_tournaments} currently active</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.win_rate}%</div>
                    <p className="text-xs text-muted-foreground">{stats.wins} wins out of {stats.total_matches} matches</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">KSh {stats.total_spent?.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Entry fees paid</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">KSh {stats.total_earnings?.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Prize money won</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="mb-6">
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Statistics Yet</h3>
                    <p className="text-muted-foreground">Join your first tournament to see your statistics here.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Organizer Stats Section */}
        {user.role === "organizer" && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Organizer Statistics</h2>
              <Button asChild>
                <Link href="/tournaments/create">Create Tournament</Link>
              </Button>
            </div>
            {stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tournaments Organized</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_tournaments ?? 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Participants</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_participants ?? 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">KSh {stats.actual_revenue?.toLocaleString() ?? 0}</div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="mb-6">
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Statistics Yet</h3>
                    <p className="text-muted-foreground">Create your first tournament to see your statistics here.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Available Tournaments Section */}
        {user.role === "player" && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Available Tournaments</h2>
            {tournaments.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments.map((tournament) => (
                  <Card key={tournament.id}>
                    <CardHeader>
                      <CardTitle>{tournament.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-2 text-gray-600">
                        {tournament.current_players}/{tournament.maxPlayers} players
                      </p>
                      <p className="mb-2">Entry Fee: KSh {tournament.entry_fee}</p>
                      <div className="mt-4 flex gap-2">
                        <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
                          <Link href={`/tournaments/${tournament.id}/register`}>Register</Link>
                        </Button>
                        
                        <Button asChild>
                          <Link href={`/tournaments/${tournament.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div>No available tournaments at the moment.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
