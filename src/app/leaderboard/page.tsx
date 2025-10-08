import { getLeaderboard } from "@/lib/firebase/firestore-admin";
import { LeaderboardClient } from "@/components/leaderboard-client";
import { Crown } from "lucide-react";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function LeaderboardPage() {
  const leaderboardData = await getLeaderboard();
  
  return (
    <div className="container mx-auto py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-primary mb-2 flex items-center justify-center gap-3">
          <Crown className="w-10 h-10 text-amber-400" />
          Leaderboard
        </h1>
        <p className="text-lg text-muted-foreground">
          See who are the top Sudoku Sensei masters!
        </p>
      </div>
      <LeaderboardClient initialData={leaderboardData} />
    </div>
  );
}
