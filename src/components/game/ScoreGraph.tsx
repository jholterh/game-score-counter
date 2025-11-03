import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { Player } from "@/types/game";
import { translations, Language } from "@/lib/translations";

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    // Filter out entries with undefined or null values
    const validPayload = payload.filter(entry => entry.value !== undefined && entry.value !== null);
    
    if (validPayload.length === 0) return null;
    
    return (
      <div style={{
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        padding: '8px',
        fontSize: '12px'
      }}>
        <p style={{ marginBottom: '4px', fontWeight: 'bold' }}>{`Round ${label}`}</p>
        {validPayload.map((entry, index) => (
          <p key={index} style={{ color: entry.color, margin: '2px 0' }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface ScoreGraphProps {
  players: Player[];
  currentRound: number;
  language: Language;
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

export const ScoreGraph = ({ players, currentRound, language }: ScoreGraphProps) => {
  const t = translations[language].gameScreen;
  
  // Only show completed rounds (current round - 1)
  // If we're in round 1 and haven't saved yet, show nothing
  const completedRounds = Math.max(currentRound - 1, 0);
  
  if (completedRounds === 0) {
    return (
      <div className="w-full h-[300px] sm:h-[400px] bg-card rounded-lg p-3 sm:p-4 shadow-card">
        <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">{t.currentStandings}</h3>
        <div className="flex items-center justify-center h-[80%] text-muted-foreground">
          {t.completeFirstRound}
        </div>
      </div>
    );
  }
  
  // Include round 0 with 0 points for everyone
  const rounds = [0, ...Array.from({ length: completedRounds }, (_, i) => i + 1)];
  
  const chartData = rounds.map(round => {
    const dataPoint: any = { round };
    
    if (round === 0) {
      // Round 0: everyone starts at 0
      players.forEach(player => {
        dataPoint[player.name] = 0;
      });
    } else {
      // Regular rounds: calculate cumulative score
      players.forEach(player => {
        const roundIndex = round - 1;
        const cumulativeScore = player.scores
          .slice(0, roundIndex + 1)
          .reduce((sum, score) => sum + score, 0);
        
        // Only add data if player has joined by this round
        if (round >= player.joinedAtRound) {
          dataPoint[player.name] = cumulativeScore;
        }
      });
    }
    
    return dataPoint;
  });

  return (
    <div className="w-full h-[300px] sm:h-[400px] bg-card rounded-lg p-3 sm:p-4 shadow-card">
      <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">{t.currentStandings}</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="round" 
            label={{ value: 'Round', position: 'insideBottom', offset: -5, className: 'text-xs sm:text-sm' }}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            label={{ value: 'Score', angle: -90, position: 'insideLeft', className: 'text-xs sm:text-sm' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            content={<CustomTooltip />}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          {players.map((player, index) => (
            <Line
              key={player.id}
              type="monotone"
              dataKey={player.name}
              stroke={PLAYER_COLORS[index % PLAYER_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
