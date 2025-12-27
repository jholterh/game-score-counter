-- Fix RLS policies to prevent infinite recursion
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view participants in their games" ON game_participants;
DROP POLICY IF EXISTS "Users can update participants in their games" ON game_participants;
DROP POLICY IF EXISTS "Users can view scores in their games" ON round_scores;
DROP POLICY IF EXISTS "Users can insert scores" ON round_scores;
DROP POLICY IF EXISTS "Users can update scores in their games" ON round_scores;

-- Fix game_participants policies (break circular reference)
CREATE POLICY "Users can view participants in their games" ON game_participants
  FOR SELECT USING (
    -- User is a participant in this game
    user_id = auth.uid() OR
    -- User created the game
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_participants.game_id
      AND games.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update participants in their games" ON game_participants
  FOR UPDATE USING (
    -- User is a participant in this game
    user_id = auth.uid() OR
    -- User created the game
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_participants.game_id
      AND games.created_by = auth.uid()
    )
  );

-- Fix round_scores policies (use direct join instead of nested EXISTS)
CREATE POLICY "Users can view scores in their games" ON round_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM game_participants
      WHERE game_participants.id = round_scores.participant_id
      AND game_participants.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = round_scores.game_id
      AND games.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert scores" ON round_scores
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = round_scores.game_id
      AND games.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update scores in their games" ON round_scores
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = round_scores.game_id
      AND games.created_by = auth.uid()
    )
  );
