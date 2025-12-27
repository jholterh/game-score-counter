export interface Player {
  id: string;
  name: string;
  totalScore: number;
  scores: number[]; // Score for each round
  predictions?: number[]; // Optional prediction values for dual-scoring
  joinedAtRound: number; // Track when player joined (for mid-game additions)
  isActive: boolean; // Track if player is still playing
  gaveUpAtRound?: number; // Track when player gave up
}

export interface PlayerIdentityMapping {
  playerId: string;
  playerName: string;
  userId: string | null;
  isCurrentUser: boolean;
}

export interface GameState {
  players: Player[];
  currentRound: number;
  isDualScoring: boolean;
  isGameFinished: boolean;
  language: string;
  highScoreWins: boolean; // true = higher score is better, false = lower score is better

  // Database sync fields (null when not logged in or not saving)
  gameId: string | null;           // UUID from games table
  isSyncing: boolean;              // Is auto-save currently in progress?
  lastSyncedRound: number;         // Last round successfully saved to DB
  syncError: string | null;        // Error message if last sync failed
  playerIdentities: PlayerIdentityMapping[]; // Maps players to user accounts
}

export interface RoundScore {
  playerId: string;
  score: number;
  prediction?: number;
}
