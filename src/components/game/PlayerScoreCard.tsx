import { Card } from "@/components/ui/card";
import { Player } from "@/types/game";
import { Trophy } from "lucide-react";

interface PlayerScoreCardProps {
  player: Player;
  rank?: number;
  isDualScoring: boolean;
  isWinner?: boolean;
}

export const PlayerScoreCard = ({ 
  player, 
  rank, 
  isDualScoring,
  isWinner = false 
}: PlayerScoreCardProps) => {
  return (
    <Card className={`p-4 transition-all hover:scale-105 ${
      isWinner ? 'bg-gradient-winner shadow-elevated animate-celebrate' : 'shadow-card'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {rank && (
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
              rank === 1 ? 'bg-secondary text-secondary-foreground' :
              rank === 2 ? 'bg-muted text-muted-foreground' :
              'bg-muted/50 text-muted-foreground'
            }`}>
              {rank}
            </div>
          )}
          {isWinner && <Trophy className="h-6 w-6 text-secondary-foreground" />}
          <div>
            <h3 className="font-semibold text-lg">{player.name}</h3>
            {isDualScoring && player.predictions && player.predictions.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Last prediction: {player.predictions[player.predictions.length - 1]}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{player.totalScore}</div>
          <div className="text-xs text-muted-foreground">points</div>
        </div>
      </div>
    </Card>
  );
};
