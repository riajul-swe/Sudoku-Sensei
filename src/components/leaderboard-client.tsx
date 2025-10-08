'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LeaderboardEntry } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

type LeaderboardClientProps = {
  initialData: LeaderboardEntry[];
};

export function LeaderboardClient({ initialData }: LeaderboardClientProps) {
    
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-amber-400 text-amber-900';
    if (rank === 2) return 'bg-slate-400 text-slate-900';
    if (rank === 3) return 'bg-orange-400 text-orange-900';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] text-center">Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-center">Easy</TableHead>
              <TableHead className="text-center">Medium</TableHead>
              <TableHead className="text-center">Hard</TableHead>
              <TableHead className="text-center">Expert</TableHead>
              <TableHead className="text-right">Total Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.map((entry, index) => (
              <TableRow key={entry.uid}>
                <TableCell className="font-bold text-center">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center mx-auto", getRankColor(index + 1))}>
                        {index + 1}
                    </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={entry.photoURL ?? undefined} />
                      <AvatarFallback>{getInitials(entry.displayName)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{entry.displayName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">{entry.stats.easy || 0}</TableCell>
                <TableCell className="text-center">{entry.stats.medium || 0}</TableCell>
                <TableCell className="text-center">{entry.stats.hard || 0}</TableCell>
                <TableCell className="text-center">{entry.stats.expert || 0}</TableCell>
                <TableCell className="text-right font-bold text-primary">{entry.score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </div>
  );
}

function cn(...inputs: (string | undefined | null | false)[]): string {
    return inputs.filter(Boolean).join(' ');
}
