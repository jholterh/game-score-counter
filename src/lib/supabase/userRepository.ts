import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserPreferencesRow = Database['public']['Tables']['user_preferences']['Row'];
type UserPreferencesInsert = Database['public']['Tables']['user_preferences']['Insert'];
type UserPreferencesUpdate = Database['public']['Tables']['user_preferences']['Update'];
type UserStatisticsRow = Database['public']['Tables']['user_statistics']['Row'];

export interface UserPreferences {
  preferred_language: 'en' | 'es' | 'de';
  favorite_narrator: string | null;
  preferred_high_score_wins: boolean;
  preferred_dual_scoring: boolean;
}

export interface UserStatistics {
  total_games_played: number;
  total_games_won: number;
  total_rounds_played: number;
  average_score_per_game: number;
  highest_game_score: number;
  lowest_game_score: number;
  favorite_game_mode: string | null;
  last_played_at: string | null;
  win_rate: number; // Computed client-side
}

// =====================================================
// User Preferences Operations
// =====================================================

/**
 * Fetch user preferences
 */
export const fetchUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`Failed to fetch preferences: ${error.message}`);
  }

  return {
    preferred_language: data.preferred_language as 'en' | 'es' | 'de',
    favorite_narrator: data.favorite_narrator,
    preferred_high_score_wins: data.preferred_high_score_wins || true,
    preferred_dual_scoring: data.preferred_dual_scoring || false,
  };
};

/**
 * Create or update user preferences
 */
export const upsertUserPreferences = async (
  userId: string,
  preferences: Partial<UserPreferences>
): Promise<void> => {
  const data: UserPreferencesInsert = {
    user_id: userId,
    preferred_language: preferences.preferred_language || 'en',
    favorite_narrator: preferences.favorite_narrator || null,
    preferred_high_score_wins: preferences.preferred_high_score_wins !== undefined
      ? preferences.preferred_high_score_wins
      : true,
    preferred_dual_scoring: preferences.preferred_dual_scoring || false,
  };

  const { error } = await supabase
    .from('user_preferences')
    .upsert(data, {
      onConflict: 'user_id',
    });

  if (error) throw new Error(`Failed to save preferences: ${error.message}`);
};

/**
 * Update preferences based on game settings (implicit learning)
 */
export const updatePreferencesFromGame = async (
  userId: string,
  gameSettings: {
    language: string;
    high_score_wins: boolean;
    is_dual_scoring: boolean;
    ai_theme?: string;
  }
): Promise<void> => {
  // Fetch current preferences
  const current = await fetchUserPreferences(userId);

  // Update with game settings (weighted towards recent games)
  const updates: UserPreferencesUpdate = {
    preferred_language: gameSettings.language as 'en' | 'es' | 'de',
    preferred_high_score_wins: gameSettings.high_score_wins,
    preferred_dual_scoring: gameSettings.is_dual_scoring,
  };

  // Only update favorite narrator if provided
  if (gameSettings.ai_theme) {
    updates.favorite_narrator = gameSettings.ai_theme;
  }

  // If no preferences exist yet, create them
  if (!current) {
    await upsertUserPreferences(userId, updates);
  } else {
    // Update existing preferences
    const { error } = await supabase
      .from('user_preferences')
      .update(updates)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to update preferences: ${error.message}`);
  }
};

// =====================================================
// User Statistics Operations
// =====================================================

/**
 * Fetch user statistics
 */
export const fetchUserStatistics = async (userId: string): Promise<UserStatistics | null> => {
  const { data, error } = await supabase
    .from('user_statistics')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No stats yet, return defaults
      return {
        total_games_played: 0,
        total_games_won: 0,
        total_rounds_played: 0,
        average_score_per_game: 0,
        highest_game_score: 0,
        lowest_game_score: 0,
        favorite_game_mode: null,
        last_played_at: null,
        win_rate: 0,
      };
    }
    throw new Error(`Failed to fetch statistics: ${error.message}`);
  }

  // Compute win rate
  const winRate = data.total_games_played > 0
    ? (data.total_games_won / data.total_games_played) * 100
    : 0;

  return {
    total_games_played: data.total_games_played,
    total_games_won: data.total_games_won,
    total_rounds_played: data.total_rounds_played,
    average_score_per_game: parseFloat(data.average_score_per_game?.toString() || '0'),
    highest_game_score: data.highest_game_score || 0,
    lowest_game_score: data.lowest_game_score || 0,
    favorite_game_mode: data.favorite_game_mode,
    last_played_at: data.last_played_at,
    win_rate: Math.round(winRate * 10) / 10, // Round to 1 decimal place
  };
};

/**
 * Fetch advanced statistics from view
 */
export const fetchAdvancedStatistics = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_game_statistics')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch advanced statistics: ${error.message}`);
  }

  return data;
};

/**
 * Manually trigger statistics update (usually done via trigger, but can be called manually)
 */
export const refreshUserStatistics = async (userId: string): Promise<void> => {
  // Fetch all finished games for this user
  const { data: participants, error: fetchError } = await supabase
    .from('game_participants')
    .select(`
      total_score,
      is_winner,
      game:games!inner (
        id,
        total_rounds,
        is_dual_scoring,
        high_score_wins,
        finished_at,
        is_finished
      )
    `)
    .eq('user_id', userId)
    .eq('game.is_finished', true);

  if (fetchError) throw new Error(`Failed to fetch game data: ${fetchError.message}`);

  if (!participants || participants.length === 0) {
    // No games played, ensure stats exist with zeros
    await supabase
      .from('user_statistics')
      .upsert({
        user_id: userId,
        total_games_played: 0,
        total_games_won: 0,
        total_rounds_played: 0,
        average_score_per_game: 0,
        highest_game_score: 0,
        lowest_game_score: 0,
      }, {
        onConflict: 'user_id',
      });
    return;
  }

  // Calculate statistics
  const totalGames = participants.length;
  const totalWins = participants.filter(p => p.is_winner).length;
  const totalRounds = participants.reduce((sum, p) => sum + (p.game?.total_rounds || 0), 0);
  const scores = participants.map(p => p.total_score);
  const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);

  // Determine favorite game mode
  const dualGames = participants.filter(p => p.game?.is_dual_scoring).length;
  const favoriteMode = dualGames > totalGames / 2 ? 'Dual Scoring' : 'Regular';

  const lastPlayed = participants
    .map(p => p.game?.finished_at)
    .filter(Boolean)
    .sort()
    .reverse()[0];

  // Update statistics
  const { error: updateError } = await supabase
    .from('user_statistics')
    .upsert({
      user_id: userId,
      total_games_played: totalGames,
      total_games_won: totalWins,
      total_rounds_played: totalRounds,
      average_score_per_game: Math.round(avgScore * 100) / 100,
      highest_game_score: highestScore,
      lowest_game_score: lowestScore,
      favorite_game_mode: favoriteMode,
      last_played_at: lastPlayed || null,
    }, {
      onConflict: 'user_id',
    });

  if (updateError) throw new Error(`Failed to update statistics: ${updateError.message}`);
};

// =====================================================
// Helper Functions
// =====================================================

/**
 * Check if user has any saved preferences
 */
export const hasUserPreferences = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('id')
    .eq('user_id', userId)
    .single();

  return !error && data !== null;
};

/**
 * Delete all user data (preferences and statistics)
 * Used for account deletion or data reset
 */
export const deleteUserData = async (userId: string): Promise<void> => {
  // Delete preferences
  await supabase
    .from('user_preferences')
    .delete()
    .eq('user_id', userId);

  // Delete statistics
  await supabase
    .from('user_statistics')
    .delete()
    .eq('user_id', userId);

  // Note: games and participants are retained even after user deletion
  // (set to NULL via ON DELETE SET NULL in schema)
};
