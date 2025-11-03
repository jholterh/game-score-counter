import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Plus, Minus } from "lucide-react";

interface SetupScreenProps {
  onStartGame: (playerNames: string[], isDualScoring: boolean) => void;
}

export const SetupScreen = ({ onStartGame }: SetupScreenProps) => {
  const [playerCount, setPlayerCount] = useState(2);
  const [playerNames, setPlayerNames] = useState<string[]>(["Player 1", "Player 2"]);
  const [isDualScoring, setIsDualScoring] = useState(false);

  const handlePlayerCountChange = (newCount: number) => {
    if (newCount < 2 || newCount > 10) return;
    
    const newNames = [...playerNames];
    if (newCount > playerCount) {
      // Add new players
      for (let i = playerCount; i < newCount; i++) {
        newNames.push(`Player ${i + 1}`);
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
    if (playerNames.some(name => !name.trim())) {
      return; // Don't start if any name is empty
    }
    onStartGame(playerNames, isDualScoring);
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
