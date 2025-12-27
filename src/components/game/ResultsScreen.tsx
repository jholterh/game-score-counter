import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Player } from "@/types/game";
import { ScoreGraph } from "./ScoreGraph";
import { Loader2, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { translations, Language, formatTranslation } from "@/lib/translations";
import { TextToSpeech } from "@/components/TextToSpeech";

interface ResultsScreenProps {
  players: Player[];
  totalRounds: number;
  onNewGame: () => void;
  onPlayAgain: () => void;
  language: Language;
  highScoreWins: boolean;
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

const THEME_NAMES = [
  "Sarcastic Sports Commentator",
  "Brutally Honest Friend",
  "Overly Dramatic Narrator",
  "Passive Aggressive",
  "Conspiracy Theorist",
  "Motivational Speaker (Gone Wrong)",
  "Shakespeare/Old English",
  "Robot/AI Learning Emotions",
  "Trash Talk Master",
  "Nature Documentary Narrator",
  "Fortune Teller/Mystic",
  "Dad Jokes Enthusiast"
];

export const ResultsScreen = ({ players, totalRounds, onNewGame, onPlayAgain, language, highScoreWins }: ResultsScreenProps) => {
  const [analysis, setAnalysis] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [themePreference, setThemePreference] = useState<string>("random"); // "random" or index as string
  const [audioRef, setAudioRef] = useState<{ stop: () => void } | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const t = translations[language].resultsScreen;
  // Sort players based on whether high or low score wins
  const sortedPlayers = [...players].sort((a, b) =>
    highScoreWins ? b.totalScore - a.totalScore : a.totalScore - b.totalScore
  );
  const winner = sortedPlayers[0];
  const maxScore = Math.max(...sortedPlayers.map(p => Math.abs(p.totalScore)));

  const handleNewGame = () => {
    if (audioRef) {
      audioRef.stop();
    }
    onNewGame();
  };

  const generateAnalysis = async () => {
    try {
      setIsLoading(true);
      setShowAnalysis(true);

      // Use selected theme or pick random
      const themeToUse = themePreference === "random"
        ? ANALYSIS_THEMES[Math.floor(Math.random() * ANALYSIS_THEMES.length)]
        : ANALYSIS_THEMES[parseInt(themePreference)];

      setSelectedTheme(themeToUse);

      // Prepare game data for analysis
      const gameData = {
        players: players.map(p => ({
          name: p.name,
          totalScore: p.totalScore,
          scores: p.scores,
          joinedAtRound: p.joinedAtRound,
          isActive: p.isActive,
          gaveUpAtRound: p.gaveUpAtRound,
        })),
        totalRounds,
        theme: themeToUse,
        language,
        highScoreWins,
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
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
        {/* Winner Announcement */}
        <div className="text-center space-y-6 py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-semibold text-white">
              {winner.name}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              Wins!
            </p>
          </div>
          <div className="flex items-center justify-center gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-mono font-semibold text-primary">
                {winner.totalScore}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide mt-1">
                Points
              </div>
            </div>
            <div className="w-px h-12 bg-border" />
            <div>
              <div className="text-4xl md:text-5xl font-mono font-semibold text-white">
                {totalRounds}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide mt-1">
                Rounds
              </div>
            </div>
          </div>
        </div>

        {/* Final Performance Graph */}
        <Card className="p-6">
          <h2 className="text-base font-medium text-muted-foreground uppercase tracking-wide mb-6">
            Final Performance
          </h2>
          <ScoreGraph players={players} currentRound={totalRounds + 1} language={language} />
        </Card>

        {/* Final Standings with Bar Chart */}
        <Card className="p-6">
          <h2 className="text-base font-medium text-muted-foreground uppercase tracking-wide mb-6">
            Final Standings
          </h2>
          <div className="space-y-4">
            {sortedPlayers.map((player, index) => {
              const percentage = maxScore > 0 ? (Math.abs(player.totalScore) / maxScore) * 100 : 0;
              const isWinner = index === 0;

              return (
                <div key={player.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-8">
                        {index + 1}{index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'}
                      </span>
                      <span className="font-medium text-white">
                        {player.name}
                      </span>
                      {isWinner && (
                        <Trophy className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xl font-semibold text-white">
                        {player.totalScore}
                      </span>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="relative h-2 bg-[hsl(var(--bg-elevated))] rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
                        isWinner ? 'bg-gradient-blue' : 'bg-primary/60'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* AI Analysis */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium text-muted-foreground uppercase tracking-wide">
              {t.gameAnalysis}
            </h2>
            {analysis && <TextToSpeech text={analysis} language={language} theme={selectedTheme} onAudioRefChange={setAudioRef} autoPreload={true} />}
          </div>

          {!showAnalysis && !isLoading && (
            <div className="text-center py-8 space-y-4">
              <p className="text-sm text-muted-foreground">
                {t.readyForAnalysis}
              </p>
              <div className="max-w-md mx-auto">
                <Select value={themePreference} onValueChange={setThemePreference}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select narrator style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">Random (Surprise me!)</SelectItem>
                    {THEME_NAMES.map((name, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={generateAnalysis} variant="outline" className="gap-2">
                {t.generateAnalysis}
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {formatTranslation(t.channeling, { theme: selectedTheme.split(' - ')[0] })}
              </p>
            </div>
          )}

          {analysis && !isLoading && showAnalysis && (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground italic">
                {formatTranslation(t.theme, { theme: selectedTheme.split(' - ')[0] })}
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed">
                  {analysis}
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pb-8">
          <Button onClick={onPlayAgain} size="lg" className="min-w-[200px]" variant="default">
            {t.playAgain}
          </Button>
          <Button onClick={handleNewGame} size="lg" className="min-w-[200px]" variant="outline">
            {t.startNewGame}
          </Button>
        </div>
      </div>
    </div>
  );
};
