import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import type { Player, PlayerIdentityMapping } from '@/types/game';
import {
  createGame,
  createParticipants,
  addParticipant,
  saveRoundScores,
  updateParticipant,
  finalizeGame,
  createPlayerIdentityMappings,
} from '@/lib/supabase/gameRepository';
import { updatePreferencesFromGame } from '@/lib/supabase/userRepository';

export interface GamePersistenceState {
  gameId: string | null;
  isSyncing: boolean;
  lastSyncedRound: number;
  syncError: string | null;
  playerIdentities: PlayerIdentityMapping[];
}

export interface UseGamePersistenceReturn {
  // State
  persistenceState: GamePersistenceState;

  // Operations
  initializeGame: (data: {
    players: Player[];
    language: string;
    isDualScoring: boolean;
    highScoreWins: boolean;
  }) => Promise<void>;

  saveRound: (roundNumber: number, players: Player[]) => Promise<void>;

  handlePlayerJoin: (player: Player, playerOrder: number) => Promise<void>;

  handlePlayerStatusChange: (playerOrder: number, isActive: boolean, gaveUpAtRound?: number) => Promise<void>;

  finishGame: (data: {
    players: Player[];
    totalRounds: number;
    highScoreWins: boolean;
    aiAnalysis?: string;
    aiTheme?: string;
    language: string;
    isDualScoring: boolean;
  }) => Promise<void>;

  resetPersistence: () => void;
}

/**
 * Hook for managing game persistence to database
 * Handles auto-save on every round and game state changes
 */
export const useGamePersistence = (user: User | null): UseGamePersistenceReturn => {
  const [persistenceState, setPersistenceState] = useState<GamePersistenceState>({
    gameId: null,
    isSyncing: false,
    lastSyncedRound: 0,
    syncError: null,
    playerIdentities: [],
  });

  /**
   * Initialize game in database when game starts
   */
  const initializeGame = useCallback(async (data: {
    players: Player[];
    language: string;
    isDualScoring: boolean;
    highScoreWins: boolean;
  }) => {
    // Only save if user is logged in
    if (!user) {
      console.log('User not logged in, skipping game initialization');
      return;
    }

    setPersistenceState(prev => ({ ...prev, isSyncing: true, syncError: null }));

    try {
      // Create player identity mappings
      const playerIdentities = createPlayerIdentityMappings(data.players, user);

      console.log('Initializing game with identities:', playerIdentities);

      // Create game record
      const gameId = await createGame({
        created_by: user.id,
        language: data.language,
        is_dual_scoring: data.isDualScoring,
        high_score_wins: data.highScoreWins,
        total_rounds: 1, // Will be updated as game progresses
      });

      // Create participant records
      await createParticipants(gameId, data.players, playerIdentities);

      console.log('Game initialized successfully:', gameId);

      setPersistenceState(prev => ({
        ...prev,
        gameId,
        playerIdentities,
        isSyncing: false,
        lastSyncedRound: 0,
      }));
    } catch (error) {
      console.error('Failed to initialize game:', error);
      setPersistenceState(prev => ({
        ...prev,
        isSyncing: false,
        syncError: error instanceof Error ? error.message : 'Failed to save game',
      }));
    }
  }, [user]);

  /**
   * Save round scores after each round
   */
  const saveRound = useCallback(async (roundNumber: number, players: Player[]) => {
    if (!persistenceState.gameId || !user) {
      console.log('No game ID or user, skipping round save');
      return;
    }

    setPersistenceState(prev => ({ ...prev, isSyncing: true, syncError: null }));

    try {
      await saveRoundScores(
        persistenceState.gameId,
        roundNumber,
        players,
        persistenceState.playerIdentities
      );

      console.log(`Round ${roundNumber} saved successfully`);

      setPersistenceState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncedRound: roundNumber,
      }));
    } catch (error) {
      console.error('Failed to save round:', error);
      setPersistenceState(prev => ({
        ...prev,
        isSyncing: false,
        syncError: error instanceof Error ? error.message : 'Failed to save round',
      }));
    }
  }, [persistenceState.gameId, persistenceState.playerIdentities, user]);

  /**
   * Handle player joining mid-game
   */
  const handlePlayerJoin = useCallback(async (player: Player, playerOrder: number) => {
    if (!persistenceState.gameId || !user) {
      console.log('No game ID or user, skipping player join');
      return;
    }

    setPersistenceState(prev => ({ ...prev, isSyncing: true, syncError: null }));

    try {
      // Create identity for new player (will be anonymous unless they match logged-in user)
      const newIdentity = createPlayerIdentityMappings([player], user)[0];

      await addParticipant(
        persistenceState.gameId,
        player,
        newIdentity,
        playerOrder
      );

      console.log('Player join saved successfully:', player.name);

      // Add to player identities
      setPersistenceState(prev => ({
        ...prev,
        isSyncing: false,
        playerIdentities: [...prev.playerIdentities, newIdentity],
      }));
    } catch (error) {
      console.error('Failed to save player join:', error);
      setPersistenceState(prev => ({
        ...prev,
        isSyncing: false,
        syncError: error instanceof Error ? error.message : 'Failed to save player join',
      }));
    }
  }, [persistenceState.gameId, persistenceState.playerIdentities, user]);

  /**
   * Handle player give up or rejoin
   */
  const handlePlayerStatusChange = useCallback(async (
    playerOrder: number,
    isActive: boolean,
    gaveUpAtRound?: number
  ) => {
    if (!persistenceState.gameId || !user) {
      console.log('No game ID or user, skipping player status change');
      return;
    }

    setPersistenceState(prev => ({ ...prev, isSyncing: true, syncError: null }));

    try {
      await updateParticipant(persistenceState.gameId, playerOrder, {
        is_active: isActive,
        gave_up_at_round: gaveUpAtRound,
      });

      console.log('Player status change saved successfully');

      setPersistenceState(prev => ({ ...prev, isSyncing: false }));
    } catch (error) {
      console.error('Failed to save player status change:', error);
      setPersistenceState(prev => ({
        ...prev,
        isSyncing: false,
        syncError: error instanceof Error ? error.message : 'Failed to save status change',
      }));
    }
  }, [persistenceState.gameId, user]);

  /**
   * Finalize game when it's finished
   */
  const finishGame = useCallback(async (data: {
    players: Player[];
    totalRounds: number;
    highScoreWins: boolean;
    aiAnalysis?: string;
    aiTheme?: string;
    language: string;
    isDualScoring: boolean;
  }) => {
    if (!persistenceState.gameId || !user) {
      console.log('No game ID or user, skipping game finalization');
      return;
    }

    setPersistenceState(prev => ({ ...prev, isSyncing: true, syncError: null }));

    try {
      // Finalize game record
      await finalizeGame(
        persistenceState.gameId,
        data.players,
        data.highScoreWins,
        data.totalRounds,
        data.aiAnalysis,
        data.aiTheme
      );

      // Update user preferences based on game settings
      await updatePreferencesFromGame(user.id, {
        language: data.language,
        high_score_wins: data.highScoreWins,
        is_dual_scoring: data.isDualScoring,
        ai_theme: data.aiTheme,
      });

      console.log('Game finalized successfully');

      setPersistenceState(prev => ({ ...prev, isSyncing: false }));
    } catch (error) {
      console.error('Failed to finalize game:', error);
      setPersistenceState(prev => ({
        ...prev,
        isSyncing: false,
        syncError: error instanceof Error ? error.message : 'Failed to finalize game',
      }));
    }
  }, [persistenceState.gameId, user]);

  /**
   * Reset persistence state (for new game or play again)
   */
  const resetPersistence = useCallback(() => {
    setPersistenceState({
      gameId: null,
      isSyncing: false,
      lastSyncedRound: 0,
      syncError: null,
      playerIdentities: [],
    });
  }, []);

  return {
    persistenceState,
    initializeGame,
    saveRound,
    handlePlayerJoin,
    handlePlayerStatusChange,
    finishGame,
    resetPersistence,
  };
};
