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
  const [newPlayerScore, setNewPlayerScore] = useState("0");
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);

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
    const scores: RoundScore[] = players.map(player => ({
      playerId: player.id,
      score: parseFloat(roundScores[player.id]?.score || "0"),
      prediction: isDualScoring ? parseFloat(roundScores[player.id]?.prediction || "0") : undefined,
    }));

    onScoreSubmit(scores);
    setRoundScores({});
    toast.success(`Round ${currentRound} scores saved!`);
  };

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) {
      toast.error("Please enter a player name");
      return;
    }
    onAddPlayer(newPlayerName, parseFloat(newPlayerScore) || 0);
    setNewPlayerName("");
    setNewPlayerScore("0");
    setIsAddPlayerOpen(false);
    toast.success(`${newPlayerName} joined the game!`);
  };

  const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="min-h-screen bg-gradient-game p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <Card className="p-6 shadow-elevated">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Round {currentRound}</h1>
              <p className="text-muted-foreground">{players.length} players</p>
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
                      <Label>Starting Score</Label>
                      <Input
                        type="number"
                        value={newPlayerScore}
                        onChange={(e) => setNewPlayerScore(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <Button onClick={handleAddPlayer} className="w-full">
                      Add Player
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={onFinishGame} variant="secondary">
                <Flag className="h-4 w-4 mr-2" />
                Finish Game
              </Button>
            </div>
          </div>
        </Card>

        {/* Score Graph */}
        {currentRound > 1 && <ScoreGraph players={players} currentRound={currentRound} />}

        {/* Current Standings */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Current Standings</h2>
          <div className="grid gap-3">
            {sortedPlayers.map((player, index) => (
              <PlayerScoreCard
                key={player.id}
                player={player}
                rank={index + 1}
                isDualScoring={isDualScoring}
              />
            ))}
          </div>
        </div>

        {/* Score Entry */}
        <Card className="p-6 shadow-card">
          <h2 className="text-xl font-semibold mb-4">Enter Scores for Round {currentRound}</h2>
          <div className="space-y-4">
            {players.map(player => (
              <div key={player.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <Label className="font-semibold">{player.name}</Label>
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
