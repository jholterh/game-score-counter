import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Player, RoundScore } from "@/types/game";
import { PlayerScoreCard } from "./PlayerScoreCard";
import { ScoreGraph } from "./ScoreGraph";
import { ChevronLeft, ChevronRight, Plus, Flag } from "lucide-react";
import { toast } from "sonner";

interface GameScreenProps {
  players: Player[];
  currentRound: number;
  isDualScoring: boolean;
  onScoreSubmit: (scores: RoundScore[]) => void;
  onNextRound: () => void;
  onPreviousRound: () => void;
  onAddPlayer: (name: string, startingScore: number) => void;
  onFinishGame: () => void;
}

export const GameScreen = ({
  players,
  currentRound,
  isDualScoring,
  onScoreSubmit,
  onNextRound,
  onPreviousRound,
  onAddPlayer,
  onFinishGame,
}: GameScreenProps) => {
  const [roundScores, setRoundScores] = useState<Record<string, { score: string; prediction: string }>>({});
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerScore, setNewPlayerScore] = useState("");
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  
  // Calculate reference scores for new player
  const worstScore = currentRound > 1 ? Math.min(...players.map(p => p.totalScore)) : 0;
  const avgScore = currentRound > 1 ? Math.round(players.reduce((sum, p) => sum + p.totalScore, 0) / players.length) : 0;

  const handleScoreChange = (playerId: string, value: string, type: 'score' | 'prediction') => {
    setRoundScores(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [type]: value
      }
    }));
  };

  const handleSubmitRound = () => {
    const scores: RoundScore[] = players.map(player => {
      const scoreValue = roundScores[player.id]?.score;
      const predictionValue = roundScores[player.id]?.prediction;
      
      return {
        playerId: player.id,
        score: parseFloat(scoreValue) || 0,
        prediction: isDualScoring ? (parseFloat(predictionValue) || 0) : undefined,
      };
    });

    onScoreSubmit(scores);
    onNextRound();
    setRoundScores({});
    toast.success(`Round ${currentRound} scores saved!`);
  };

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) {
      toast.error("Please enter a player name");
      return;
    }
    const score = currentRound === 1 ? 0 : parseFloat(newPlayerScore || "0");
    onAddPlayer(newPlayerName, score);
    setNewPlayerName("");
    setNewPlayerScore("");
    setIsAddPlayerOpen(false);
    toast.success(`${newPlayerName} joined the game!`);
  };

  const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="min-h-screen bg-gradient-game p-3 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
        {/* Header */}
        <Card className="p-4 sm:p-6 shadow-elevated">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Round {currentRound}</h1>
              <p className="text-sm sm:text-base text-muted-foreground">{players.length} players</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isAddPlayerOpen} onOpenChange={setIsAddPlayerOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Player Mid-Game</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Player Name</Label>
                      <Input
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        placeholder="Enter name"
                      />
                    </div>
                    <div>
                      <Label>Starting Score {currentRound === 1 ? "(Must be 0)" : ""}</Label>
                      <Input
                        type="number"
                        value={currentRound === 1 ? "" : newPlayerScore}
                        onChange={(e) => setNewPlayerScore(e.target.value)}
                        placeholder="0"
                        disabled={currentRound === 1}
                      />
                      {currentRound > 1 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Reference: Worst player has {worstScore} pts, Average is {avgScore} pts
                        </p>
                      )}
                    </div>
                    <Button onClick={handleAddPlayer} className="w-full">
                      Add Player
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={onFinishGame} variant="secondary" size="sm" className="sm:size-default">
                <Flag className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Finish Game</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Current Standings Graph */}
        <ScoreGraph players={players} currentRound={currentRound} />

        {/* Score Entry */}
        <Card className="p-4 sm:p-6 shadow-card">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Enter Scores for Round {currentRound}</h2>
          <div className="space-y-3 sm:space-y-4">
            {players.map(player => (
              <div key={player.id} className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
                <Label className="font-semibold text-sm sm:text-base">{player.name}</Label>
                <div>
                  <Label className="text-sm text-muted-foreground">Score</Label>
                  <Input
                    type="number"
                    value={roundScores[player.id]?.score || ""}
                    onChange={(e) => handleScoreChange(player.id, e.target.value, 'score')}
                    placeholder="0"
                  />
                </div>
                {isDualScoring && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Prediction</Label>
                    <Input
                      type="number"
                      value={roundScores[player.id]?.prediction || ""}
                      onChange={(e) => handleScoreChange(player.id, e.target.value, 'prediction')}
                      placeholder="0"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            onClick={onPreviousRound}
            disabled={currentRound === 1}
            variant="outline"
            className="flex-1"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous Round
          </Button>
          <Button
            onClick={handleSubmitRound}
            className="flex-1"
          >
            Save & Next Round
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
