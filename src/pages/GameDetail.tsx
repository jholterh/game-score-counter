import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { fetchGameDetail, fetchRoundScores } from '@/lib/supabase/gameRepository';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Trophy, Medal } from 'lucide-react';
import { ScoreGraph } from '@/components/game/ScoreGraph';
import { Player } from '@/types/game';
import { Language } from '@/lib/translations';

export default function GameDetail() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [game, setGame] = useState<any>(null);
  const [roundScores, setRoundScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language] = useState<Language>('en');

  // Check auth on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthChecked(true);
      if (!user || !gameId) {
        navigate('/');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [user, gameId, navigate]);

  useEffect(() => {
    if (!user || !gameId || !authChecked) return;

    loadGameDetail();
  }, [user, gameId, authChecked]);

  const loadGameDetail = async () => {
    if (!gameId) return;

    setLoading(true);
    setError(null);

    try {
      const [gameData, scoresData] = await Promise.all([
        fetchGameDetail(gameId),
        fetchRoundScores(gameId),
      ]);

      setGame(gameData);
      setRoundScores(scoresData);
    } catch (err) {
      console.error('Failed to load game detail:', err);
      setError(err instanceof Error ? err.message : 'Failed to load game');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading game...</p>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-red-500 mb-4">{error || 'Game not found'}</p>
          <Button onClick={() => navigate('/history')}>Back to History</Button>
        </Card>
      </div>
    );
  }

  // Convert database format to Player[] format for ScoreGraph
  const players: Player[] = game.game_participants
    .sort((a: any, b: any) => a.player_order - b.player_order)
    .map((participant: any) => {
      // Get all scores for this participant from round_scores
      const participantScores = roundScores
        .filter((rs: any) => rs.participant_id === participant.id)
        .sort((a: any, b: any) => a.round_number - b.round_number);

      // Use cumulative scores from database (already calculated)
      const scores = participantScores.map((rs: any) => rs.cumulative_score || 0);

      const predictions = game.is_dual_scoring
        ? participantScores.map((rs: any) => rs.prediction || 0)
        : undefined;

      return {
        id: participant.id,
        name: participant.player_name,
        totalScore: participant.total_score,
        scores,
        predictions,
        joinedAtRound: participant.joined_at_round,
        isActive: participant.is_active,
        gaveUpAtRound: participant.gave_up_at_round,
      };
    });

  const sortedParticipants = [...game.game_participants].sort((a: any, b: any) =>
    game.high_score_wins
      ? b.total_score - a.total_score
      : a.total_score - b.total_score
  );

  const date = new Date(game.finished_at || game.started_at);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/history')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Game Details</h1>
            <p className="text-sm text-muted-foreground">
              {date.toLocaleDateString()} at {date.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Game Info */}
        <Card className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Total Rounds</p>
              <p className="text-white font-medium">{game.total_rounds}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Game Mode</p>
              <p className="text-white font-medium">
                {game.is_dual_scoring ? 'Dual Scoring' : 'Standard'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Scoring</p>
              <p className="text-white font-medium">
                {game.high_score_wins ? 'High Score Wins' : 'Low Score Wins'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Players</p>
              <p className="text-white font-medium">{game.game_participants.length}</p>
            </div>
          </div>
        </Card>

        {/* Final Standings */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Final Standings</h2>
          <div className="space-y-3">
            {sortedParticipants.map((participant: any, index: number) => {
              const isPodium = index < 3;
              const isGold = index === 0;
              const isSilver = index === 1;
              const isBronze = index === 2;
              const isCurrentUser = participant.user_id === user?.id;

              let medalColor = '';
              if (isGold) medalColor = 'hsl(var(--medal-gold))';
              else if (isSilver) medalColor = 'hsl(var(--medal-silver))';
              else if (isBronze) medalColor = 'hsl(var(--medal-bronze))';

              return (
                <div
                  key={participant.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    isCurrentUser ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 min-w-[60px]">
                      {isPodium && (
                        <Medal
                          className="h-5 w-5"
                          style={{ color: medalColor }}
                          fill={medalColor}
                        />
                      )}
                      <span className="text-lg font-medium" style={{ color: isPodium ? medalColor : 'inherit' }}>
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {participant.player_name}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-primary">(You)</span>
                        )}
                      </p>
                      {!participant.is_active && (
                        <p className="text-xs text-muted-foreground">
                          Left at round {participant.gave_up_at_round}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold font-mono text-white">
                      {participant.total_score}
                    </p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Score Graph */}
        <ScoreGraph
          players={players}
          currentRound={game.total_rounds + 1}
          language={language}
          selectedPlayerIds={new Set(players.map(p => p.id))}
          playerToggleVersions={new Map()}
          playersStatusChanged={new Set()}
        />

        {/* AI Analysis (if available) */}
        {game.ai_analysis && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">AI Analysis</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{game.ai_analysis}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
