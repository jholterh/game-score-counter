import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Player {
  name: string;
  totalScore: number;
  scores: number[];
  joinedAtRound: number;
}

interface GameData {
  players: Player[];
  totalRounds: number;
  theme?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const gameData: GameData = await req.json();
    const { players, totalRounds, theme } = gameData;

    // Sort players by score
    const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);
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
    
    const prompt = `${themeInstruction}Game Summary:
- Total Rounds: ${totalRounds}
- Winner: ${winner.name} with ${winner.totalScore} points
- Last Place: ${lastPlace.name} with ${lastPlace.totalScore} points

Player Details:
${sortedPlayers.map((p, i) => 
  `${i + 1}. ${p.name}: ${p.totalScore} points (Round scores: ${p.scores.join(', ')})${p.joinedAtRound > 1 ? ` - Joined in Round ${p.joinedAtRound}` : ''}`
).join('\n')}

Notable Moments:
${biggestGains.map(g => `- ${g.name} had their best round (${g.maxGain} points) in Round ${g.round}`).join('\n')}
${biggestLosses.filter(l => l.maxLoss < 0).map(l => `- ${l.name} had their worst round (${l.maxLoss} points) in Round ${l.round}`).join('\n')}

Provide a fun, engaging analysis that:
1. Stay completely in character for your assigned persona
2. Explains why ${winner.name} won (2-3 sentences)
3. Analyzes why ${lastPlace.name} came in last (1-2 sentences)
4. Highlights 2-3 other interesting moments from the game
5. CRITICAL: If any players joined mid-game (joinedAtRound > 1), acknowledge this explicitly. Do NOT assume they played from round 1 or had scores in rounds before they joined. Their scores from earlier rounds were distributed catch-up points, not actual gameplay.
6. Keep the tone entertaining and fully embody your persona

IMPORTANT: Write in plain text without any markdown formatting (no **, ##, or other markdown symbols). Use line breaks and natural emphasis through capitalization where needed. Be specific about round numbers and scores when relevant. Keep it under 250 words.`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
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
