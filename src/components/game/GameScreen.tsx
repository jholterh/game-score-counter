import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Player, RoundScore } from "@/types/game";
import { PlayerScoreCard } from "./PlayerScoreCard";
import { ScoreGraph } from "./ScoreGraph";
import { ChevronLeft, ChevronRight, Plus, Flag, Medal, Settings } from "lucide-react";
import { toast } from "sonner";
import { LanguageSelector } from "@/components/LanguageSelector";
import { UserMenu } from "@/components/UserMenu";
import { SyncStatusIndicator } from "@/components/SyncStatusIndicator";
import { useAuth } from "@/hooks/useAuth";
import { translations, Language, formatTranslation } from "@/lib/translations";
import { validateScore, validatePrediction, validatePlayerName, sanitizeString } from "@/lib/validation";

// Player colors - must match ScoreGraph colors
const PLAYER_COLORS = [
  "#4D7CFF", // electric blue
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

interface GameScreenProps {
  players: Player[];
  currentRound: number;
  isDualScoring: boolean;
  language: Language;
  highScoreWins: boolean;
  onScoreSubmit: (scores: RoundScore[]) => void;
  onNextRound: () => void;
  onPreviousRound: () => void;
  onAddPlayer: (name: string, startingScore: number) => void;
  onFinishGame: () => void;
  onTogglePlayerActive: (playerId: string) => void;
  onHighScoreWinsChange: (highScoreWins: boolean) => void;
  isSyncing?: boolean;
  syncError?: string | null;
  lastSyncedRound?: number;
}

export const GameScreen = ({
  players,
  currentRound,
  isDualScoring,
  language,
  highScoreWins,
  onScoreSubmit,
  onNextRound,
  onPreviousRound,
  onAddPlayer,
  onFinishGame,
  onTogglePlayerActive,
  onHighScoreWinsChange,
  isSyncing = false,
  syncError = null,
  lastSyncedRound = 0,
}: GameScreenProps) => {
  const [roundScores, setRoundScores] = useState<Record<string, { score: string; prediction: string }>>({});
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerScore, setNewPlayerScore] = useState("");
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { user, signOut } = useAuth();

  // Track which players are visible in the graph - persisted to localStorage
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(() => {
    // Try to restore from localStorage
    const saved = localStorage.getItem('selectedPlayers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const savedSet = new Set<string>(parsed);
        const currentPlayerIds = new Set(players.map(p => p.id));

        // Only restore if the saved IDs match current players (same game session)
        const isValid = parsed.every((id: string) => currentPlayerIds.has(id));
        if (isValid && parsed.length > 0) {
          return savedSet;
        }
      } catch {
        // Fall through to default
      }
    }
    return new Set(players.map(p => p.id));
  });

  // Track toggle version for each player (increments when toggled ON to force redraw)
  const [playerToggleVersion, setPlayerToggleVersion] = useState<Map<string, number>>(new Map());

  // Track players whose active status just changed (to prevent animation flash)
  const [playersStatusChanged, setPlayersStatusChanged] = useState<Set<string>>(new Set());

  const t = translations[language].gameScreen;

  // Create stable player ID signature - only changes when player IDs actually change
  const playerIdSignature = useMemo(() => players.map(p => p.id).join(','), [players]);

  // Persist selectedPlayers to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedPlayers', JSON.stringify(Array.from(selectedPlayers)));
  }, [selectedPlayers]);

  // Sync selectedPlayers when NEW players are added (not when scores change)
  // Only trigger when player IDs change, not when scores update
  useEffect(() => {
    setSelectedPlayers(prev => {
      const newSet = new Set(prev);
      let hasChanges = false;

      players.forEach(player => {
        // Auto-select newly added players
        if (!newSet.has(player.id)) {
          newSet.add(player.id);
          hasChanges = true;
        }
      });

      // Only update if there are actual changes (avoid unnecessary re-renders)
      return hasChanges ? newSet : prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerIdSignature]); // Only depend on playerIdSignature, not players array

  const handleTogglePlayerVisibility = (playerId: string) => {
    setSelectedPlayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        // Don't allow deselecting if it's the last one
        if (newSet.size > 1) {
          newSet.delete(playerId);
        }
      } else {
        // Player is being toggled ON - increment version to force redraw animation
        newSet.add(playerId);
        setPlayerToggleVersion(prevVersions => {
          const newVersions = new Map(prevVersions);
          const currentVersion = newVersions.get(playerId) || 0;
          newVersions.set(playerId, currentVersion + 1);
          return newVersions;
        });
      }
      return newSet;
    });
  };

  // Calculate reference scores for new player
  const worstScore = currentRound > 1 ? Math.min(...players.map(p => p.totalScore)) : 0;
  const avgScore = currentRound > 1 ? Math.round(players.reduce((sum, p) => sum + p.totalScore, 0) / players.length) : 0;

  const handleScoreChange = (playerId: string, value: string, type: 'score' | 'prediction') => {
    setRoundScores(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [type]: value
      }
    }));
  };

  const handleSubmitRound = () => {
    // Validate all scores before submitting
    const activePlayers = players.filter(player => player.isActive);
    for (const player of activePlayers) {
      const scoreValue = roundScores[player.id]?.score;
      const predictionValue = roundScores[player.id]?.prediction;

      // Validate score
      if (scoreValue) {
        const scoreValidation = validateScore(scoreValue);
        if (!scoreValidation.valid) {
          toast.error(`${player.name}: ${scoreValidation.error}`);
          return;
        }
      }

      // Validate prediction if dual scoring
      if (isDualScoring && predictionValue) {
        const predictionValidation = validatePrediction(predictionValue);
        if (!predictionValidation.valid) {
          toast.error(`${player.name} prediction: ${predictionValidation.error}`);
          return;
        }
      }
    }

    const scores: RoundScore[] = activePlayers.map(player => {
      const scoreValue = roundScores[player.id]?.score;
      const predictionValue = roundScores[player.id]?.prediction;

      return {
        playerId: player.id,
        score: parseFloat(scoreValue || "0"),
        prediction: isDualScoring ? parseFloat(predictionValue || "0") : undefined,
      };
    });

    // Before submitting, check if any mid-game players or rejoining players are scoring for the first time
    // We need to increment their version to force remount for proper line drawing with animation
    const playersToIncrementVersion: string[] = [];

    activePlayers.forEach(player => {
      const isMidGameJoiner = player.joinedAtRound > 1 && !player.gaveUpAtRound;
      const isRejoiningPlayer = player.gaveUpAtRound && player.joinedAtRound >= currentRound;
      const hasScored = player.scores.length > (player.joinedAtRound - 1);
      const isScoringNow = roundScores[player.id]?.score !== undefined && roundScores[player.id]?.score !== "";

      // If this is a mid-game joiner or rejoining player scoring for the first time, increment version
      if ((isMidGameJoiner || isRejoiningPlayer) && !hasScored && isScoringNow) {
        playersToIncrementVersion.push(player.id);
      }
    });

    // Increment versions and clear status changed flags
    if (playersToIncrementVersion.length > 0) {
      setPlayerToggleVersion(prevVersions => {
        const newVersions = new Map(prevVersions);
        playersToIncrementVersion.forEach(playerId => {
          const currentVersion = newVersions.get(playerId) || 0;
          newVersions.set(playerId, currentVersion + 1);
        });
        return newVersions;
      });

      // Clear statusJustChanged for these players to enable animation
      setPlayersStatusChanged(prev => {
        const newSet = new Set(prev);
        playersToIncrementVersion.forEach(playerId => newSet.delete(playerId));
        return newSet;
      });
    }

    onScoreSubmit(scores);
    onNextRound();
    setRoundScores({});
    toast.success(formatTranslation(t.roundSaved, { round: currentRound.toString() }));

    // Scroll to top to see the graph animation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddPlayer = () => {
    // Use default name if empty
    const playerName = newPlayerName.trim() || `Player ${players.length + 1}`;
    const sanitizedName = sanitizeString(playerName);
    const nameValidation = validatePlayerName(sanitizedName);

    if (!nameValidation.valid) {
      toast.error(nameValidation.error || t.enterPlayerName);
      return;
    }

    // Validate starting score if not round 1
    if (currentRound > 1 && newPlayerScore) {
      const scoreValidation = validateScore(newPlayerScore);
      if (!scoreValidation.valid) {
        toast.error(scoreValidation.error || "Invalid starting score");
        return;
      }
    }

    const score = currentRound === 1 ? 0 : parseFloat(newPlayerScore || "0");
    onAddPlayer(sanitizedName, score);
    setNewPlayerName("");
    setNewPlayerScore("");
    setIsAddPlayerOpen(false);
    toast.success(formatTranslation(t.joinedGame, { name: sanitizedName }));
  };

  const handleFinishGame = () => {
    // Clear localStorage when finishing the game
    localStorage.removeItem('selectedPlayers');
    onFinishGame();
  };

  const handleToggleActive = (playerId: string) => {
    // Mark this player as having status changed to prevent animation flash
    setPlayersStatusChanged(new Set([playerId]));

    // Clear the flag after the component updates
    setTimeout(() => {
      setPlayersStatusChanged(new Set());
    }, 100);

    onTogglePlayerActive(playerId);
  };

  const sortedPlayers = [...players].sort((a, b) =>
    highScoreWins ? b.totalScore - a.totalScore : a.totalScore - b.totalScore
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold font-mono text-white">Round {currentRound}</h1>
            <p className="text-sm text-muted-foreground">{players.length} players</p>
            <SyncStatusIndicator
              isSyncing={isSyncing}
              syncError={syncError}
              lastSyncedRound={lastSyncedRound}
            />
          </div>
          <div className="flex gap-2">
            <Dialog open={isAddPlayerOpen} onOpenChange={setIsAddPlayerOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Add player">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.addPlayer}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>{t.playerName}</Label>
                    <Input
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      placeholder={`Player ${players.length + 1}`}
                    />
                  </div>
                  <div>
                    <Label>{t.startingScore} {currentRound === 1 ? t.mustBeZero : ""}</Label>
                    <Input
                      type="number"
                      value={currentRound === 1 ? "" : newPlayerScore}
                      onChange={(e) => setNewPlayerScore(e.target.value)}
                      placeholder="0"
                      disabled={currentRound === 1}
                      className="font-mono"
                    />
                    {currentRound > 1 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTranslation(t.reference, { worst: worstScore.toString(), avg: avgScore.toString() })}
                      </p>
                    )}
                  </div>
                  <Button onClick={handleAddPlayer} className="w-full">
                    {t.addPlayer}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Settings">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Game Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Score Direction</Label>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          onHighScoreWinsChange(true);
                          toast.success("High score wins mode activated");
                        }}
                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                          highScoreWins
                            ? 'border-primary bg-primary/10 text-white'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="font-medium">High score wins</div>
                        <div className="text-xs text-muted-foreground">More points = better</div>
                      </button>
                      <button
                        onClick={() => {
                          onHighScoreWinsChange(false);
                          toast.success("Low score wins mode activated");
                        }}
                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                          !highScoreWins
                            ? 'border-primary bg-primary/10 text-white'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="font-medium">Low score wins</div>
                        <div className="text-xs text-muted-foreground">Fewer points = better</div>
                      </button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            {user && <UserMenu user={user} onSignOut={signOut} />}
            <Button onClick={handleFinishGame} variant="secondary" size="sm" className="hidden sm:flex">
              <Flag className="h-4 w-4 mr-2" />
              {t.finishGame}
            </Button>
            <Button onClick={handleFinishGame} variant="secondary" size="icon" className="sm:hidden">
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Player Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-4">
          {sortedPlayers.map((player, rankIndex) => {
            // Find player's original index to get consistent color
            const playerIndex = players.findIndex(p => p.id === player.id);
            const playerColor = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
            const isSelected = selectedPlayers.has(player.id);

            // Podium positions
            const isPodium = rankIndex < 3;
            const isGold = rankIndex === 0;
            const isSilver = rankIndex === 1;
            const isBronze = rankIndex === 2;

            // Medal colors
            let medalColor = '';
            if (isGold) medalColor = 'hsl(var(--medal-gold))';
            else if (isSilver) medalColor = 'hsl(var(--medal-silver))';
            else if (isBronze) medalColor = 'hsl(var(--medal-bronze))';

            return (
              <button
                key={player.id}
                onClick={() => handleTogglePlayerVisibility(player.id)}
                className="metric-card text-left transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  borderColor: isPodium ? medalColor : playerColor + '40',
                  backgroundColor: isPodium ? 'hsl(var(--bg-card))' : undefined,
                  opacity: isSelected ? 1 : 0.4,
                  filter: isSelected ? 'none' : 'grayscale(0.5)',
                }}
                aria-label={`Toggle ${player.name} visibility in graph`}
                aria-pressed={isSelected}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    {isPodium && (
                      <Medal
                        className="h-3.5 w-3.5"
                        style={{ color: medalColor }}
                        fill={medalColor}
                      />
                    )}
                    <span
                      className="text-xs font-medium"
                      style={{ color: isPodium ? medalColor : playerColor }}
                    >
                      #{rankIndex + 1}
                    </span>
                  </div>
                  {!player.isActive && (
                    <span className="text-xs text-muted-foreground">Inactive</span>
                  )}
                </div>
                <div
                  className="metric-value text-2xl md:text-3xl"
                  style={{ color: isPodium ? medalColor : playerColor }}
                >
                  {player.totalScore}
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  {player.name}
                </div>
                <div className="w-full h-1 bg-[hsl(var(--bg-elevated))] rounded-full mt-2">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: player.isActive ? '100%' : '50%',
                      backgroundColor: playerColor,
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Score Graph */}
        <ScoreGraph
          players={players}
          currentRound={currentRound}
          language={language}
          selectedPlayerIds={selectedPlayers}
          playerToggleVersions={playerToggleVersion}
          playersStatusChanged={playersStatusChanged}
        />

        {/* Score Entry */}
        <Card className="p-6">
          <h2 className="text-base font-medium text-muted-foreground uppercase tracking-wide mb-6">
            {t.enterScores} {currentRound}
          </h2>
          <div className="space-y-3">
            {players.map(player => {
              const playerIndex = players.findIndex(p => p.id === player.id);
              const playerColor = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];

              return (
                <div
                  key={player.id}
                  className={`relative rounded-lg border transition-all duration-200 ${
                    !player.isActive ? 'opacity-50' : 'hover:border-[hsl(var(--border-medium))]'
                  }`}
                  style={{
                    borderColor: playerColor + '40',
                    backgroundColor: 'hsl(var(--bg-card))',
                  }}
                >
                  {/* Color accent bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                    style={{ backgroundColor: playerColor }}
                  />

                  <div className="pl-5 pr-4 py-4">
                    <div className="flex gap-4 items-start">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: playerColor }}
                          />
                          <Label className="font-medium text-white">{player.name}</Label>
                          {!player.isActive && (
                            <span className="text-xs text-muted-foreground">({t.inactive})</span>
                          )}
                        </div>
                        {player.isActive ? (
                          <div className={`grid gap-3 ${isDualScoring ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            <div>
                              <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">
                                {t.score}
                              </Label>
                              <Input
                                type="number"
                                value={roundScores[player.id]?.score || ""}
                                onChange={(e) => handleScoreChange(player.id, e.target.value, 'score')}
                                placeholder="0"
                                className="font-mono text-lg h-11"
                                aria-label={`Score for ${player.name}`}
                              />
                            </div>
                            {isDualScoring && (
                              <div>
                                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">
                                  {t.prediction}
                                </Label>
                                <Input
                                  type="number"
                                  value={roundScores[player.id]?.prediction || ""}
                                  onChange={(e) => handleScoreChange(player.id, e.target.value, 'prediction')}
                                  placeholder="0"
                                  className="font-mono text-lg h-11"
                                  aria-label={`Prediction for ${player.name}`}
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground py-1">
                            {t.playerGaveUp}
                          </div>
                        )}
                      </div>
                      <Button
                        variant={player.isActive ? "destructive" : "secondary"}
                        size="sm"
                        onClick={() => handleToggleActive(player.id)}
                        className="text-xs whitespace-nowrap shrink-0"
                      >
                        {player.isActive ? t.giveUp : t.rejoin}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex gap-4 pb-4">
          <Button
            onClick={onPreviousRound}
            disabled={currentRound === 1}
            variant="outline"
            className="flex-1"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t.previousRound}
          </Button>
          <Button
            onClick={handleSubmitRound}
            className="flex-1"
          >
            {t.saveNextRound}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
