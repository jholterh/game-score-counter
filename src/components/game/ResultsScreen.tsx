import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Player } from "@/types/game";
import { PlayerScoreCard } from "./PlayerScoreCard";
import { ScoreGraph } from "./ScoreGraph";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ResultsScreenProps {
  players: Player[];
  totalRounds: number;
  onNewGame: () => void;
}

export const ResultsScreen = ({ players, totalRounds, onNewGame }: ResultsScreenProps) => {
  const [analysis, setAnalysis] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);
  const winner = sortedPlayers[0];
  const lastPlace = sortedPlayers[sortedPlayers.length - 1];

  useEffect(() => {
    generateAnalysis();
  }, []);

  const generateAnalysis = async () => {
    try {
      setIsLoading(true);
      
      // Prepare game data for analysis
      const gameData = {
        players: players.map(p => ({
          name: p.name,
          totalScore: p.totalScore,
          scores: p.scores,
          joinedAtRound: p.joinedAtRound
        })),
        totalRounds
      };

      const { data, error } = await supabase.functions.invoke('analyze-game', {
        body: gameData
      });

      if (error) throw error;
      
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast.error("Failed to generate game analysis");
      setAnalysis("Unable to generate analysis at this time. The game was epic nonetheless!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-game p-3 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
        {/* Winner Announcement */}
        <Card className="p-6 sm:p-8 text-center bg-gradient-winner shadow-elevated">
          <div className="space-y-3 sm:space-y-4">
            <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-secondary-foreground animate-celebrate" />
            <h1 className="text-3xl sm:text-5xl font-bold text-secondary-foreground">
              {winner.name} Wins!
            </h1>
            <p className="text-xl sm:text-2xl text-secondary-foreground/90">
              Final Score: {winner.totalScore} points
            </p>
            <p className="text-base sm:text-lg text-secondary-foreground/80">
              in {totalRounds} rounds
            </p>
          </div>
        </Card>

        {/* Final Standings */}
        <ScoreGraph players={players} currentRound={totalRounds + 1} />

        {/* AI Analysis */}
        <Card className="p-4 sm:p-6 shadow-card">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <h2 className="text-lg sm:text-xl font-semibold">Game Analysis</h2>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-6 sm:py-8">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
              <span className="ml-3 text-sm sm:text-base text-muted-foreground">Analyzing your game...</span>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-sm sm:text-base text-foreground leading-relaxed">{analysis}</p>
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="flex gap-4 pb-4">
          <Button onClick={onNewGame} className="flex-1" size="lg">
            Start New Game
          </Button>
        </div>
      </div>
    </div>
  );
};
