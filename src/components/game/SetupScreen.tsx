import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Plus, Minus } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/hooks/useAuth";
import { translations, Language, getTranslation, formatTranslation } from "@/lib/translations";
import { validatePlayerName, validatePlayerCount, sanitizeString } from "@/lib/validation";
import { toast } from "sonner";

interface SetupScreenProps {
  onStartGame: (playerNames: string[], isDualScoring: boolean, language: string, highScoreWins: boolean) => void;
}

export const SetupScreen = ({ onStartGame }: SetupScreenProps) => {
  const [playerCount, setPlayerCount] = useState(2);
  const [playerNames, setPlayerNames] = useState<string[]>(["", ""]);
  const [isDualScoring, setIsDualScoring] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [highScoreWins, setHighScoreWins] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const t = translations[language].setupScreen;

  const handleGoogleSignIn = async () => {
    try {
      setIsLoggingIn(true);
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in with Google");
      setIsLoggingIn(false);
    }
  };

  const handlePlayerCountChange = (newCount: number) => {
    const validation = validatePlayerCount(newCount);
    if (!validation.valid) return;

    const newNames = [...playerNames];
    if (newCount > playerCount) {
      // Add new players
      for (let i = playerCount; i < newCount; i++) {
        newNames.push("");
      }
    } else {
      // Remove players
      newNames.splice(newCount);
    }

    setPlayerCount(newCount);
    setPlayerNames(newNames);
  };

  const handleNameChange = (index: number, name: string) => {
    const sanitized = sanitizeString(name);
    const newNames = [...playerNames];
    newNames[index] = sanitized;
    setPlayerNames(newNames);
  };

  const handleStart = () => {
    const finalNames = playerNames.map((name, index) => {
      const trimmed = name.trim();
      if (!trimmed) {
        return `${t.playerPlaceholder} ${index + 1}`;
      }
      const validation = validatePlayerName(trimmed);
      return validation.valid ? trimmed : `${t.playerPlaceholder} ${index + 1}`;
    });
    onStartGame(finalNames, isDualScoring, language, highScoreWins);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
        <LanguageSelector
          currentLanguage={language}
          onLanguageChange={setLanguage}
        />
        {!loading && (
          user ? (
            <UserMenu user={user} onSignOut={signOut} />
          ) : (
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoggingIn}
              variant="outline"
              size="sm"
            >
              {isLoggingIn ? "Signing in..." : "Sign in with Google"}
            </Button>
          )
        )}
      </div>

      <Card className="w-full max-w-2xl p-8 lg:p-12 animate-fade-in">
        <div className="space-y-10">
          <div className="text-center space-y-3">
            <h1 className="text-4xl lg:text-5xl font-semibold text-white">
              {t.title}
            </h1>
            <p className="text-muted-foreground text-lg">{t.subtitle}</p>
          </div>

          <div className="space-y-8">
            {/* Player Count */}
            <Card className="p-6">
              <div className="space-y-4">
                <Label className="text-base font-medium text-muted-foreground uppercase tracking-wide">{t.numberOfPlayers}</Label>
                <div className="flex items-center justify-center gap-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePlayerCountChange(playerCount - 1)}
                    disabled={playerCount <= 2}
                    aria-label="Decrease player count"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="min-w-[80px] text-center">
                    <span className="text-5xl font-semibold font-mono text-white">{playerCount}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePlayerCountChange(playerCount + 1)}
                    disabled={playerCount >= 10}
                    aria-label="Increase player count"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Player Names */}
            <Card className="p-6">
              <div className="space-y-4">
                <Label className="text-base font-medium text-muted-foreground uppercase tracking-wide">{t.playerNames}</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {playerNames.map((name, index) => (
                    <Input
                      key={index}
                      value={name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      placeholder={`${t.playerPlaceholder} ${index + 1}`}
                      aria-label={`Player ${index + 1} name`}
                    />
                  ))}
                </div>
              </div>
            </Card>

            {/* Game Settings */}
            <Card className="p-6">
              <div className="space-y-5">
                <Label className="text-base font-medium text-muted-foreground uppercase tracking-wide">Game Settings</Label>

                {/* Dual Scoring Toggle */}
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div className="space-y-1">
                    <Label htmlFor="dual-scoring" className="font-medium text-white cursor-pointer">
                      {t.dualScoring}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t.dualScoringDesc}
                    </p>
                  </div>
                  <Switch
                    id="dual-scoring"
                    checked={isDualScoring}
                    onCheckedChange={setIsDualScoring}
                  />
                </div>

                {/* Score Direction Toggle */}
                <div className="flex items-center justify-between py-3">
                  <div className="space-y-1">
                    <Label htmlFor="score-direction" className="font-medium text-white cursor-pointer">
                      {t.scoreDirection}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {highScoreWins ? t.highScoreWins : t.lowScoreWins}
                    </p>
                  </div>
                  <Switch
                    id="score-direction"
                    checked={highScoreWins}
                    onCheckedChange={setHighScoreWins}
                  />
                </div>
              </div>
            </Card>
          </div>

          <Button
            onClick={handleStart}
            className="w-full h-14 text-base font-medium"
            size="lg"
          >
            → {t.startGame}
          </Button>
        </div>
      </Card>
    </div>
  );
};
