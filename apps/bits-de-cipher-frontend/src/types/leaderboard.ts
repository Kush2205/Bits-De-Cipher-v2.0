export type LeaderboardView = 'top' | 'all';

export interface LeaderboardEntry {
  id: string;
  name: string | null;
  email: string;
  totalPoints: number;
  currentQuestionIndex: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
}
