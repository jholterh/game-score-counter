import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Player } from "@/types/game";

interface ScoreGraphProps {
  players: Player[];
  currentRound: number;
}

const PLAYER_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // orange
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange-600
  "#14b8a6", // teal
  "#a855f7", // violet
];

export const ScoreGraph = ({ players, currentRound }: ScoreGraphProps) => {
  // Prepare data for the chart
  const rounds = Array.from({ length: currentRound }, (_, i) => i + 1);
  
  const chartData = rounds.map(round => {
    const dataPoint: any = { round };
    players.forEach(player => {
      // Calculate cumulative score up to this round
      const roundIndex = round - 1;
      const cumulativeScore = player.scores
        .slice(0, roundIndex + 1)
        .reduce((sum, score) => sum + score, 0);
      
      // Only add data if player has joined by this round
      if (round >= player.joinedAtRound) {
        dataPoint[player.name] = cumulativeScore;
      }
    });
    return dataPoint;
  });

  return (
    <div className="w-full h-[400px] bg-card rounded-lg p-4 shadow-card">
      <h3 className="text-lg font-semibold mb-4">Score Progression</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="round" 
            label={{ value: 'Round', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Legend />
          {players.map((player, index) => (
            <Line
              key={player.id}
              type="monotone"
              dataKey={player.name}
              stroke={PLAYER_COLORS[index % PLAYER_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
