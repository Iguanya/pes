import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Navbar } from "@/components/layout/navbar";
interface Tournament {
  id: number;
  name: string;
  description?: string;
  current_players: number;
  maxPlayers: number;
  entry_fee: number;
  status: string;
}

async function getTournament(id: string): Promise<Tournament | null> {
  // Dynamically build the absolute URL using headers
  const headersList = headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const baseUrl = `${protocol}://${host}`;
  const res = await fetch(`${baseUrl}/api/tournaments/${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.data as Tournament;
}

export default async function TournamentDetailsPage({ params }: { params: { id: string } }) {
  const tournament = await getTournament(params.id);
  if (!tournament) return notFound();

  return (
    <>
      <Navbar />
    <div className="min-h-screen bg-gray-500 py-8 px-4 w-80">
      <div className="max-w-2xl mx-auto bg-blue rounded shadow p-6">
        <h1 className="text-2xl font-bold mb-2">{tournament.name}</h1>
        <p className="mb-4 text-gray-600">{tournament.description || "No description provided."}</p>
        <div className="mb-2">
          <span className="font-semibold">Players:</span> {tournament.current_players} / {tournament.maxPlayers}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Entry Fee:</span> KSh {tournament.entry_fee}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Status:</span> {tournament.status}
        </div>
        <div className="mt-6">
          <a href={`/tournaments/${tournament.id}/register`} className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded  transition">Register</a>
        </div>
      </div>
    </div></>
  );
}
