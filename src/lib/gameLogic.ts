import { Player } from "@/types/game"

/**
 * Calculates the cumulative total score for a player
 * @param scores - Array of scores per round
 * @returns Total cumulative score
 */
export const calculateCumulativeScore = (scores: number[]): number => {
  return scores.reduce((sum, score) => sum + score, 0)
}

/**
 * Calculates the fair starting score for a player joining mid-game.
 * Uses the average score per round of all existing players.
 *
 * @param players - Current active players in the game
 * @param currentRound - The round number when player is joining
 * @returns Starting score that puts new player at average position
 */
export const calculateStartingScore = (
  players: Player[],
  currentRound: number
): number => {
  if (players.length === 0 || currentRound === 0) {
    return 0
  }

  const totalPoints = players.reduce((sum, p) => sum + p.totalScore, 0)
  const avgScorePerRound = totalPoints / currentRound
  return avgScorePerRound * currentRound
}

/**
 * Determines the winner based on scoring mode
 * @param players - All players in the game
 * @param highScoreWins - Whether high score wins (true) or low score wins (false)
 * @returns The winning player
 */
export const determineWinner = (
  players: Player[],
  highScoreWins: boolean
): Player | null => {
  if (players.length === 0) {
    return null
  }

  const sortedPlayers = [...players].sort((a, b) =>
    highScoreWins ? b.totalScore - a.totalScore : a.totalScore - b.totalScore
  )

  return sortedPlayers[0]
}

/**
 * Sorts players by ranking based on win condition
 * @param players - All players in the game
 * @param highScoreWins - Whether high score wins (true) or low score wins (false)
 * @returns Array of players sorted by rank (best to worst)
 */
export const rankPlayers = (
  players: Player[],
  highScoreWins: boolean
): Player[] => {
  return [...players].sort((a, b) =>
    highScoreWins ? b.totalScore - a.totalScore : a.totalScore - b.totalScore
  )
}

/**
 * Finds the biggest gain for a player across all rounds
 * @param player - The player to analyze
 * @returns The largest score increase in a single round
 */
export const findBiggestGain = (player: Player): number => {
  if (player.scores.length === 0) {
    return 0
  }

  return Math.max(...player.scores)
}

/**
 * Finds the biggest loss for a player across all rounds
 * @param player - The player to analyze
 * @returns The largest score decrease in a single round
 */
export const findBiggestLoss = (player: Player): number => {
  if (player.scores.length === 0) {
    return 0
  }

  return Math.min(...player.scores)
}

/**
 * Calculates the average score per round for a player
 * @param player - The player to analyze
 * @returns Average score per round
 */
export const calculateAverageScore = (player: Player): number => {
  if (player.scores.length === 0) {
    return 0
  }

  return player.totalScore / player.scores.length
}

/**
 * Checks if a player is currently active in the game
 * @param player - The player to check
 * @param currentRound - The current round number
 * @returns True if player is active and hasn't given up
 */
export const isPlayerActiveInRound = (
  player: Player,
  currentRound: number
): boolean => {
  // Player must have joined by this round
  if (player.joinedAtRound > currentRound) {
    return false
  }

  // Player must be marked as active
  if (!player.isActive) {
    return false
  }

  // If player gave up, check if it was before this round
  if (player.gaveUpAtRound && player.gaveUpAtRound <= currentRound) {
    return false
  }

  return true
}

/**
 * Creates a new player object with default values
 * @param name - Player name
 * @param joinedAtRound - Round when player joined (default: 1)
 * @returns New player object
 */
export const createPlayer = (
  name: string,
  joinedAtRound: number = 1
): Player => {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    totalScore: 0,
    scores: [],
    predictions: [],
    joinedAtRound,
    isActive: true
  }
}

/**
 * Updates a player's score for a specific round
 * @param player - The player to update
 * @param roundIndex - The round index (0-based)
 * @param score - The score to add
 * @param prediction - Optional prediction score for dual scoring
 * @returns Updated player object
 */
export const updatePlayerScore = (
  player: Player,
  roundIndex: number,
  score: number,
  prediction?: number
): Player => {
  const newScores = [...player.scores]
  const newPredictions = player.predictions ? [...player.predictions] : []

  // Set the score for this round
  newScores[roundIndex] = score

  // Set prediction if dual scoring
  if (prediction !== undefined) {
    newPredictions[roundIndex] = prediction
  }

  // Recalculate total score
  const totalScore = calculateCumulativeScore(newScores)

  return {
    ...player,
    scores: newScores,
    predictions: newPredictions.length > 0 ? newPredictions : undefined,
    totalScore
  }
}

/**
 * Generates graph data for score visualization
 * @param players - All players in the game
 * @param maxRound - Maximum number of rounds to display
 * @returns Array of data points for the graph
 */
export const generateGraphData = (
  players: Player[],
  maxRound: number
): Array<Record<string, number | null>> => {
  return Array.from({ length: maxRound }, (_, i) => {
    const round = i + 1
    const dataPoint: Record<string, number | null> = { round }

    players.forEach(player => {
      // Only show score if player has joined and is active
      if (player.joinedAtRound <= round) {
        // Calculate cumulative score up to this round
        const relevantScores = player.scores.slice(0, round)
        const cumulativeScore = calculateCumulativeScore(relevantScores)

        // Check if player was active in this round
        if (isPlayerActiveInRound(player, round)) {
          dataPoint[player.id] = cumulativeScore
        } else {
          dataPoint[player.id] = null
        }
      } else {
        dataPoint[player.id] = null
      }
    })

    return dataPoint
  })
}
