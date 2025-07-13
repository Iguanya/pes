import React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { Navbar } from "@/components/layout/navbar";

interface LeaderboardEntry {
  player_id: number;
  player_name: string;
  gamertag: string;
  ranking_points: number;
  tournaments_won: number;
  total_earnings: number;
  matches_played: number;
  win_rate: number;
}

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const headersList = headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const baseUrl = `${protocol}://${host}`;
  const res = await fetch(`${baseUrl}/api/leaderboard`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data as LeaderboardEntry[];
}

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>
      <div className="max-w-4xl mx-auto bg-white rounded shadow p-6 py-8 px-4 mt-10">
        <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
        {leaderboard.length === 0 ? (
          <div>No leaderboard data available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">#</th>
                  <th className="px-4 py-2 border">Player</th>
                  <th className="px-4 py-2 border">Gamertag</th>
                  <th className="px-4 py-2 border">Points</th>
                  <th className="px-4 py-2 border">Tournaments Won</th>
                  <th className="px-4 py-2 border">Earnings (KSh)</th>
                  <th className="px-4 py-2 border">Matches Played</th>
                  <th className="px-4 py-2 border">Win Rate (%)</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, idx) => (
                  <tr key={entry.player_id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-2 border text-center">{idx + 1}</td>
                    <td className="px-4 py-2 border">{entry.player_name}</td>
                    <td className="px-4 py-2 border">{entry.gamertag}</td>
                    <td className="px-4 py-2 border text-center">{entry.ranking_points}</td>
                    <td className="px-4 py-2 border text-center">{entry.tournaments_won}</td>
                    <td className="px-4 py-2 border text-center">{entry.total_earnings.toLocaleString()}</td>
                    <td className="px-4 py-2 border text-center">{entry.matches_played}</td>
                    <td className="px-4 py-2 border text-center">{entry.win_rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
