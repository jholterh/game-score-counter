import { memo } from 'react';
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
  selectedPlayerIds?: Set<string>;
  playerToggleVersions?: Map<string, number>;
  playersStatusChanged?: Set<string>;
}

// Improved color palette with better contrast and distinguishability
const PLAYER_COLORS = [
  "#4D7CFF", // electric blue (primary accent)
  "#EF4444", // red
  "#10B981", // green
  "#F59E0B", // amber
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#8B5CF6", // purple
  "#14B8A6", // teal
  "#F97316", // orange
  "#A855F7", // violet
];

const ScoreGraphComponent = ({ players, currentRound, language, selectedPlayerIds, playerToggleVersions, playersStatusChanged }: ScoreGraphProps) => {
  const t = translations[language].gameScreen;

  // Helper to check if player is selected
  const isPlayerVisible = (playerId: string) => {
    return selectedPlayerIds ? selectedPlayerIds.has(playerId) : true;
  };

  // Only show completed rounds (current round - 1)
  // If we're in round 1 and haven't saved yet, show nothing
  const completedRounds = Math.max(currentRound - 1, 0);

  // Helper to check if player just joined this round (hasn't scored yet)
  const isJustJoined = (player: Player) => {
    return player.joinedAtRound === currentRound;
  };

  // Helper to check if player just rejoined (after giving up)
  const isJustRejoined = (player: Player) => {
    return player.gaveUpAtRound && player.joinedAtRound === currentRound && player.isActive;
  };
  
  if (completedRounds === 0) {
    return (
      <div className="w-full h-[300px] sm:h-[400px] bg-card border border-border rounded-xl p-4 sm:p-6">
        <h3 className="text-base font-medium text-muted-foreground uppercase tracking-wide mb-4">{t.currentStandings}</h3>
        <div className="flex items-center justify-center h-[80%] text-muted-foreground text-sm">
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
      // Round 0: everyone who started from the beginning shows 0
      players.forEach(player => {
        // Only include data if player is visible
        if (!isPlayerVisible(player.id)) {
          dataPoint[player.name] = null;
          return;
        }

        // Only show round 0 for players who started from round 1
        // Mid-game joiners will appear when they have score data
        if (player.joinedAtRound > 1) {
          return;
        }

        dataPoint[player.name] = 0;
      });
    } else {
      // Regular rounds: calculate cumulative score
      players.forEach(player => {
        // If player is not visible, set to null
        if (!isPlayerVisible(player.id)) {
          dataPoint[player.name] = null;
          return;
        }

        const roundIndex = round - 1;

        // Special case: Player just joined this round, show at last completed round
        if (isJustJoined(player) && round === completedRounds) {
          // Show their starting score at the current graph endpoint
          dataPoint[player.name] = player.totalScore;
          return;
        }

        // Special case: Player just rejoined after giving up, show at last completed round
        if (isJustRejoined(player) && round === completedRounds) {
          // Show their current score at the rejoin point
          dataPoint[player.name] = player.totalScore;
          return;
        }

        // For rejoining players, treat them like brand new mid-game joiners
        // Only show data from their rejoin point forward, ignore history before they gave up
        if (player.gaveUpAtRound) {
          // They gave up at some point
          if (round < player.gaveUpAtRound) {
            // Before they gave up - show their old data
            // Check if we have score data for this round
            if (roundIndex >= player.scores.length) {
              return;
            }
            const cumulativeScore = player.scores
              .slice(0, roundIndex + 1)
              .reduce((sum, score) => sum + score, 0);
            dataPoint[player.name] = cumulativeScore;
            return;
          }

          // During the gap (gave up but not yet rejoined)
          if (round >= player.gaveUpAtRound && round < (player.joinedAtRound - 1)) {
            // Gap period - no data
            return;
          }

          // After rejoin: treat like mid-game joiner from the rejoin point
          if (round < (player.joinedAtRound - 1)) {
            return;
          }
        } else {
          // Regular mid-game joiner (never gave up)
          // For mid-game joiners, show data starting from (joinedAtRound - 1) to create the line
          if (round < (player.joinedAtRound - 1)) {
            // Player hasn't joined yet - no data point
            return;
          }
        }

        // If player is currently inactive and gave up, no data after gave up point
        if (!player.isActive && player.gaveUpAtRound && round >= player.gaveUpAtRound) {
          // Player has given up and hasn't rejoined - no data point
          return;
        }

        // Check if we have score data for this round
        if (roundIndex >= player.scores.length) {
          // No score data for this round yet (future rounds)
          return;
        }

        const cumulativeScore = player.scores
          .slice(0, roundIndex + 1)
          .reduce((sum, score) => sum + score, 0);

        // Show cumulative score
        dataPoint[player.name] = cumulativeScore;
      });
    }

    return dataPoint;
  });

  return (
    <div className="w-full h-[300px] sm:h-[400px] bg-card border border-border rounded-xl p-4 sm:p-6">
      <h3 className="text-base font-medium text-muted-foreground uppercase tracking-wide mb-4">{t.currentStandings}</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: -10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="round"
            label={{
              value: 'Round',
              position: 'insideBottomRight',
              offset: 0,
              style: { fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }
            }}
            tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
            tickFormatter={(value) => value === 0 ? 'Start' : `${value}`}
            stroke="hsl(var(--border))"
          />
          <YAxis
            label={{
              value: 'Score',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }
            }}
            tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
            stroke="hsl(var(--border))"
          />
          <Tooltip
            content={<CustomTooltip />}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            iconType="line"
          />
          {players.map((player, index) => {
            // Check if this player is selected (visible)
            const isVisible = isPlayerVisible(player.id);

            // Use version number in key to force remount when toggled ON
            const version = playerToggleVersions?.get(player.id) || 0;
            const lineKey = `${player.id}-v${version}`;

            // Mid-game joiners and rejoining players: disable initial animation to avoid weird "fly-in" effect
            // Their line will still animate smoothly when new data is added
            const isMidGameJoiner = player.joinedAtRound > 1 && !player.gaveUpAtRound;
            const isRejoiningPlayer = player.gaveUpAtRound && player.joinedAtRound > 1;
            const statusJustChanged = playersStatusChanged?.has(player.id) || false;
            const shouldAnimate = !(isMidGameJoiner || isRejoiningPlayer || statusJustChanged) || version > 0; // Animate if toggled or normal player

            return (
              <Line
                key={lineKey}
                type="monotone"
                dataKey={player.name}
                stroke={PLAYER_COLORS[index % PLAYER_COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
                connectNulls={false}
                hide={!isVisible}
                isAnimationActive={shouldAnimate}
                animationDuration={shouldAnimate ? 1500 : 0}
                animationEasing="ease-out"
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders during sync operations
export const ScoreGraph = memo(ScoreGraphComponent);
