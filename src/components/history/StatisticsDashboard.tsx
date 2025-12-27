import { Card } from '@/components/ui/card';
import { Trophy, Target, TrendingUp, Gamepad2, Calendar, Award } from 'lucide-react';

interface StatisticsDashboardProps {
  totalGames: number;
  totalWins: number;
  totalRounds: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  favoriteGameMode: string;
  lastPlayedDate: Date | null;
}

export const StatisticsDashboard = ({
  totalGames,
  totalWins,
  totalRounds,
  averageScore,
  highestScore,
  lowestScore,
  favoriteGameMode,
  lastPlayedDate,
}: StatisticsDashboardProps) => {
  const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
  const avgRoundsPerGame = totalGames > 0 ? Math.round(totalRounds / totalGames) : 0;

  const stats = [
    {
      icon: Gamepad2,
      label: 'Total Games',
      value: totalGames.toString(),
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Trophy,
      label: 'Games Won',
      value: totalWins.toString(),
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      icon: Target,
      label: 'Win Rate',
      value: `${winRate}%`,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Avg Score',
      value: averageScore.toFixed(0),
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Award,
      label: 'Highest Score',
      value: highestScore.toString(),
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: Calendar,
      label: 'Avg Rounds/Game',
      value: avgRoundsPerGame.toString(),
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Your Statistics</h2>
        {lastPlayedDate && (
          <p className="text-sm text-muted-foreground">
            Last played: {lastPlayedDate.toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Rounds Played</h3>
          <p className="text-3xl font-bold text-white">{totalRounds}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Favorite Mode</h3>
          <p className="text-2xl font-bold text-white">
            {favoriteGameMode === 'dual' ? 'Dual Scoring' : 'Standard'}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Score Range</h3>
          <p className="text-xl font-bold text-white">
            {lowestScore} - {highestScore}
          </p>
        </Card>
      </div>
    </div>
  );
};
