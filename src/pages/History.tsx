import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { fetchUserGames, type GameWithParticipants } from '@/lib/supabase/gameRepository';
import { fetchUserStatistics } from '@/lib/supabase/userRepository';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Filter, Calendar, Trophy, TrendingUp } from 'lucide-react';
import { translations, Language } from '@/lib/translations';
import { StatisticsDashboard } from '@/components/history/StatisticsDashboard';
import { HistoryLoadingSkeleton } from '@/components/history/HistoryLoadingSkeleton';

type DateRangeFilter = 'all' | 'week' | 'month' | 'year';
type GameModeFilter = 'all' | 'standard' | 'dual';
type OutcomeFilter = 'all' | 'won' | 'lost';

export default function History() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [games, setGames] = useState<GameWithParticipants[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language] = useState<Language>('en'); // TODO: Get from user preferences
  const [showStats, setShowStats] = useState(false);

  // Filters
  const [dateRange, setDateRange] = useState<DateRangeFilter>('all');
  const [gameMode, setGameMode] = useState<GameModeFilter>('all');
  const [outcome, setOutcome] = useState<OutcomeFilter>('all');
  const [page, setPage] = useState(0);

  const t = translations[language];

  // Check auth on mount
  useEffect(() => {
    // Give auth time to initialize
    const timer = setTimeout(() => {
      setAuthChecked(true);
      if (!user) {
        navigate('/');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  useEffect(() => {
    if (!user || !authChecked) return;

    loadGames();
  }, [user, authChecked, dateRange, gameMode, page]);

  const loadGames = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const gamesData = await fetchUserGames(user.id, {
        page,
        pageSize: 20,
        filters: {
          dateRange,
          gameMode: gameMode === 'all' ? undefined : gameMode,
        },
      });

      setGames(gamesData);

      // Try to load statistics, but don't fail if it doesn't exist
      try {
        const statsData = await fetchUserStatistics(user.id);
        setStatistics(statsData);
      } catch (statsErr) {
        console.warn('Failed to load statistics (non-critical):', statsErr);
        setStatistics(null);
      }
    } catch (err) {
      console.error('Failed to load games:', err);
      setError(err instanceof Error ? err.message : 'Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  // Filter by outcome on client side (win/loss)
  const filteredGames = games.filter(game => {
    if (outcome === 'all') return true;

    const myParticipant = game.game_participants.find(p => p.user_id === user?.id);
    if (!myParticipant) return false;

    const won = myParticipant.is_winner;
    return outcome === 'won' ? won : !won;
  });

  // Calculate quick stats
  const totalGames = filteredGames.length;
  const gamesWon = filteredGames.filter(g =>
    g.game_participants.find(p => p.user_id === user?.id)?.is_winner
  ).length;
  const winRate = totalGames > 0 ? Math.round((gamesWon / totalGames) * 100) : 0;
  const avgScore = totalGames > 0
    ? Math.round(
        filteredGames.reduce((sum, g) => {
          const myParticipant = g.game_participants.find(p => p.user_id === user?.id);
          return sum + (myParticipant?.total_score || 0);
        }, 0) / totalGames
      )
    : 0;

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Game History</h1>
              <p className="text-sm text-muted-foreground">View your past games and statistics</p>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        {loading ? (
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse w-48" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="p-4">
                  <div className="space-y-2">
                    <div className="h-12 w-12 bg-muted rounded-lg animate-pulse mx-auto" />
                    <div className="h-8 bg-muted rounded animate-pulse w-12 mx-auto" />
                    <div className="h-3 bg-muted rounded animate-pulse w-20 mx-auto" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : statistics ? (
          <>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setShowStats(!showStats)}
                className="text-sm"
              >
                {showStats ? 'Hide' : 'Show'} Detailed Statistics
              </Button>
            </div>

            {showStats && (
              <StatisticsDashboard
                totalGames={statistics.total_games_played || 0}
                totalWins={statistics.total_games_won || 0}
                totalRounds={statistics.total_rounds_played || 0}
                averageScore={statistics.average_score_per_game || 0}
                highestScore={statistics.highest_game_score || 0}
                lowestScore={statistics.lowest_game_score || 0}
                favoriteGameMode={statistics.favorite_game_mode || 'standard'}
                lastPlayedDate={statistics.last_played_at ? new Date(statistics.last_played_at) : null}
              />
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{totalGames}</p>
                    <p className="text-sm text-muted-foreground">Games Played</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{winRate}%</p>
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{avgScore}</p>
                    <p className="text-sm text-muted-foreground">Avg Score</p>
                  </div>
                </div>
              </Card>
            </div>
          </>
        ) : null}

        {/* Filters */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Range */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRangeFilter)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Time</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>
            </div>

            {/* Game Mode */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Game Mode</label>
              <select
                value={gameMode}
                onChange={(e) => setGameMode(e.target.value as GameModeFilter)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Modes</option>
                <option value="standard">Standard</option>
                <option value="dual">Dual Scoring</option>
              </select>
            </div>

            {/* Outcome */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Outcome</label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as OutcomeFilter)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Games</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Games List */}
        {loading ? (
          <HistoryLoadingSkeleton />
        ) : error ? (
          <Card className="p-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={loadGames}>Retry</Button>
          </Card>
        ) : filteredGames.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No games found</p>
            <Button onClick={() => navigate('/')}>Start a New Game</Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredGames.map((game) => {
              // Find participant - try user_id match first, fallback to game creator's first participant
              let myParticipant = game.game_participants.find(p => p.user_id === user?.id);

              // If no match by user_id (player wasn't linked), use first participant since user created the game
              if (!myParticipant && game.created_by === user?.id) {
                myParticipant = game.game_participants.sort((a, b) => a.player_order - b.player_order)[0];
              }

              const isWinner = myParticipant?.is_winner || false;
              const myScore = myParticipant?.total_score || 0;
              const myRank = myParticipant?.final_rank || 0;

              const playerNames = game.game_participants
                .map(p => p.player_name)
                .slice(0, 3)
                .join(', ');
              const remainingCount = game.game_participants.length - 3;

              const date = new Date(game.finished_at || game.started_at);
              const timeAgo = getTimeAgo(date);

              return (
                <Card
                  key={game.id}
                  className="p-4 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/history/${game.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {isWinner && (
                          <Trophy className="h-4 w-4 text-yellow-500" fill="currentColor" />
                        )}
                        <span className="font-medium text-white">
                          {isWinner ? 'Winner' : `${myRank}${getRankSuffix(myRank)} Place`}
                        </span>
                        <span className="text-xs text-muted-foreground">• {timeAgo}</span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {playerNames}
                        {remainingCount > 0 && ` (+${remainingCount} more)`}
                      </p>

                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-white font-mono">
                          Your Score: {myScore} pts
                        </span>
                        <span className="text-muted-foreground">
                          {game.total_rounds} rounds
                        </span>
                        <span className="text-muted-foreground">
                          {game.is_dual_scoring ? 'Dual Scoring' : 'Standard'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {filteredGames.length > 0 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={filteredGames.length < 20}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function getRankSuffix(rank: number): string {
  if (rank === 1) return 'st';
  if (rank === 2) return 'nd';
  if (rank === 3) return 'rd';
  return 'th';
}
