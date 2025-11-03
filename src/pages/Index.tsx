import { useState } from "react";
import { SetupScreen } from "@/components/game/SetupScreen";
import { GameScreen } from "@/components/game/GameScreen";
import { ResultsScreen } from "@/components/game/ResultsScreen";
import { Player, GameState, RoundScore } from "@/types/game";

type GamePhase = 'setup' | 'playing' | 'results';

const Index = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentRound: 1,
    isDualScoring: false,
    isGameFinished: false,
  });

  const handleStartGame = (playerNames: string[], isDualScoring: boolean) => {
    const players: Player[] = playerNames.map((name, index) => ({
      id: `player-${index}`,
      name,
      totalScore: 0,
      scores: [],
      predictions: isDualScoring ? [] : undefined,
      joinedAtRound: 1,
    }));

    setGameState({
      players,
      currentRound: 1,
      isDualScoring,
      isGameFinished: false,
    });
    setGamePhase('playing');
  };

  const handleScoreSubmit = (scores: RoundScore[]) => {
    setGameState(prev => {
      const updatedPlayers = prev.players.map(player => {
        const roundScore = scores.find(s => s.playerId === player.id);
        if (!roundScore) return player;

        const newScores = [...player.scores];
        const roundIndex = prev.currentRound - 1;
        newScores[roundIndex] = roundScore.score;

        const newPredictions = player.predictions ? [...player.predictions] : undefined;
        if (newPredictions && roundScore.prediction !== undefined) {
          newPredictions[roundIndex] = roundScore.prediction;
        }

        return {
          ...player,
          scores: newScores,
          predictions: newPredictions,
          totalScore: newScores.reduce((sum, score) => sum + score, 0),
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
    };

    setGameState(prev => ({
      ...prev,
      players: [...prev.players, newPlayer],
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
          onScoreSubmit={handleScoreSubmit}
          onNextRound={handleNextRound}
          onPreviousRound={handlePreviousRound}
          onAddPlayer={handleAddPlayer}
          onFinishGame={handleFinishGame}
        />
      )}
      {gamePhase === 'results' && (
        <ResultsScreen
          players={gameState.players}
          totalRounds={gameState.currentRound - 1}
          onNewGame={handleNewGame}
        />
      )}
    </>
  );
};

export default Index;
