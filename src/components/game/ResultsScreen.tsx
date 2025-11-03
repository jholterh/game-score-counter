import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Player } from "@/types/game";
import { ScoreGraph } from "./ScoreGraph";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ResultsScreenProps {
  players: Player[];
  totalRounds: number;
  onNewGame: () => void;
  language: string;
}

const ANALYSIS_THEMES = [
  "Sarcastic Sports Commentator - Over-the-top sports analysis with dramatic play-by-play commentary and backhanded compliments",
  "Brutally Honest Friend - No filter, calls out mistakes directly but in a funny way, roasts everyone equally",
  "Overly Dramatic Narrator - Treats the game like an epic saga with theatrical language and exaggerated stakes",
  "Passive Aggressive - Polite on the surface but with subtle digs and 'interesting' observations about players' choices",
  "Conspiracy Theorist - Finds suspicious patterns, suggests alliances and betrayals, questions every move",
  "Motivational Speaker (Gone Wrong) - Tries to be inspirational but the advice is hilariously bad or misses the point",
  "Shakespeare/Old English - Analyzes the game in flowery, archaic language like it's a historical tragedy or comedy",
  "Robot/AI Learning Emotions - Attempts to understand human competition but gets things amusingly wrong",
  "Trash Talk Master - Friendly roasting with gaming/competitive slang and playful insults",
  "Nature Documentary Narrator - Describes players like animals in the wild, analyzing their 'survival strategies'",
  "Fortune Teller/Mystic - Pretends the results were destined, reads meaning into random events",
  "Dad Jokes Enthusiast - Incorporates terrible puns and dad humor into the analysis"
];

export const ResultsScreen = ({ players, totalRounds, onNewGame, language }: ResultsScreenProps) => {
  const [analysis, setAnalysis] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>("");

  const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);
  const winner = sortedPlayers[0];

  const generateAnalysis = async () => {
    try {
      setIsLoading(true);
      const randomTheme = ANALYSIS_THEMES[Math.floor(Math.random() * ANALYSIS_THEMES.length)];
      setSelectedTheme(randomTheme);
      
      // Prepare game data for analysis
      const gameData = {
        players: players.map(p => ({
          name: p.name,
          totalScore: p.totalScore,
          scores: p.scores,
          joinedAtRound: p.joinedAtRound
        })),
        totalRounds,
        theme: randomTheme,
        language
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
          
          {!analysis && !isLoading && (
            <div className="text-center py-6 sm:py-8">
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                Ready for some entertaining commentary on the game?
              </p>
              <Button onClick={generateAnalysis} size="lg" className="gap-2">
                <Sparkles className="h-5 w-5" />
                Generate Analysis
              </Button>
            </div>
          )}
          
          {isLoading && (
            <div className="text-center py-6 sm:py-8">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-xs sm:text-sm text-muted-foreground italic">
                Channeling {selectedTheme.split(' - ')[0]}...
              </p>
            </div>
          )}
          
          {analysis && !isLoading && (
            <div>
              <div className="text-xs sm:text-sm text-muted-foreground mb-3 italic">
                Theme: {selectedTheme.split(' - ')[0]}
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-sm sm:text-base text-foreground leading-relaxed">
                  {analysis}
                </p>
              </div>
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
