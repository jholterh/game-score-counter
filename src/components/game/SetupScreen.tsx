import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Plus, Minus } from "lucide-react";

interface SetupScreenProps {
  onStartGame: (playerNames: string[], isDualScoring: boolean, language: string) => void;
}

export const SetupScreen = ({ onStartGame }: SetupScreenProps) => {
  const [playerCount, setPlayerCount] = useState(2);
  const [playerNames, setPlayerNames] = useState<string[]>(["", ""]);
  const [isDualScoring, setIsDualScoring] = useState(false);
  const [language, setLanguage] = useState("en");

  const handlePlayerCountChange = (newCount: number) => {
    if (newCount < 2 || newCount > 10) return;
    
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
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleStart = () => {
    const finalNames = playerNames.map((name, index) => 
      name.trim() || `Player ${index + 1}`
    );
    onStartGame(finalNames, isDualScoring, language);
  };

  return (
    <div className="min-h-screen bg-gradient-game flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 animate-scale-in shadow-elevated">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Game Score Counter
            </h1>
            <p className="text-muted-foreground">Set up your game to get started</p>
          </div>

          <div className="space-y-6">
            {/* Language Selection */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold">Language</Label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="it">Italiano</option>
                <option value="pt">Português</option>
                <option value="nl">Nederlands</option>
                <option value="pl">Polski</option>
                <option value="ru">Русский</option>
                <option value="ja">日本語</option>
                <option value="zh">中文</option>
                <option value="ar">العربية</option>
              </select>
            </div>

            {/* Player Count */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold">Number of Players</Label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePlayerCountChange(playerCount - 1)}
                  disabled={playerCount <= 2}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="flex-1 text-center">
                  <span className="text-3xl font-bold">{playerCount}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePlayerCountChange(playerCount + 1)}
                  disabled={playerCount >= 10}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Player Names */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold">Player Names</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {playerNames.map((name, index) => (
                  <Input
                    key={index}
                    value={name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    placeholder={`Player ${index + 1}`}
                    className="transition-all focus:scale-105"
                  />
                ))}
              </div>
            </div>

            {/* Dual Scoring Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="dual-scoring" className="font-semibold">
                  Dual Scoring Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Track both scores and predictions (e.g., for Wizard)
                </p>
              </div>
              <Switch
                id="dual-scoring"
                checked={isDualScoring}
                onCheckedChange={setIsDualScoring}
              />
            </div>
          </div>

          <Button
            onClick={handleStart}
            className="w-full h-14 text-lg font-semibold"
            size="lg"
          >
            Start Game
          </Button>
        </div>
      </Card>
    </div>
  );
};
