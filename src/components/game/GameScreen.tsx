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
import { LanguageSelector } from "@/components/LanguageSelector";
import { translations, Language, formatTranslation } from "@/lib/translations";

interface GameScreenProps {
  players: Player[];
  currentRound: number;
  isDualScoring: boolean;
  language: Language;
  onScoreSubmit: (scores: RoundScore[]) => void;
  onNextRound: () => void;
  onPreviousRound: () => void;
  onAddPlayer: (name: string, startingScore: number) => void;
  onFinishGame: () => void;
  onTogglePlayerActive: (playerId: string) => void;
}

export const GameScreen = ({
  players,
  currentRound,
  isDualScoring,
  language,
  onScoreSubmit,
  onNextRound,
  onPreviousRound,
  onAddPlayer,
  onFinishGame,
  onTogglePlayerActive,
}: GameScreenProps) => {
  const [roundScores, setRoundScores] = useState<Record<string, { score: string; prediction: string }>>({});
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerScore, setNewPlayerScore] = useState("");
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  
  const t = translations[language].gameScreen;
  
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
    const scores: RoundScore[] = players
      .filter(player => player.isActive)
      .map(player => {
        const scoreValue = roundScores[player.id]?.score;
        const predictionValue = roundScores[player.id]?.prediction;
        
        return {
          playerId: player.id,
          score: parseFloat(scoreValue || "0"),
          prediction: isDualScoring ? parseFloat(predictionValue || "0") : undefined,
        };
      });

    onScoreSubmit(scores);
    onNextRound();
    setRoundScores({});
    toast.success(formatTranslation(t.roundSaved, { round: currentRound.toString() }));
  };

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) {
      toast.error(t.enterPlayerName);
      return;
    }
    const score = currentRound === 1 ? 0 : parseFloat(newPlayerScore || "0");
    onAddPlayer(newPlayerName, score);
    setNewPlayerName("");
    setNewPlayerScore("");
    setIsAddPlayerOpen(false);
    toast.success(formatTranslation(t.joinedGame, { name: newPlayerName }));
  };

  const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="min-h-screen bg-gradient-game p-3 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
        {/* Header */}
        <Card className="p-4 sm:p-6 shadow-elevated">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{t.round} {currentRound}</h1>
              <p className="text-sm sm:text-base text-muted-foreground">{players.length} {t.players}</p>
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
                    <DialogTitle>{t.addPlayer}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>{t.playerName}</Label>
                      <Input
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        placeholder={t.enterName}
                      />
                    </div>
                    <div>
                      <Label>{t.startingScore} {currentRound === 1 ? t.mustBeZero : ""}</Label>
                      <Input
                        type="number"
                        value={currentRound === 1 ? "" : newPlayerScore}
                        onChange={(e) => setNewPlayerScore(e.target.value)}
                        placeholder="0"
                        disabled={currentRound === 1}
                      />
                      {currentRound > 1 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTranslation(t.reference, { worst: worstScore.toString(), avg: avgScore.toString() })}
                        </p>
                      )}
                    </div>
                    <Button onClick={handleAddPlayer} className="w-full">
                      {t.addPlayer}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={onFinishGame} variant="secondary" size="sm" className="sm:size-default">
                <Flag className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{t.finishGame}</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Current Standings Graph */}
        <ScoreGraph players={players} currentRound={currentRound} language={language} />

        {/* Score Entry */}
        <Card className="p-4 sm:p-6 shadow-card">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{t.enterScores} {currentRound}</h2>
          <div className="space-y-3 sm:space-y-4">
            {players.map(player => (
              <div key={player.id} className={`flex gap-2 sm:gap-4 items-end ${!player.isActive ? 'opacity-50' : ''}`}>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-${isDualScoring ? '3' : '2'} gap-2 sm:gap-4">
                  <div>
                    <Label className="font-semibold text-sm sm:text-base">{player.name}</Label>
                    {!player.isActive && <span className="text-xs text-muted-foreground ml-2">({t.inactive})</span>}
                  </div>
                  {player.isActive ? (
                    <>
                      <div>
                        <Label className="text-sm text-muted-foreground">{t.score}</Label>
                        <Input
                          type="number"
                          value={roundScores[player.id]?.score || ""}
                          onChange={(e) => handleScoreChange(player.id, e.target.value, 'score')}
                          placeholder="0"
                        />
                      </div>
                      {isDualScoring && (
                        <div>
                          <Label className="text-sm text-muted-foreground">{t.prediction}</Label>
                          <Input
                            type="number"
                            value={roundScores[player.id]?.prediction || ""}
                            onChange={(e) => handleScoreChange(player.id, e.target.value, 'prediction')}
                            placeholder="0"
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="col-span-2 text-sm text-muted-foreground flex items-center">
                      {t.playerGaveUp}
                    </div>
                  )}
                </div>
                <Button
                  variant={player.isActive ? "destructive" : "secondary"}
                  size="sm"
                  onClick={() => onTogglePlayerActive(player.id)}
                  className="text-xs px-3 py-1 h-9 whitespace-nowrap"
                >
                  {player.isActive ? t.giveUp : t.rejoin}
                </Button>
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
            {t.previousRound}
          </Button>
          <Button
            onClick={handleSubmitRound}
            className="flex-1"
          >
            {t.saveNextRound}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
