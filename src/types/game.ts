export interface Player {
  id: string;
  name: string;
  totalScore: number;
  scores: number[]; // Score for each round
  predictions?: number[]; // Optional prediction values for dual-scoring
  joinedAtRound: number; // Track when player joined (for mid-game additions)
}

export interface GameState {
  players: Player[];
  currentRound: number;
  isDualScoring: boolean;
  isGameFinished: boolean;
}

export interface RoundScore {
  playerId: string;
  score: number;
  prediction?: number;
}
