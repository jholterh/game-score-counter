# Claude Instructions for Game Score Counter

This document provides specific guidelines and context for Claude Code when working on the Game Score Counter codebase.

---

## Project Context

**Project Type:** Single-page React web application for multiplayer game score tracking
**Primary Use Case:** Track scores for board games, card games, and party games (2-10 players)
**Tech Stack:** React 18 + TypeScript + Vite + shadcn/ui + Tailwind CSS
**Current Status:** Production-ready, deployed at https://game-score-counter.lovable.app

**Key Characteristics:**
- Client-side only (no database persistence)
- AI-powered game analysis via Supabase Edge Functions
- Multi-language support (EN, ES, DE)
- Mobile-first responsive design
- Accessibility-focused UI components

---

## Code Style & Conventions

### TypeScript Guidelines

**Type Safety:**
- Use explicit types for function parameters and return values
- Define interfaces in `src/types/game.ts`
- Avoid `any` when possible (though currently allowed by tsconfig)
- Use type inference where it improves readability

**Naming Conventions:**
```typescript
// Interfaces: PascalCase
interface Player { }

// Components: PascalCase
const GameScreen = () => { }

// Functions: camelCase
const handleScoreSubmit = () => { }

// Constants: UPPER_SNAKE_CASE
const PLAYER_COLORS = [...]

// State variables: camelCase
const [currentRound, setCurrentRound] = useState(1)
```

### React Patterns

**Component Structure:**
```typescript
// 1. Imports
import { useState } from "react"
import { Button } from "@/components/ui/button"

// 2. Type definitions
interface ComponentProps {
  onSubmit: (data: FormData) => void
  language: Language
}

// 3. Component
export const Component = ({ onSubmit, language }: ComponentProps) => {
  // 4. Hooks
  const [state, setState] = useState()

  // 5. Event handlers
  const handleClick = () => { }

  // 6. Render
  return <div>...</div>
}
```

**State Management Rules:**
- Lift state to the **lowest common ancestor**
- Keep state as **close to where it's used** as possible
- For this app, `Index.tsx` is the central state manager
- Use **immutable updates** for arrays and objects
- Prefer **controlled components** for forms

**Event Handler Naming:**
- Props: `on[Event]` (e.g., `onScoreSubmit`)
- Internal handlers: `handle[Event]` (e.g., `handleScoreSubmit`)

### Component Guidelines

**When to Create a New Component:**
- Code is reused in 2+ places
- Component exceeds ~150 lines
- Logic can be isolated and tested independently
- Improves readability significantly

**Component Organization:**
- **Game-specific components:** `src/components/game/`
- **Reusable UI components:** `src/components/ui/` (shadcn)
- **Utility components:** `src/components/`

**Props Design:**
- Keep props minimal and focused
- Prefer specific callbacks over generic ones
- Group related props into objects if >5 props
- Always define TypeScript interfaces for props

---

## Styling Guidelines

### Tailwind Usage

**Preferred Pattern:**
```tsx
<div className="flex flex-col gap-4 p-6 bg-card rounded-lg shadow-lg">
  <h2 className="text-2xl font-bold text-foreground">Title</h2>
  <p className="text-sm text-muted-foreground">Description</p>
</div>
```

**Design Token Usage:**
- Use semantic tokens: `bg-primary`, `text-foreground`, `border-border`
- Avoid hard-coded colors: ❌ `bg-blue-500` → ✅ `bg-primary`
- Use spacing scale: `gap-2`, `p-4`, `m-6` (4px increments)
- Use responsive prefixes: `sm:`, `md:`, `lg:`

**Custom CSS:**
- Only add custom CSS to `src/index.css` for:
  - Design tokens
  - Global animations
  - Base element styles
- Prefer Tailwind utilities over custom CSS

### shadcn/ui Components

**Component Usage:**
```tsx
// Import from @/components/ui
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

// Use with variants
<Button variant="default" size="lg">Submit</Button>
<Button variant="outline" size="sm">Cancel</Button>
```

**Adding New Components:**
```bash
# Use shadcn CLI
npx shadcn-ui@latest add [component-name]
```

**Customization:**
- Modify in `src/components/ui/[component].tsx`
- Use `className` prop for one-off customizations
- Update `tailwind.config.ts` for global changes

---

## State Management Patterns

### Game State Structure

**Central State (Index.tsx):**
```typescript
// DO: Single source of truth
const [players, setPlayers] = useState<Player[]>([])
const [currentRound, setCurrentRound] = useState(1)

// DON'T: Duplicate state in child components
```

### Immutable Update Patterns

**Adding to Array:**
```typescript
// ✅ Correct
setPlayers(prev => [...prev, newPlayer])

// ❌ Wrong
players.push(newPlayer)
setPlayers(players)
```

**Updating Object in Array:**
```typescript
// ✅ Correct
setPlayers(prev => prev.map(player =>
  player.id === targetId
    ? { ...player, score: newScore }
    : player
))

// ❌ Wrong
const player = players.find(p => p.id === targetId)
player.score = newScore
setPlayers(players)
```

**Updating Nested State:**
```typescript
// ✅ Correct
setPlayers(prev => prev.map(player => ({
  ...player,
  scores: [...player.scores, roundScore]
})))

// ❌ Wrong
players.forEach(p => p.scores.push(roundScore))
setPlayers(players)
```

---

## Feature Implementation Guidelines

### Adding New Game Features

**Process:**
1. **Update types** in `src/types/game.ts`
2. **Add translations** to `src/lib/translations.ts` (all 3 languages)
3. **Update state** in `Index.tsx`
4. **Modify components** that use the new state
5. **Update AI prompt** in `supabase/functions/analyze-game/index.ts` if relevant
6. **Test with all configurations** (dual scoring, high/low wins, player join/leave)

**Example - Adding a new player property:**
```typescript
// 1. Update type
interface Player {
  // ... existing properties
  newProperty: string
}

// 2. Add translation
const translations = {
  en: { newPropertyLabel: "New Property" },
  es: { newPropertyLabel: "Nueva Propiedad" },
  de: { newPropertyLabel: "Neue Eigenschaft" }
}

// 3. Update initialization
const handleStartGame = () => {
  const newPlayers = playerNames.map(name => ({
    // ... existing properties
    newProperty: ""
  }))
}

// 4. Update UI components
```

### Modifying Score Calculations

**Critical Files:**
- `src/pages/Index.tsx` - Main score logic
- `src/components/game/GameScreen.tsx` - Score input
- `src/components/game/ScoreGraph.tsx` - Score visualization
- `src/components/game/ResultsScreen.tsx` - Winner determination

**Testing Checklist:**
- [ ] Scores sum correctly
- [ ] Graph displays accurate cumulative totals
- [ ] Winner determined correctly (both high/low score modes)
- [ ] Dual scoring works (if applicable)
- [ ] Mid-game player joins receive fair scores
- [ ] Inactive players handled correctly

### Adding UI Components

**For Game-Specific Components:**
```typescript
// Location: src/components/game/NewComponent.tsx
import { translations } from "@/lib/translations"
import { Language } from "@/types/game"

interface NewComponentProps {
  language: Language
  // ... other props
}

export const NewComponent = ({ language }: NewComponentProps) => {
  const t = translations[language]
  return <div>{t.newComponentTitle}</div>
}
```

**For Reusable UI Components:**
```bash
# Use shadcn CLI
npx shadcn-ui@latest add [component-name]
```

---

## Internationalization (i18n)

### Adding Translations

**Process:**
1. Add key to `src/lib/translations.ts`
2. Provide translations for all 3 languages
3. Use in components via `translations[language]`

**Example:**
```typescript
// 1. Add to translations.ts
const translations = {
  en: {
    newFeature: "New Feature",
    withVariable: "Player {name} scored {score} points"
  },
  es: {
    newFeature: "Nueva Función",
    withVariable: "Jugador {name} anotó {score} puntos"
  },
  de: {
    newFeature: "Neue Funktion",
    withVariable: "Spieler {name} erzielte {score} Punkte"
  }
}

// 2. Use in component
const t = translations[language]
<h1>{t.newFeature}</h1>
<p>{t.withVariable.replace('{name}', player.name).replace('{score}', score)}</p>
```

### Translation Guidelines

**Best Practices:**
- Keep translations concise for mobile screens
- Avoid cultural idioms that don't translate well
- Test with longest translation (often German)
- Use gender-neutral language where possible
- Maintain consistent terminology across languages

**Word Count Considerations:**
- English: ~100 words for AI analysis
- Spanish: ~120 words (more verbose)
- German: ~110 words (compound words compensate)

---

## AI Integration

### Modifying AI Analysis

**File:** `supabase/functions/analyze-game/index.ts`

**Adding New Themes:**
```typescript
const themes = [
  // ... existing themes
  "a game show host announcing results"
]
```

**Prompt Engineering Guidelines:**
- Be specific about output format
- Provide context (scoring mode, win condition)
- Request specific length (by language)
- Emphasize staying in character
- Include game statistics for grounding

**Testing Locally:**
```bash
# Requires Supabase CLI
supabase functions serve analyze-game

# Test with curl
curl -X POST http://localhost:54321/functions/v1/analyze-game \
  -H "Content-Type: application/json" \
  -d '{
    "players": [...],
    "language": "en",
    "isDualScoring": false,
    "highScoreWins": true
  }'
```

### Text-to-Speech Configuration

**File:** `src/components/TextToSpeech.tsx`

**Adding Voice Settings for New Themes:**
```typescript
const getVoiceSettings = (theme: string) => {
  if (theme.includes('new theme')) {
    return { rate: 1.0, pitch: 1.0 }
  }
  // ... existing themes
}
```

**Rate Guidelines:**
- Fast (1.2+): Excited, energetic themes
- Normal (0.9-1.1): Conversational themes
- Slow (0.8-0.9): Dramatic, serious themes

**Pitch Guidelines:**
- High (1.1+): Enthusiastic, cheerful themes
- Normal (0.95-1.05): Standard narration
- Low (0.9-): Serious, dramatic themes

---

## Graph & Visualization

### Modifying ScoreGraph

**File:** `src/components/game/ScoreGraph.tsx`

**Data Structure:**
```typescript
const graphData = [
  { round: 1, player1: 10, player2: 15, player3: null },
  { round: 2, player1: 25, player2: 28, player3: 12 }
]
// null = player inactive/not joined yet
```

**Adding New Graph Features:**
```typescript
// Example: Add annotations
<ReferenceLine
  y={0}
  stroke="hsl(var(--muted-foreground))"
  strokeDasharray="3 3"
/>

// Example: Highlight winner
<Line
  dataKey={winner.id}
  stroke={PLAYER_COLORS[index]}
  strokeWidth={3}  // Thicker line for winner
/>
```

**Color Palette:**
- 10 distinct colors in `PLAYER_COLORS`
- To add more: Use HSL with varied hue (0-360°)
- Maintain 60%+ lightness for visibility
- Test in both light and dark modes

---

## Testing Guidelines

### Manual Testing Checklist

**Setup Phase:**
- [ ] Can create game with 2-10 players
- [ ] Player names are required
- [ ] Dual scoring toggle works
- [ ] High/low score wins toggle works
- [ ] Language selector changes UI text

**Playing Phase:**
- [ ] Scores accept negative numbers
- [ ] Scores update graph in real-time
- [ ] Can navigate to previous rounds
- [ ] Can add player mid-game
- [ ] Can mark player as "gave up"
- [ ] Can allow player to rejoin
- [ ] Graph shows correct cumulative scores
- [ ] Graph handles inactive players correctly

**Results Phase:**
- [ ] Winner determined correctly (high score mode)
- [ ] Winner determined correctly (low score mode)
- [ ] Rankings display correctly
- [ ] AI analysis generates successfully
- [ ] Text-to-speech plays analysis
- [ ] Can regenerate analysis (different theme)
- [ ] "New Game" resets all state

**Cross-Browser:**
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

**Responsive Design:**
- [ ] Mobile (320px-640px)
- [ ] Tablet (641px-1024px)
- [ ] Desktop (1025px+)

### Edge Cases to Test

**Player Management:**
- Player joins at round 1 vs round 10
- Player gives up, then rejoins
- All players give up except one
- Player with identical scores (tie handling)

**Scoring:**
- All positive scores
- All negative scores
- Mix of positive and negative
- Scores of 0
- Very large scores (1000+)

**Game Configurations:**
- 2 players (minimum)
- 10 players (maximum)
- Dual scoring with predictions
- High score wins vs low score wins
- All languages (EN, ES, DE)

---

## Common Tasks

### Adding a New Translation Key

```typescript
// 1. Open src/lib/translations.ts
// 2. Add to all three language objects
const translations = {
  en: {
    // ... existing keys
    myNewKey: "My New Text"
  },
  es: {
    // ... existing keys
    myNewKey: "Mi Nuevo Texto"
  },
  de: {
    // ... existing keys
    myNewKey: "Mein Neuer Text"
  }
}

// 3. Use in component
const t = translations[language]
<p>{t.myNewKey}</p>
```

### Adding a New shadcn Component

```bash
# 1. Run shadcn CLI
npx shadcn-ui@latest add [component-name]

# 2. Import and use
import { NewComponent } from "@/components/ui/new-component"
<NewComponent />
```

### Adding a New Player Color

```typescript
// In ScoreGraph.tsx
const PLAYER_COLORS = [
  // ... existing 10 colors
  'hsl(280, 70%, 60%)',  // New color - purple
]
```

### Updating AI Analysis Prompt

```typescript
// In supabase/functions/analyze-game/index.ts
const prompt = `
You are ${theme}.

Analyze this game where ${highScoreWins ? 'highest' : 'lowest'} score wins.

Winner: ${winner.name} with ${winner.totalScore} points

// Add your new context here
New context: ${someNewGameStat}

Provide a ${wordCount}-word analysis in ${languageMap[language]}.
`
```

### Adding Custom Animation

```css
/* In src/index.css */
@keyframes my-animation {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-my-animation {
  animation: my-animation 0.3s ease-in-out;
}
```

```tsx
/* Use in component */
<div className="animate-my-animation">Content</div>
```

---

## Performance Best Practices

### React Optimization

**When to Use useMemo:**
```typescript
// ✅ Good: Expensive calculation
const graphData = useMemo(() => {
  return players.map(player => calculateCumulativeScores(player))
}, [players])

// ❌ Unnecessary: Simple calculation
const playerCount = useMemo(() => players.length, [players])
```

**When to Use useCallback:**
```typescript
// ✅ Good: Passed to memoized child or dependency array
const handleSubmit = useCallback((score: number) => {
  setPlayers(prev => updateScores(prev, score))
}, [])

// ❌ Unnecessary: Not passed to memoized component
const handleClick = useCallback(() => {
  console.log('clicked')
}, [])
```

**Current Optimizations:**
- Small component sizes (< 200 lines)
- Minimal re-renders due to lifted state
- No expensive computations in render
- Recharts handles graph memoization internally

**Not Currently Needed (but monitor):**
- React.memo for components (re-renders are cheap)
- Virtual scrolling (max 10 players)
- Code splitting beyond route level
- Service workers / PWA (no offline requirement)

---

## Debugging Tips

### Common Issues

**Graph Not Updating:**
- Check that state is updated immutably
- Verify graphData transformation includes new rounds
- Ensure player IDs are consistent

**Translations Missing:**
- Verify all 3 languages have the key
- Check for typos in translation key
- Ensure language prop is passed correctly

**AI Analysis Fails:**
- Check Supabase Edge Function logs
- Verify environment variables are set
- Test with smaller player count first
- Check CORS settings in edge function

**State Not Persisting:**
- Remember: No database, state is in-memory only
- Refreshing page will reset all state
- This is by design (privacy-first)

### Console Logging

**Useful Debug Points:**
```typescript
// Player state changes
console.log('Players updated:', players)

// Score calculations
console.log('Score submitted:', { playerId, score, round: currentRound })

// Graph data
console.log('Graph data:', graphData)

// AI analysis
console.log('AI response:', analysisText)
```

---

## Architecture Decisions

### Why Client-Side Only?

**Rationale:**
- Privacy-first: No user data stored
- Simplicity: No backend complexity
- Cost: Zero database costs
- Speed: Instant load, no API calls for core features

**Trade-offs:**
- No game history across sessions
- No multiplayer sync
- Limited to single device

### Why Supabase Edge Functions for AI?

**Rationale:**
- Serverless: No server management
- CORS: Avoid exposing API keys in client
- Deno: Modern runtime with TypeScript support
- Integration: Native Supabase client

**Alternative Considered:**
- Direct API call from client (rejected: exposes API key)
- Traditional backend (rejected: too complex)

### Why shadcn/ui Instead of Material-UI or Chakra?

**Rationale:**
- **Customizable:** Copy components to project, full control
- **Lightweight:** Only include what you use
- **Modern:** Built on Radix UI primitives
- **Accessible:** ARIA compliant out of the box
- **Tailwind-native:** Consistent with styling approach

---

## File Structure Conventions

### Import Order

```typescript
// 1. React and external libraries
import { useState } from "react"
import { toast } from "sonner"

// 2. UI components
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// 3. Local components
import { ScoreGraph } from "@/components/game/ScoreGraph"

// 4. Utilities and types
import { translations } from "@/lib/translations"
import { Player, Language } from "@/types/game"
```

### Path Aliases

```typescript
// ✅ Use alias
import { Button } from "@/components/ui/button"
import { translations } from "@/lib/translations"

// ❌ Don't use relative paths
import { Button } from "../../../components/ui/button"
```

---

## Git Workflow

### Commit Message Guidelines

**Format:**
```
<type>: <short description>

<optional longer description>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code restructuring
- `style:` Formatting changes
- `docs:` Documentation updates
- `test:` Test additions
- `chore:` Maintenance tasks

**Examples:**
```
feat: Add player rejoin functionality

fix: Graph not displaying inactive players correctly

refactor: Extract score calculation to separate function

docs: Update README with deployment instructions
```

### Branch Strategy

**Current:** Simple main branch workflow
**Recommended for team:** Feature branches + PR review

---

## When to Ask for Clarification

**Always ask before:**
- Changing core game logic (scoring, winner determination)
- Modifying AI analysis themes or prompts significantly
- Adding new dependencies (npm packages)
- Changing build configuration
- Altering responsive breakpoints
- Removing existing features

**Okay to proceed without asking:**
- Fixing bugs in existing features
- Adding translations for new features
- Styling tweaks within design system
- Refactoring without behavior changes
- Adding comments or documentation

---

## Important Constraints

### Do Not Change
- **Build system:** Vite configuration works well
- **Component library:** shadcn/ui is integral to design
- **Styling approach:** Tailwind + design tokens
- **State management:** Simple useState is sufficient
- **Player limit:** 10 players (graph readability)

### Open to Change
- AI analysis themes and prompts
- Translation text (improve clarity)
- Graph colors (maintain accessibility)
- Animation timings and effects
- Component organization (if improves clarity)

---

## Quick Reference

### Key Commands
```bash
npm run dev          # Start dev server (localhost:8080)
npm run build        # Production build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Key Directories
```
src/components/game/     # Game-specific components
src/components/ui/       # shadcn UI components
src/pages/               # Route components
src/types/               # TypeScript interfaces
src/lib/                 # Utilities and translations
supabase/functions/      # Edge functions
```

### Key Files
```
src/pages/Index.tsx                        # Main game state & orchestration
src/types/game.ts                          # Type definitions
src/lib/translations.ts                    # All translations
src/index.css                              # Design tokens & animations
supabase/functions/analyze-game/index.ts   # AI analysis backend
vite.config.ts                             # Build configuration
tailwind.config.ts                         # Tailwind customization
```

### Environment Variables
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## Contact & Support

**Issues:** Report bugs via GitHub issues
**Documentation:** See ARCHITECTURE.md for detailed technical documentation
**Deployment:** Currently hosted on Lovable.app

---

**Document Version:** 1.0
**Last Updated:** 2025-12-26
**Target Audience:** Claude Code AI assistant
