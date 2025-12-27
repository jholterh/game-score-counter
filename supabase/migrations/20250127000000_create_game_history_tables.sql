-- =====================================================
-- User Preferences Table
-- =====================================================
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'es', 'de')),
  favorite_narrator TEXT,
  preferred_high_score_wins BOOLEAN DEFAULT true,
  preferred_dual_scoring BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- Games Table
-- =====================================================
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'es', 'de')),
  is_dual_scoring BOOLEAN NOT NULL DEFAULT false,
  high_score_wins BOOLEAN NOT NULL DEFAULT true,
  total_rounds INTEGER NOT NULL CHECK (total_rounds > 0),
  is_finished BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finished_at TIMESTAMP WITH TIME ZONE,
  ai_analysis TEXT,
  ai_theme TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Game Participants Table
-- =====================================================
CREATE TABLE game_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  player_name TEXT NOT NULL,
  player_order INTEGER NOT NULL CHECK (player_order >= 0),
  total_score INTEGER NOT NULL DEFAULT 0,
  final_rank INTEGER,
  is_winner BOOLEAN DEFAULT false,
  joined_at_round INTEGER NOT NULL DEFAULT 1 CHECK (joined_at_round > 0),
  gave_up_at_round INTEGER CHECK (gave_up_at_round IS NULL OR gave_up_at_round > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, player_order)
);

-- =====================================================
-- Round Scores Table
-- =====================================================
CREATE TABLE round_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES game_participants(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL CHECK (round_number > 0),
  score INTEGER NOT NULL,
  prediction INTEGER,
  cumulative_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, participant_id, round_number)
);

-- =====================================================
-- User Statistics Table
-- =====================================================
CREATE TABLE user_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_games_played INTEGER NOT NULL DEFAULT 0,
  total_games_won INTEGER NOT NULL DEFAULT 0,
  total_rounds_played INTEGER NOT NULL DEFAULT 0,
  average_score_per_game DECIMAL(10, 2) DEFAULT 0,
  highest_game_score INTEGER DEFAULT 0,
  lowest_game_score INTEGER DEFAULT 0,
  favorite_game_mode TEXT,
  last_played_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- Indexes for Performance
-- =====================================================
CREATE INDEX idx_games_created_by ON games(created_by);
CREATE INDEX idx_games_finished_at ON games(finished_at DESC);
CREATE INDEX idx_games_is_finished ON games(is_finished);
CREATE INDEX idx_game_participants_game_id ON game_participants(game_id);
CREATE INDEX idx_game_participants_user_id ON game_participants(user_id);
CREATE INDEX idx_round_scores_game_id ON round_scores(game_id);
CREATE INDEX idx_round_scores_participant_id ON round_scores(participant_id);
CREATE INDEX idx_user_statistics_user_id ON user_statistics(user_id);

-- =====================================================
-- Row Level Security Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;

-- User Preferences Policies
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Games Policies
CREATE POLICY "Users can view games they participated in" ON games
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM game_participants
      WHERE game_participants.game_id = games.id
      AND game_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert games" ON games
  FOR INSERT WITH CHECK (auth.uid() = created_by OR created_by IS NULL);

CREATE POLICY "Users can update their own games" ON games
  FOR UPDATE USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM game_participants
      WHERE game_participants.game_id = games.id
      AND game_participants.user_id = auth.uid()
    )
  );

-- Game Participants Policies
CREATE POLICY "Users can view participants in their games" ON game_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM game_participants gp
      WHERE gp.game_id = game_participants.game_id
      AND gp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert participants" ON game_participants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update participants in their games" ON game_participants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM game_participants gp
      WHERE gp.game_id = game_participants.game_id
      AND gp.user_id = auth.uid()
    )
  );

-- Round Scores Policies
CREATE POLICY "Users can view scores in their games" ON round_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM game_participants
      WHERE game_participants.game_id = round_scores.game_id
      AND game_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert scores" ON round_scores
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_participants
      WHERE game_participants.game_id = round_scores.game_id
      AND game_participants.user_id = auth.uid()
    )
  );

-- User Statistics Policies
CREATE POLICY "Users can view own statistics" ON user_statistics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can update statistics" ON user_statistics
  FOR ALL USING (true);

-- =====================================================
-- Database Functions
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update user statistics after a game finishes
CREATE OR REPLACE FUNCTION update_user_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if game is being marked as finished
  IF NEW.is_finished = true AND (OLD.is_finished = false OR OLD.is_finished IS NULL) THEN
    -- Update stats for all participants with user accounts
    INSERT INTO user_statistics (user_id, total_games_played, total_games_won, total_rounds_played, last_played_at)
    SELECT
      gp.user_id,
      1,
      CASE WHEN gp.is_winner THEN 1 ELSE 0 END,
      NEW.total_rounds,
      NEW.finished_at
    FROM game_participants gp
    WHERE gp.game_id = NEW.id AND gp.user_id IS NOT NULL
    ON CONFLICT (user_id) DO UPDATE SET
      total_games_played = user_statistics.total_games_played + 1,
      total_games_won = user_statistics.total_games_won + CASE WHEN EXCLUDED.total_games_won > 0 THEN 1 ELSE 0 END,
      total_rounds_played = user_statistics.total_rounds_played + EXCLUDED.total_rounds_played,
      last_played_at = EXCLUDED.last_played_at,
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Triggers
-- =====================================================

-- Trigger for updated_at on games
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for updated_at on user_preferences
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update user statistics when game finishes
CREATE TRIGGER trigger_update_user_statistics
  AFTER UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_user_statistics();

-- =====================================================
-- Views for Advanced Statistics
-- =====================================================

CREATE OR REPLACE VIEW user_game_statistics AS
SELECT
  gp.user_id,
  COUNT(DISTINCT g.id) as total_games,
  SUM(CASE WHEN gp.is_winner THEN 1 ELSE 0 END) as wins,
  ROUND(AVG(gp.total_score), 2) as avg_score,
  MAX(gp.total_score) as max_score,
  MIN(gp.total_score) as min_score,
  COUNT(CASE WHEN g.is_dual_scoring THEN 1 END) as dual_scoring_games,
  COUNT(CASE WHEN g.high_score_wins THEN 1 END) as high_score_games
FROM game_participants gp
JOIN games g ON gp.game_id = g.id
WHERE gp.user_id IS NOT NULL AND g.is_finished = true
GROUP BY gp.user_id;
