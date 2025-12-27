import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { Player } from '@/types/game';

type GameRow = Database['public']['Tables']['games']['Row'];
type GameInsert = Database['public']['Tables']['games']['Insert'];
type GameUpdate = Database['public']['Tables']['games']['Update'];
type ParticipantRow = Database['public']['Tables']['game_participants']['Row'];
type ParticipantInsert = Database['public']['Tables']['game_participants']['Insert'];
type RoundScoreInsert = Database['public']['Tables']['round_scores']['Insert'];

export interface PlayerIdentityMapping {
  playerId: string;
  playerName: string;
  userId: string | null;
  isCurrentUser: boolean;
}

export interface GameWithParticipants extends GameRow {
  game_participants: ParticipantRow[];
}

// =====================================================
// Create Operations
// =====================================================

/**
 * Create a new game record
 */
export const createGame = async (data: {
  created_by: string | null;
  language: string;
  is_dual_scoring: boolean;
  high_score_wins: boolean;
  total_rounds: number;
}): Promise<string> => {
  const gameData: GameInsert = {
    created_by: data.created_by,
    language: data.language,
    is_dual_scoring: data.is_dual_scoring,
    high_score_wins: data.high_score_wins,
    total_rounds: data.total_rounds,
    is_finished: false,
    started_at: new Date().toISOString(),
  };

  const { data: game, error } = await supabase
    .from('games')
    .insert(gameData)
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create game: ${error.message}`);
  return game.id;
};

/**
 * Create game participants
 */
export const createParticipants = async (
  gameId: string,
  players: Player[],
  playerIdentities: PlayerIdentityMapping[]
): Promise<void> => {
  const participants: ParticipantInsert[] = players.map((player, index) => {
    const identity = playerIdentities.find(pi => pi.playerId === player.id);

    return {
      game_id: gameId,
      user_id: identity?.userId || null,
      player_name: player.name,
      player_order: index,
      total_score: player.totalScore,
      joined_at_round: player.joinedAtRound,
      gave_up_at_round: player.gaveUpAtRound || null,
      is_active: player.isActive,
    };
  });

  const { error } = await supabase
    .from('game_participants')
    .insert(participants);

  if (error) throw new Error(`Failed to create participants: ${error.message}`);
};

/**
 * Add a new participant to an existing game (mid-game join)
 */
export const addParticipant = async (
  gameId: string,
  player: Player,
  playerIdentity: PlayerIdentityMapping,
  playerOrder: number
): Promise<void> => {
  const participant: ParticipantInsert = {
    game_id: gameId,
    user_id: playerIdentity.userId || null,
    player_name: player.name,
    player_order: playerOrder,
    total_score: player.totalScore,
    joined_at_round: player.joinedAtRound,
    is_active: player.isActive,
  };

  const { error } = await supabase
    .from('game_participants')
    .insert(participant);

  if (error) throw new Error(`Failed to add participant: ${error.message}`);
};

/**
 * Save round scores for all players
 */
export const saveRoundScores = async (
  gameId: string,
  roundNumber: number,
  players: Player[],
  playerIdentities: PlayerIdentityMapping[]
): Promise<void> => {
  // First, get participant IDs
  const { data: participants, error: fetchError } = await supabase
    .from('game_participants')
    .select('id, player_order')
    .eq('game_id', gameId);

  if (fetchError) throw new Error(`Failed to fetch participants: ${fetchError.message}`);

  const roundScores: RoundScoreInsert[] = players.map((player, index) => {
    const participant = participants.find(p => p.player_order === index);
    if (!participant) throw new Error(`Participant not found for player ${player.name}`);

    const scoreIndex = roundNumber - 1;
    const score = player.scores[scoreIndex] || 0;
    const prediction = player.predictions ? player.predictions[scoreIndex] : null;

    return {
      game_id: gameId,
      participant_id: participant.id,
      round_number: roundNumber,
      score: score,
      prediction: prediction || null,
      cumulative_score: player.totalScore,
    };
  });

  const { error } = await supabase
    .from('round_scores')
    .insert(roundScores);

  if (error) throw new Error(`Failed to save round scores: ${error.message}`);
};

// =====================================================
// Update Operations
// =====================================================

/**
 * Update game details (used for incrementing rounds, finishing game, etc.)
 */
export const updateGame = async (
  gameId: string,
  updates: GameUpdate
): Promise<void> => {
  const { error } = await supabase
    .from('games')
    .update(updates)
    .eq('id', gameId);

  if (error) throw new Error(`Failed to update game: ${error.message}`);
};

/**
 * Update participant (for give up/rejoin actions)
 */
export const updateParticipant = async (
  gameId: string,
  playerOrder: number,
  updates: {
    is_active?: boolean;
    gave_up_at_round?: number;
    total_score?: number;
  }
): Promise<void> => {
  const { error } = await supabase
    .from('game_participants')
    .update(updates)
    .eq('game_id', gameId)
    .eq('player_order', playerOrder);

  if (error) throw new Error(`Failed to update participant: ${error.message}`);
};

/**
 * Update final game stats and participant rankings
 */
export const finalizeGame = async (
  gameId: string,
  players: Player[],
  highScoreWins: boolean,
  totalRounds: number,
  aiAnalysis?: string,
  aiTheme?: string
): Promise<void> => {
  // Sort players to determine rankings
  const sortedPlayers = [...players].sort((a, b) =>
    highScoreWins ? b.totalScore - a.totalScore : a.totalScore - b.totalScore
  );

  const winner = sortedPlayers[0];

  // Update game as finished
  await updateGame(gameId, {
    is_finished: true,
    finished_at: new Date().toISOString(),
    total_rounds: totalRounds,
    ai_analysis: aiAnalysis || null,
    ai_theme: aiTheme || null,
  });

  // Update participant final stats
  const { data: participants, error: fetchError } = await supabase
    .from('game_participants')
    .select('id, player_order')
    .eq('game_id', gameId);

  if (fetchError) throw new Error(`Failed to fetch participants: ${fetchError.message}`);

  for (let i = 0; i < sortedPlayers.length; i++) {
    const player = sortedPlayers[i];
    const playerIndex = players.findIndex(p => p.id === player.id);
    const participant = participants.find(p => p.player_order === playerIndex);

    if (!participant) continue;

    await supabase
      .from('game_participants')
      .update({
        total_score: player.totalScore,
        final_rank: i + 1,
        is_winner: player.id === winner.id,
      })
      .eq('id', participant.id);
  }
};

// =====================================================
// Read Operations
// =====================================================

/**
 * Fetch user's game history (paginated)
 */
export const fetchUserGames = async (
  userId: string,
  options?: {
    page?: number;
    pageSize?: number;
    filters?: {
      dateRange?: 'week' | 'month' | 'year' | 'all';
      gameMode?: 'all' | 'dual' | 'standard';
      outcome?: 'all' | 'won' | 'lost';
    };
  }
): Promise<GameWithParticipants[]> => {
  const page = options?.page ?? 0;
  const pageSize = options?.pageSize ?? 20;
  const filters = options?.filters;
  let query = supabase
    .from('games')
    .select(`
      *,
      game_participants (*)
    `)
    .eq('game_participants.user_id', userId)
    .eq('is_finished', true)
    .order('finished_at', { ascending: false });

  // Apply filters
  if (filters?.dateRange && filters.dateRange !== 'all') {
    const now = new Date();
    let cutoffDate: Date;

    switch (filters.dateRange) {
      case 'week':
        cutoffDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        cutoffDate = new Date(0);
    }

    query = query.gte('finished_at', cutoffDate.toISOString());
  }

  if (filters?.gameMode && filters.gameMode !== 'all') {
    query = query.eq('is_dual_scoring', filters.gameMode === 'dual');
  }

  // Pagination
  const start = page * pageSize;
  const end = start + pageSize - 1;
  query = query.range(start, end);

  const { data, error } = await query;

  if (error) throw new Error(`Failed to fetch games: ${error.message}`);

  // Filter by outcome if needed (has to be done client-side)
  if (filters?.outcome && filters.outcome !== 'all') {
    return (data as GameWithParticipants[]).filter(game => {
      const userParticipant = game.game_participants.find(p => p.user_id === userId);
      if (filters.outcome === 'won') {
        return userParticipant?.is_winner === true;
      } else {
        return userParticipant?.is_winner === false;
      }
    });
  }

  return data as GameWithParticipants[];
};

/**
 * Fetch a single game with all details
 */
export const fetchGameDetail = async (gameId: string): Promise<GameWithParticipants | null> => {
  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      game_participants (
        *
      )
    `)
    .eq('id', gameId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`Failed to fetch game: ${error.message}`);
  }

  return data as GameWithParticipants;
};

/**
 * Fetch round scores for a game
 */
export const fetchRoundScores = async (gameId: string) => {
  const { data, error } = await supabase
    .from('round_scores')
    .select('*')
    .eq('game_id', gameId)
    .order('round_number', { ascending: true });

  if (error) throw new Error(`Failed to fetch round scores: ${error.message}`);
  return data;
};

// =====================================================
// Helper Functions
// =====================================================

/**
 * Create player identity mappings (links players to user accounts)
 */
export const createPlayerIdentityMappings = (
  players: Player[],
  currentUser: { id: string; email?: string; user_metadata?: { full_name?: string } } | null
): PlayerIdentityMapping[] => {
  if (!currentUser) {
    // No user logged in, all players anonymous
    return players.map(p => ({
      playerId: p.id,
      playerName: p.name,
      userId: null,
      isCurrentUser: false,
    }));
  }

  // Try to match logged-in user to a player by name
  const userDisplayName =
    currentUser.user_metadata?.full_name ||
    currentUser.email?.split('@')[0] ||
    '';

  return players.map(p => {
    const isMatch =
      userDisplayName &&
      p.name.toLowerCase().includes(userDisplayName.toLowerCase());

    return {
      playerId: p.id,
      playerName: p.name,
      userId: isMatch ? currentUser.id : null,
      isCurrentUser: isMatch,
    };
  });
};
