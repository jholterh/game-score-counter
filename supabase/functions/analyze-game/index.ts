import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface Player {
  name: string;
  totalScore: number;
  scores: number[];
  joinedAtRound: number;
  isActive: boolean;
  gaveUpAtRound?: number;
}

interface GameData {
  players: Player[];
  totalRounds: number;
  theme?: string;
  language?: string;
  highScoreWins?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    const gameData: GameData = await req.json();
    const { players, totalRounds, theme, language = 'en', highScoreWins = true } = gameData;

    // Sort players by score based on whether high or low score wins
    const sortedPlayers = [...players].sort((a, b) => 
      highScoreWins ? b.totalScore - a.totalScore : a.totalScore - b.totalScore
    );
    const winner = sortedPlayers[0];
    const lastPlace = sortedPlayers[sortedPlayers.length - 1];

    // Find interesting moments
    const biggestGains = players.map(player => ({
      name: player.name,
      maxGain: Math.max(...player.scores),
      round: player.scores.indexOf(Math.max(...player.scores)) + 1
    }));

    const biggestLosses = players.map(player => ({
      name: player.name,
      maxLoss: Math.min(...player.scores),
      round: player.scores.indexOf(Math.min(...player.scores)) + 1
    }));

    // Create analysis prompt with theme
    const themeInstruction = theme 
      ? `Adopt this persona: ${theme}\n\n` 
      : 'You are a witty game commentator providing entertaining analysis of a game that just finished. Be humorous but not mean-spirited.\n\n';
    
    const languageInstruction = language !== 'en'
      ? `\n\nCRITICAL INSTRUCTION: Write your ENTIRE response in the language with ISO code "${language}". Every single word must be in this language.`
      : '';
    
    const scoringSystemNote = highScoreWins 
      ? "Note: In this game, HIGHER scores are BETTER (more points = winning)."
      : "Note: In this game, LOWER scores are BETTER (fewer points = winning). This is important context!";
    
    const prompt = `${themeInstruction}${scoringSystemNote}

Game Summary:
- Total Rounds: ${totalRounds}
- Winner: ${winner.name} with ${winner.totalScore} points
- Last Place: ${lastPlace.name} with ${lastPlace.totalScore} points

Player Details:
${sortedPlayers.map((p, i) => {
  let details = `${i + 1}. ${p.name}: ${p.totalScore} points (Round scores: ${p.scores.join(', ')})`;
  const originalJoinRound = p.joinedAtRound;
  
  if (originalJoinRound > 1 && (!p.gaveUpAtRound || originalJoinRound < p.gaveUpAtRound)) {
    details += ` - Joined in Round ${originalJoinRound} (starting points were a gift/handicap)`;
  }
  
  if (!p.isActive && p.gaveUpAtRound) {
    details += ` - Gave up at Round ${p.gaveUpAtRound}`;
  } else if (p.isActive && p.gaveUpAtRound && originalJoinRound > p.gaveUpAtRound) {
    // Player gave up and then rejoined
    details += ` - Gave up at Round ${p.gaveUpAtRound}, then rejoined at Round ${originalJoinRound}`;
  } else if (!p.isActive) {
    details += ` - Gave up during game`;
  }
  return details;
}).join('\n')}

Notable Moments:
${biggestGains.map(g => `- ${g.name} had their best round (${g.maxGain} points) in Round ${g.round}`).join('\n')}
${biggestLosses.filter(l => l.maxLoss < 0).map(l => `- ${l.name} had their worst round (${l.maxLoss} points) in Round ${l.round}`).join('\n')}

Provide a fun, engaging analysis that:
1. Stay completely in character for your assigned persona
2. Explains why ${winner.name} won (2-3 sentences)
3. Analyzes why ${lastPlace.name} came in last (1-2 sentences)
4. Highlights 2-3 other interesting moments from the game
5. CRITICAL: If any players joined mid-game (joinedAtRound > 1), acknowledge they received their starting points as a gift/handicap to catch up
6. If any players gave up during the game, mention this as part of the story
7. If any players gave up and then rejoined later, highlight this as a dramatic comeback attempt
8. Keep the tone entertaining and fully embody your persona

IMPORTANT: Write in plain text without any markdown formatting (no **, ##, or other markdown symbols). Use line breaks and natural emphasis through capitalization where needed. Be specific about round numbers and scores when relevant. Keep it under 250 words.${languageInstruction}`;

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a witty, entertaining game commentator.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error('Failed to generate analysis');
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-game function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
