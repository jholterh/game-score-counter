-- Fix all RLS circular reference issues
-- Strategy: Use simpler policies without subqueries on the same table

-- ============================================================================
-- Drop all existing policies to start fresh
-- ============================================================================
DROP POLICY IF EXISTS "Users can view games they participated in or created" ON games;
DROP POLICY IF EXISTS "Authenticated users can insert games" ON games;
DROP POLICY IF EXISTS "Users can update their created games" ON games;

DROP POLICY IF EXISTS "Authenticated users can insert participants" ON game_participants;
DROP POLICY IF EXISTS "Users can view participants in their games" ON game_participants;
DROP POLICY IF EXISTS "Users can update participants in their games" ON game_participants;

DROP POLICY IF EXISTS "Authenticated users can insert scores" ON round_scores;
DROP POLICY IF EXISTS "Users can view scores in their games" ON round_scores;
DROP POLICY IF EXISTS "Users can update scores in their games" ON round_scores;

-- ============================================================================
-- GAMES - Simple policies without circular references
-- ============================================================================

-- Allow authenticated users to insert games
CREATE POLICY "games_insert_policy" ON games
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to view games they created (no subquery)
CREATE POLICY "games_select_created_policy" ON games
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Allow users to update games they created
CREATE POLICY "games_update_policy" ON games
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- ============================================================================
-- GAME_PARTICIPANTS - No circular references
-- ============================================================================

-- Allow authenticated users to insert participants
CREATE POLICY "participants_insert_policy" ON game_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to view participants - check games table directly
CREATE POLICY "participants_select_policy" ON game_participants
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    game_id IN (
      SELECT id FROM games WHERE created_by = auth.uid()
    )
  );

-- Allow users to update participants in their games
CREATE POLICY "participants_update_policy" ON game_participants
  FOR UPDATE
  TO authenticated
  USING (
    game_id IN (
      SELECT id FROM games WHERE created_by = auth.uid()
    )
  );

-- ============================================================================
-- ROUND_SCORES - Simple references
-- ============================================================================

-- Allow authenticated users to insert scores
CREATE POLICY "scores_insert_policy" ON round_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to view scores in their games
CREATE POLICY "scores_select_policy" ON round_scores
  FOR SELECT
  TO authenticated
  USING (
    game_id IN (
      SELECT id FROM games WHERE created_by = auth.uid()
    )
  );

-- Allow users to update scores in their games
CREATE POLICY "scores_update_policy" ON round_scores
  FOR UPDATE
  TO authenticated
  USING (
    game_id IN (
      SELECT id FROM games WHERE created_by = auth.uid()
    )
  );
