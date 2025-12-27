-- Fix games view policy to allow users to see games they participated in
-- Not just games they created

DROP POLICY IF EXISTS "Users can view their created games" ON games;

-- Users can view games where they are a participant OR creator
CREATE POLICY "Users can view games they participated in or created" ON games
  FOR SELECT
  TO authenticated
  USING (
    -- User created the game
    created_by = auth.uid()
    OR
    -- User is a participant in the game
    id IN (
      SELECT game_id FROM game_participants
      WHERE user_id = auth.uid()
    )
  );
