import { useState } from "react";
import { SetupScreen } from "@/components/game/SetupScreen";
import { GameScreen } from "@/components/game/GameScreen";
import { ResultsScreen } from "@/components/game/ResultsScreen";
import { Player, GameState, RoundScore } from "@/types/game";
import { Language } from "@/lib/translations";

type GamePhase = 'setup' | 'playing' | 'results';

const Index = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentRound: 1,
    isDualScoring: false,
    isGameFinished: false,
    language: 'en',
  });

  const handleStartGame = (playerNames: string[], isDualScoring: boolean, language: string) => {
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
    });
    setGamePhase('playing');
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

  const handleNextRound = () => {
    setGameState(prev => ({
      ...prev,
      currentRound: prev.currentRound + 1,
    }));
  };

  const handlePreviousRound = () => {
    if (gameState.currentRound > 1) {
      setGameState(prev => ({
        ...prev,
        currentRound: prev.currentRound - 1,
      }));
    }
  };

  const handleAddPlayer = (name: string, startingScore: number) => {
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

    setGameState(prev => ({
      ...prev,
      players: [...prev.players, newPlayer],
    }));
  };

  const handleTogglePlayerActive = (playerId: string) => {
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(player => 
        player.id === playerId 
          ? { 
              ...player, 
              isActive: !player.isActive,
              gaveUpAtRound: !player.isActive ? undefined : prev.currentRound
            }
          : player
      ),
    }));
  };

  const handleFinishGame = () => {
    setGameState(prev => ({
      ...prev,
      isGameFinished: true,
    }));
    setGamePhase('results');
  };

  const handleNewGame = () => {
    setGamePhase('setup');
    setGameState({
      players: [],
      currentRound: 1,
      isDualScoring: false,
      isGameFinished: false,
      language: 'en',
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
          onScoreSubmit={handleScoreSubmit}
          onNextRound={handleNextRound}
          onPreviousRound={handlePreviousRound}
          onAddPlayer={handleAddPlayer}
          onFinishGame={handleFinishGame}
          onTogglePlayerActive={handleTogglePlayerActive}
        />
      )}
      {gamePhase === 'results' && (
        <ResultsScreen
          players={gameState.players}
          totalRounds={gameState.currentRound - 1}
          onNewGame={handleNewGame}
          language={gameState.language as Language}
        />
      )}
    </>
  );
};

export default Index;
