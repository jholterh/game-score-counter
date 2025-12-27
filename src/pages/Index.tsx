import { useState, useEffect } from "react";
import { SetupScreen } from "@/components/game/SetupScreen";
import { GameScreen } from "@/components/game/GameScreen";
import { ResultsScreen } from "@/components/game/ResultsScreen";
import { Player, GameState, RoundScore } from "@/types/game";
import { Language } from "@/lib/translations";
import { useAuth } from "@/hooks/useAuth";
import { useGamePersistence } from "@/hooks/useGamePersistence";
import { useUserPreferences } from "@/hooks/useUserPreferences";

type GamePhase = 'setup' | 'playing' | 'results';

const Index = () => {
  const { user } = useAuth();
  const { persistenceState, initializeGame, saveRound, handlePlayerJoin, handlePlayerStatusChange, finishGame, resetPersistence } = useGamePersistence(user);
  const { preferences } = useUserPreferences(user);

  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentRound: 1,
    isDualScoring: false,
    isGameFinished: false,
    language: preferences?.preferred_language || 'en',
    highScoreWins: preferences?.preferred_high_score_wins ?? true,
    gameId: null,
    isSyncing: false,
    lastSyncedRound: 0,
    syncError: null,
    playerIdentities: [],
  });

  // Sync only gameId and playerIdentities into gameState (not the UI-related sync status)
  // This prevents sync status changes from breaking graph animations
  useEffect(() => {
    setGameState(prev => {
      if (
        prev.gameId === persistenceState.gameId &&
        prev.playerIdentities === persistenceState.playerIdentities
      ) {
        return prev;
      }

      return {
        ...prev,
        gameId: persistenceState.gameId,
        playerIdentities: persistenceState.playerIdentities,
      };
    });
  }, [persistenceState.gameId, persistenceState.playerIdentities]);

  const handleStartGame = async (playerNames: string[], isDualScoring: boolean, language: string, highScoreWins: boolean) => {
    const players: Player[] = playerNames.map((name, index) => ({
      id: `player-${index}`,
      name,
      totalScore: 0,
      scores: [],
      predictions: isDualScoring ? [] : undefined,
      joinedAtRound: 1,
      isActive: true,
    }));

    setGameState({
      players,
      currentRound: 1,
      isDualScoring,
      isGameFinished: false,
      language,
      highScoreWins,
      gameId: null,
      isSyncing: false,
      lastSyncedRound: 0,
      syncError: null,
      playerIdentities: [],
    });
    setGamePhase('playing');

    // Initialize game in database (state will sync via useEffect)
    await initializeGame({
      players,
      language,
      isDualScoring,
      highScoreWins,
    });
  };

  const handleScoreSubmit = (scores: RoundScore[]) => {
    setGameState(prev => {
      const updatedPlayers = prev.players.map(player => {
        // Skip scoring for inactive players
        if (!player.isActive) return player;
        
        const roundScore = scores.find(s => s.playerId === player.id);
        if (!roundScore) return player;

        const newScores = [...player.scores];
        const roundIndex = prev.currentRound - 1;
        
        // Only add/update score at the exact round index
        if (newScores.length === roundIndex) {
          // Normal case: adding score for the current round
          newScores.push(roundScore.score);
        } else if (newScores.length > roundIndex) {
          // Editing a previous round
          newScores[roundIndex] = roundScore.score;
        } else {
          // Safety: fill missing rounds with 0
          while (newScores.length < roundIndex) {
            newScores.push(0);
          }
          newScores.push(roundScore.score);
        }

        const newPredictions = player.predictions ? [...player.predictions] : undefined;
        if (newPredictions && roundScore.prediction !== undefined) {
          if (newPredictions.length === roundIndex) {
            newPredictions.push(roundScore.prediction);
          } else if (newPredictions.length > roundIndex) {
            newPredictions[roundIndex] = roundScore.prediction;
          } else {
            while (newPredictions.length < roundIndex) {
              newPredictions.push(0);
            }
            newPredictions.push(roundScore.prediction);
          }
        }

        return {
          ...player,
          scores: newScores,
          predictions: newPredictions,
          totalScore: newScores.reduce((sum, score) => sum + (score || 0), 0),
        };
      });

      return {
        ...prev,
        players: updatedPlayers,
      };
    });
  };

  const handleNextRound = async () => {
    const currentRoundNumber = gameState.currentRound;

    setGameState(prev => ({
      ...prev,
      currentRound: prev.currentRound + 1,
    }));

    // Auto-save the round that was just completed (state will sync via useEffect)
    await saveRound(currentRoundNumber, gameState.players);
  };

  const handlePreviousRound = () => {
    if (gameState.currentRound > 1) {
      setGameState(prev => ({
        ...prev,
        currentRound: prev.currentRound - 1,
      }));
    }
  };

  const handleAddPlayer = async (name: string, startingScore: number) => {
    // Distribute starting score across previous rounds
    const previousRounds = gameState.currentRound - 1;
    const scorePerRound = previousRounds > 0 ? startingScore / previousRounds : 0;
    const scores = Array(previousRounds).fill(scorePerRound);

    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      name,
      totalScore: startingScore,
      scores: scores,
      predictions: gameState.isDualScoring ? Array(previousRounds).fill(0) : undefined,
      joinedAtRound: gameState.currentRound,
      isActive: true,
    };

    const playerOrder = gameState.players.length;

    setGameState(prev => ({
      ...prev,
      players: [...prev.players, newPlayer],
    }));

    // Save player join to database (state will sync via useEffect)
    await handlePlayerJoin(newPlayer, playerOrder);
  };

  const handleTogglePlayerActive = async (playerId: string) => {
    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    const player = gameState.players[playerIndex];
    const newIsActive = !player.isActive;
    const gaveUpAtRound = newIsActive ? player.gaveUpAtRound : gameState.currentRound;

    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => {
        if (p.id !== playerId) return p;

        // Player is giving up
        if (p.isActive) {
          return {
            ...p,
            isActive: false,
            gaveUpAtRound: prev.currentRound
          };
        }

        // Player is rejoining
        return {
          ...p,
          isActive: true,
          joinedAtRound: prev.currentRound, // Track when they rejoined
          gaveUpAtRound: p.gaveUpAtRound // Keep the gave up round for graph gap
        };
      }),
    }));

    // Save status change to database (state will sync via useEffect)
    await handlePlayerStatusChange(playerIndex, newIsActive, gaveUpAtRound);
  };

  const handleHighScoreWinsChange = (highScoreWins: boolean) => {
    setGameState(prev => ({
      ...prev,
      highScoreWins,
    }));
  };

  const handleFinishGame = async () => {
    setGameState(prev => ({
      ...prev,
      isGameFinished: true,
    }));
    setGamePhase('results');

    // Finalize game in database (state will sync via useEffect)
    await finishGame({
      players: gameState.players,
      totalRounds: gameState.currentRound - 1,
      highScoreWins: gameState.highScoreWins,
      language: gameState.language,
      isDualScoring: gameState.isDualScoring,
      // AI analysis will be added later when generated
    });
  };

  const handlePlayAgain = () => {
    // Reset persistence for new game
    resetPersistence();

    // Reset scores but keep players and settings
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(player => ({
        ...player,
        totalScore: 0,
        scores: [],
        predictions: prev.isDualScoring ? [] : undefined,
        isActive: true,
        gaveUpAtRound: undefined,
        joinedAtRound: 1, // Reset to starting from round 1
      })),
      currentRound: 1,
      isGameFinished: false,
      gameId: null,
      isSyncing: false,
      lastSyncedRound: 0,
      syncError: null,
      playerIdentities: [],
    }));
    setGamePhase('playing');

    // Initialize new game in database
    initializeGame({
      players: gameState.players.map(player => ({
        ...player,
        totalScore: 0,
        scores: [],
        predictions: gameState.isDualScoring ? [] : undefined,
        isActive: true,
        gaveUpAtRound: undefined,
        joinedAtRound: 1,
      })),
      language: gameState.language,
      isDualScoring: gameState.isDualScoring,
      highScoreWins: gameState.highScoreWins,
    });
  };

  const handleNewGame = () => {
    // Reset persistence
    resetPersistence();

    setGamePhase('setup');
    setGameState({
      players: [],
      currentRound: 1,
      isDualScoring: false,
      isGameFinished: false,
      language: preferences?.preferred_language || 'en',
      highScoreWins: preferences?.preferred_high_score_wins ?? true,
      gameId: null,
      isSyncing: false,
      lastSyncedRound: 0,
      syncError: null,
      playerIdentities: [],
    });
  };

  return (
    <>
      {gamePhase === 'setup' && (
        <SetupScreen onStartGame={handleStartGame} />
      )}
      {gamePhase === 'playing' && (
        <GameScreen
          players={gameState.players}
          currentRound={gameState.currentRound}
          isDualScoring={gameState.isDualScoring}
          language={gameState.language as Language}
          highScoreWins={gameState.highScoreWins}
          onScoreSubmit={handleScoreSubmit}
          onNextRound={handleNextRound}
          onPreviousRound={handlePreviousRound}
          onAddPlayer={handleAddPlayer}
          onFinishGame={handleFinishGame}
          onTogglePlayerActive={handleTogglePlayerActive}
          onHighScoreWinsChange={handleHighScoreWinsChange}
          isSyncing={persistenceState.isSyncing}
          syncError={persistenceState.syncError}
          lastSyncedRound={persistenceState.lastSyncedRound}
        />
      )}
      {gamePhase === 'results' && (
        <ResultsScreen
          players={gameState.players}
          totalRounds={gameState.currentRound - 1}
          onNewGame={handleNewGame}
          onPlayAgain={handlePlayAgain}
          language={gameState.language as Language}
          highScoreWins={gameState.highScoreWins}
        />
      )}
    </>
  );
};

export default Index;
