export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type Puzzle = {
  problem: string;
  solution: string;
  difficulty: Difficulty;
};

export type Grid = number[][];

export type Cell = { row: number; col: number } | null;

export type UserStats = {
  easy?: number;
  medium?: number;
  hard?: number;
  expert?: number;
};

export type LeaderboardEntry = {
  uid: string;
  displayName: string;
  photoURL: string | null;
  stats: UserStats;
  score: number;
};

export type SavedProgress = {
  puzzle: Puzzle;
  userGrid: string;
};
