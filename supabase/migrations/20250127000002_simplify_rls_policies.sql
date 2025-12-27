-- Simplify RLS policies to eliminate all circular references
-- Strategy: Allow inserts easily, be restrictive on reads/updates

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view games they participated in" ON games;
DROP POLICY IF EXISTS "Users can insert games" ON games;
DROP POLICY IF EXISTS "Users can update their own games" ON games;
DROP POLICY IF EXISTS "Users can view participants in their games" ON game_participants;
DROP POLICY IF EXISTS "Users can insert participants" ON game_participants;
DROP POLICY IF EXISTS "Users can update participants in their games" ON game_participants;
DROP POLICY IF EXISTS "Users can view scores in their games" ON round_scores;
DROP POLICY IF EXISTS "Users can insert scores" ON round_scores;
DROP POLICY IF EXISTS "Users can update scores in their games" ON round_scores;
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can view their own statistics" ON user_statistics;
DROP POLICY IF EXISTS "Users can update their own statistics" ON user_statistics;

-- ============================================================================
-- GAMES table policies - NO CIRCULAR REFERENCES
-- ============================================================================

-- Allow authenticated users to create games
CREATE POLICY "Authenticated users can insert games" ON games
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to view games they created
CREATE POLICY "Users can view their created games" ON games
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Allow users to update games they created
CREATE POLICY "Users can update their created games" ON games
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- ============================================================================
-- GAME_PARTICIPANTS table policies - references GAMES only (no circular ref)
-- ============================================================================

-- Allow authenticated users to insert participants
CREATE POLICY "Authenticated users can insert participants" ON game_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to view participants in games they created
CREATE POLICY "Users can view participants in their games" ON game_participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_participants.game_id
      AND games.created_by = auth.uid()
    )
  );

-- Allow users to update participants in games they created
CREATE POLICY "Users can update participants in their games" ON game_participants
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_participants.game_id
      AND games.created_by = auth.uid()
    )
  );

-- ============================================================================
-- ROUND_SCORES table policies - references GAMES only (no circular ref)
-- ============================================================================

-- Allow authenticated users to insert scores
CREATE POLICY "Authenticated users can insert scores" ON round_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to view scores in games they created
CREATE POLICY "Users can view scores in their games" ON round_scores
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = round_scores.game_id
      AND games.created_by = auth.uid()
    )
  );

-- Allow users to update scores in games they created
CREATE POLICY "Users can update scores in their games" ON round_scores
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = round_scores.game_id
      AND games.created_by = auth.uid()
    )
  );

-- ============================================================================
-- USER_PREFERENCES table policies - simple, no references
-- ============================================================================

CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own preferences" ON user_preferences
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- USER_STATISTICS table policies - simple, no references
-- ============================================================================

CREATE POLICY "Users can view their own statistics" ON user_statistics
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own statistics" ON user_statistics
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());
