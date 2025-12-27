# Game Score Counter - Technical Architecture Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture & Data Flow](#architecture--data-flow)
5. [Core Components](#core-components)
6. [State Management](#state-management)
7. [AI Integration](#ai-integration)
8. [Build System](#build-system)
9. [Styling System](#styling-system)
10. [Internationalization](#internationalization)
11. [Key Features](#key-features)
12. [Development Workflow](#development-workflow)

---

## Project Overview

**Game Score Counter** is a modern web application built for tracking multiplayer game scores with real-time visualization, AI-powered game analysis, and multi-language support. It supports 2-10 players with flexible scoring modes including dual scoring (predictions + actual scores) and bidirectional win conditions.

**Live Demo:** https://game-score-counter.lovable.app

**Key Capabilities:**
- Real-time score tracking with cumulative graphs
- Mid-game player management (add, give up, rejoin)
- AI-generated comedic game analysis (12 personas)
- Text-to-speech narration
- Multi-language support (English, Spanish, German)
- Dual scoring mode (for games like Wizard)
- Configurable win condition (high/low score wins)

---

## Technology Stack

### Core Framework
- **React 18.3.1** - UI library
- **TypeScript 5.8.3** - Type safety
- **Vite 5.4.19** - Build tool and dev server
- **React Router DOM 6.30.1** - Client-side routing

### UI Framework
- **shadcn/ui** - Extensive component library (55+ components)
- **Radix UI** - Accessible primitive components
- **Tailwind CSS 3.4.17** - Utility-first styling
- **Lucide React** - Icon library
- **Class-variance-authority** - Component variant management

### Data & State
- **React Hooks** - Local state management (useState)
- **TanStack React Query 5.83.0** - Server state management
- **React Hook Form 7.61.1** - Form handling
- **Zod 3.25.76** - Schema validation

### Backend & Services
- **Supabase 2.78.0** - Backend-as-a-service
- **Supabase Edge Functions** - Serverless functions (Deno runtime)
- **Lovable AI Gateway** - AI service proxy
- **Google Gemini 2.5 Flash** - LLM for game analysis

### Visualization & UI
- **Recharts 2.15.4** - Charting library for score graphs
- **Sonner 1.7.4** - Toast notifications
- **Web Speech API** - Native browser text-to-speech
- **Next-themes 0.3.0** - Theme management
- **Date-fns 3.6.0** - Date utilities

---

## Project Structure

```
game-score-counter/
├── src/
│   ├── components/
│   │   ├── game/                          # Game-specific components
│   │   │   ├── SetupScreen.tsx           # Initial game configuration
│   │   │   ├── GameScreen.tsx            # Active gameplay interface
│   │   │   ├── ResultsScreen.tsx         # End game summary
│   │   │   ├── ScoreGraph.tsx            # Recharts visualization
│   │   │   └── PlayerScoreCard.tsx       # Player score display
│   │   ├── ui/                            # Reusable shadcn components (55+)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── LanguageSelector.tsx          # Multi-language switcher
│   │   └── TextToSpeech.tsx              # Speech synthesis component
│   ├── pages/
│   │   ├── Index.tsx                     # Main game orchestrator
│   │   └── NotFound.tsx                  # 404 page
│   ├── types/
│   │   └── game.ts                       # TypeScript interfaces
│   ├── lib/
│   │   ├── translations.ts               # i18n translations
│   │   └── utils.ts                      # Utility functions
│   ├── hooks/
│   │   └── use-mobile.tsx                # Responsive hook
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts                 # Supabase initialization
│   │       └── types.ts                  # Supabase types
│   ├── App.tsx                           # Root component
│   ├── main.tsx                          # Entry point
│   └── index.css                         # Global styles & design tokens
├── supabase/
│   └── functions/
│       └── analyze-game/
│           └── index.ts                  # AI analysis edge function
├── public/                                # Static assets
│   └── lovable-uploads/                  # Images
├── Configuration Files
│   ├── vite.config.ts                    # Vite configuration
│   ├── tailwind.config.ts                # Tailwind customization
│   ├── tsconfig.json                     # TypeScript config
│   ├── eslint.config.js                  # Linting rules
│   ├── components.json                   # shadcn configuration
│   ├── postcss.config.js                 # PostCSS plugins
│   └── package.json                      # Dependencies & scripts
└── README.md                             # Project documentation
```

**File Count:**
- 68 TypeScript/React files
- 55+ reusable UI components
- 5 core game components
- 1 serverless edge function

---

## Architecture & Data Flow

### Application Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Index.tsx                            │
│              (Main Game Orchestrator)                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ GameState (useState)                            │   │
│  │ - players: Player[]                             │   │
│  │ - currentRound: number                          │   │
│  │ - isDualScoring: boolean                        │   │
│  │ - isGameFinished: boolean                       │   │
│  │ - language: string                              │   │
│  │ - highScoreWins: boolean                        │   │
│  └─────────────────────────────────────────────────┘   │
│                          │                              │
│           ┌──────────────┼──────────────┐              │
│           ▼              ▼              ▼               │
│     ┌──────────┐   ┌──────────┐   ┌──────────┐        │
│     │  Setup   │   │  Playing │   │ Results  │        │
│     │  Screen  │   │  Screen  │   │  Screen  │        │
│     └──────────┘   └──────────┘   └──────────┘        │
└─────────────────────────────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
       ┌──────────┐   ┌──────────┐   ┌──────────┐
       │  Score   │   │  Player  │   │    AI    │
       │  Graph   │   │  Cards   │   │ Analysis │
       └──────────┘   └──────────┘   └──────────┘
                                            │
                                            ▼
                              ┌──────────────────────────┐
                              │  Supabase Edge Function  │
                              │  (analyze-game)          │
                              │          │               │
                              │          ▼               │
                              │  Lovable AI Gateway      │
                              │          │               │
                              │          ▼               │
                              │  Gemini 2.5 Flash        │
                              └──────────────────────────┘
```

### Component Hierarchy

```
App
└── Router
    └── Routes
        ├── Index (Main Page)
        │   ├── SetupScreen
        │   │   ├── Card
        │   │   ├── Input fields
        │   │   ├── Switch (dual scoring, high score wins)
        │   │   └── LanguageSelector
        │   ├── GameScreen
        │   │   ├── ScoreGraph
        │   │   ├── Score input forms
        │   │   ├── Dialog (add player)
        │   │   └── Tabs (round navigation)
        │   └── ResultsScreen
        │       ├── ScoreGraph
        │       ├── PlayerScoreCard (for each player)
        │       ├── AI analysis display
        │       └── TextToSpeech
        └── NotFound
```

---

## Core Components

### 1. Index.tsx (Main Orchestrator)
**Location:** `src/pages/Index.tsx`

**Responsibilities:**
- Centralized game state management
- Phase transitions (setup → playing → results)
- Score calculation and tracking
- Player management (add, toggle active status)

**Key State:**
```typescript
const [players, setPlayers] = useState<Player[]>([])
const [currentRound, setCurrentRound] = useState(1)
const [isDualScoring, setIsDualScoring] = useState(false)
const [isGameFinished, setIsGameFinished] = useState(false)
const [language, setLanguage] = useState<Language>('en')
const [highScoreWins, setHighScoreWins] = useState(true)
```

**Key Functions:**
- `handleStartGame()` - Initialize game with players
- `handleScoreSubmit()` - Update scores for current round
- `handleNextRound()` - Progress to next round
- `handlePreviousRound()` - Navigate back to edit scores
- `handleAddPlayer()` - Add player mid-game with calculated starting score
- `handleTogglePlayerActive()` - Mark player as inactive/active
- `handleFinishGame()` - Transition to results screen
- `handleNewGame()` - Reset all state

### 2. SetupScreen.tsx
**Location:** `src/components/game/SetupScreen.tsx`

**Purpose:** Initial game configuration interface

**Features:**
- Player count selection (2-10)
- Dynamic player name inputs
- Dual scoring toggle
- Score direction toggle (high/low wins)
- Language selection
- Input validation (names required)

**Props:**
```typescript
{
  onStartGame: (players, isDualScoring, highScoreWins) => void
  language: Language
  onLanguageChange: (lang: Language) => void
}
```

### 3. GameScreen.tsx
**Location:** `src/components/game/GameScreen.tsx`

**Purpose:** Active gameplay interface with live scoring

**Features:**
- Round-by-round score input
- Dual scoring (predictions + actual scores)
- Live cumulative score graph
- Player management:
  - Add new player mid-game
  - Mark player as "gave up"
  - Allow player to rejoin
- Round navigation (previous/next)
- Input validation

**Props:**
```typescript
{
  players: Player[]
  currentRound: number
  isDualScoring: boolean
  onScoreSubmit: (scores, predictions?) => void
  onNextRound: () => void
  onPreviousRound: () => void
  onAddPlayer: (name: string) => void
  onTogglePlayerActive: (playerId: string) => void
  language: Language
  highScoreWins: boolean
}
```

**Score Calculation Logic:**
- Dual scoring: `primary + prediction`
- Single scoring: `primary`
- Cumulative totals calculated on render

### 4. ResultsScreen.tsx
**Location:** `src/components/game/ResultsScreen.tsx`

**Purpose:** End-game summary with AI analysis

**Features:**
- Winner announcement with celebration animation
- Final score graph
- AI-generated game analysis (12 comedic personas)
- Text-to-speech narration
- Regenerate analysis option
- Start new game

**AI Analysis Themes:**
```typescript
[
  "a sarcastic sports commentator",
  "a dramatic Shakespeare-style narrator",
  "a detective investigating suspicious plays",
  "a nature documentary narrator",
  "a conspiracy theorist",
  // ... 7 more themes
]
```

**Props:**
```typescript
{
  players: Player[]
  onNewGame: () => void
  language: Language
  isDualScoring: boolean
  highScoreWins: boolean
}
```

### 5. ScoreGraph.tsx
**Location:** `src/components/game/ScoreGraph.tsx`

**Purpose:** Real-time score visualization using Recharts

**Features:**
- Line chart with cumulative scores
- 10 distinct player colors (HSL-based)
- Handles mid-game player joins
- Handles player give-ups/rejoins
- Custom tooltip with formatted data
- Responsive sizing

**Data Structure:**
```typescript
{
  round: number,
  [playerId]: number | null  // null for inactive rounds
}
```

**Color Palette:**
```typescript
const PLAYER_COLORS = [
  'hsl(217, 91%, 60%)',   // Blue
  'hsl(142, 71%, 45%)',   // Green
  'hsl(0, 72%, 51%)',     // Red
  // ... 7 more colors
]
```

### 6. PlayerScoreCard.tsx
**Location:** `src/components/game/PlayerScoreCard.tsx`

**Purpose:** Individual player result display

**Features:**
- Rank badge
- Trophy icon for winner
- Total score display
- Last prediction (for dual scoring)

---

## State Management

### Game State Structure

```typescript
// Core game state
interface Player {
  id: string                    // Unique identifier
  name: string                  // Player name
  totalScore: number            // Cumulative score
  scores: number[]              // Array of scores per round
  predictions?: number[]        // Optional predictions per round
  joinedAtRound: number         // Round when player joined (1-based)
  isActive: boolean             // Currently active in game
  gaveUpAtRound?: number        // Round when player gave up
}

// Game configuration
{
  players: Player[]             // All players
  currentRound: number          // Current round (1-based)
  isDualScoring: boolean        // Dual scoring mode enabled
  isGameFinished: boolean       // Game completed flag
  language: Language            // UI language (en/es/de)
  highScoreWins: boolean        // Score direction (true = high wins)
}
```

### State Update Patterns

**Immutable Updates:**
```typescript
// Adding a score
setPlayers(prev => prev.map(player => ({
  ...player,
  scores: [...player.scores, newScore],
  totalScore: player.totalScore + newScore
})))

// Adding a player mid-game
const avgScorePerRound = totalPoints / currentRound
const newPlayer = {
  id: crypto.randomUUID(),
  name,
  totalScore: avgScorePerRound * currentRound,
  scores: Array(currentRound).fill(avgScorePerRound),
  joinedAtRound: currentRound + 1,
  isActive: true
}
setPlayers(prev => [...prev, newPlayer])
```

**Parent-Child Communication:**
- Unidirectional data flow
- Props down, callbacks up
- State lifted to Index.tsx
- No prop drilling (max 2 levels)

---

## AI Integration

### Architecture

```
ResultsScreen → Supabase Edge Function → Lovable AI Gateway → Gemini 2.5 Flash
```

### Edge Function (analyze-game)
**Location:** `supabase/functions/analyze-game/index.ts`
**Runtime:** Deno Deploy

**Request Payload:**
```typescript
{
  players: Player[],
  language: Language,
  isDualScoring: boolean,
  highScoreWins: boolean
}
```

**Processing Steps:**
1. Validate input data
2. Calculate game statistics:
   - Winner determination
   - Biggest gain/loss per player
   - Final rankings
3. Select random comedic theme
4. Construct detailed LLM prompt
5. Call Lovable AI Gateway with Gemini 2.5 Flash
6. Return analysis text

**Prompt Engineering:**
```typescript
You are ${theme}. Analyze this ${isDualScoring ? 'prediction-based' : ''}
game where ${highScoreWins ? 'highest' : 'lowest'} score wins.

Winner: ${winner.name} (${winner.totalScore})
Rankings: [detailed player stats]
Notable moments: [biggest gains/losses]

Provide a ${language === 'en' ? '100-word' : ...} analysis in ${languageMap[language]}.
Be hilarious but stay in character as ${theme}.
```

**AI Gateway Configuration:**
- Model: `gemini-2.5-flash-latest-exp`
- Max tokens: 500
- Temperature: 0.8 (creative)
- Streaming: disabled

### Text-to-Speech Integration
**Component:** `TextToSpeech.tsx`

**Features:**
- Browser native Speech Synthesis API
- Theme-aware voice settings:
  - Sports commentator: rate 1.1, pitch 1.05
  - Shakespeare: rate 0.9, pitch 1.1
  - Detective: rate 0.95, pitch 0.95
  - Nature doc: rate 0.85, pitch 0.9
  - Default: rate 1.0, pitch 1.0
- Play/pause controls
- Language-aware voice selection

---

## Build System

### Vite Configuration
**Location:** `vite.config.ts`

```typescript
{
  server: { host: '::', port: 8080 },
  plugins: [
    react(),
    componentTagger(),  // Lovable tracking
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  }
}
```

**Features:**
- Fast HMR (Hot Module Replacement)
- React SWC for transpilation
- Path aliases (@/* → src/*)
- IPv6 support

### NPM Scripts
```json
{
  "dev": "vite",                              // Start dev server
  "build": "vite build",                      // Production build
  "build:dev": "vite build --mode development",
  "lint": "eslint .",                         // Run linter
  "preview": "vite preview"                   // Preview production build
}
```

### TypeScript Configuration
**Location:** `tsconfig.json`

**Key Settings:**
- Target: ES2020
- Module: ESNext
- Strict mode: Partially enabled
- Path aliases: @/* mapping
- Skip lib check: true (faster builds)

**Relaxed Settings:**
- `noUnusedLocals: false`
- `noUnusedParameters: false`
- `noImplicitAny: false`

### Build Output
- **Development:** Fast rebuilds, source maps
- **Production:** Minified, tree-shaken, optimized chunks
- **Output directory:** `dist/`

---

## Styling System

### Design Token Architecture
**Location:** `src/index.css`

**CSS Custom Properties (40+ tokens):**
```css
:root {
  /* Color palette in HSL */
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --secondary: 240 4.8% 95.9%;
  /* ... 30+ more tokens */
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  /* ... dark mode overrides */
}
```

**Design System Layers:**
1. **CSS Variables** - HSL color tokens
2. **Tailwind Utilities** - Compose with `bg-primary`, `text-foreground`
3. **shadcn Components** - Pre-styled, customizable
4. **Custom CSS** - Animations, gradients

### Tailwind Configuration
**Location:** `tailwind.config.ts`

**Custom Extensions:**
```typescript
{
  borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' },
  colors: { /* Maps to CSS variables */ },
  keyframes: { /* Custom animations */ }
}
```

### Animation System
```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes celebrate {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(-5deg); }
  75% { transform: scale(1.1) rotate(5deg); }
}
```

**Usage:**
- Fade-in: Page transitions
- Celebrate: Winner announcement
- Scale-in: Modal appearances

### Responsive Breakpoints
```typescript
sm: '640px',   // Tablets
md: '768px',   // Small laptops
lg: '1024px',  // Desktops
xl: '1280px',  // Large screens
2xl: '1536px'  // Extra large
```

---

## Internationalization

### Translation System
**Location:** `src/lib/translations.ts`

**Structure:**
```typescript
const translations = {
  en: {
    setupTitle: "Game Score Counter",
    playerCount: "How many players?",
    // ... 50+ translation keys
  },
  es: { /* Spanish translations */ },
  de: { /* German translations */ }
}
```

**Supported Languages:**
- English (en)
- Spanish (es)
- German (de)

**Implementation Pattern:**
```typescript
// Usage in components
const t = translations[language]
return <h1>{t.setupTitle}</h1>
```

**Dynamic Translations:**
```typescript
// With variable substitution
`${t.roundNumber} ${currentRound}`
`${t.playerJoined.replace('{player}', player.name)}`
```

**AI Analysis Localization:**
- Prompts sent with language context
- Word count adjusted per language (100 words EN, 120 ES, 110 DE)
- Theme descriptions in respective languages

---

## Key Features

### 1. Mid-Game Player Management

**Add Player:**
```typescript
// Calculate fair starting score
const totalRounds = currentRound
const totalPoints = players.reduce((sum, p) => sum + p.totalScore, 0)
const avgScorePerRound = totalPoints / totalRounds
const startingScore = avgScorePerRound * totalRounds

// Create new player with backfilled scores
const newPlayer = {
  scores: Array(totalRounds).fill(avgScorePerRound),
  totalScore: startingScore,
  joinedAtRound: currentRound + 1
}
```

**Give Up / Rejoin:**
```typescript
// Mark as inactive
player.isActive = false
player.gaveUpAtRound = currentRound

// Graph shows null for inactive rounds
graphData[round][player.id] = player.isActive ? score : null
```

### 2. Dual Scoring System

**Use Case:** Games like Wizard where players predict tricks

**Implementation:**
```typescript
interface Player {
  scores: number[]        // Actual scores
  predictions?: number[]  // Predicted scores
}

// Calculate score per round
if (isDualScoring) {
  totalScore = primaryScore + predictionScore
} else {
  totalScore = primaryScore
}
```

**UI Adaptation:**
- Two input fields per player per round
- Graph shows combined totals
- Results screen displays last prediction

### 3. Flexible Win Conditions

**High Score Wins (default):**
```typescript
const winner = [...players].sort((a, b) => b.totalScore - a.totalScore)[0]
```

**Low Score Wins:**
```typescript
const winner = [...players].sort((a, b) => a.totalScore - b.totalScore)[0]
```

**Ranking Calculation:**
```typescript
const sortedPlayers = highScoreWins
  ? [...players].sort((a, b) => b.totalScore - a.totalScore)
  : [...players].sort((a, b) => a.totalScore - b.totalScore)
```

### 4. Score Graph Visualization

**Features:**
- Real-time cumulative score updates
- 10-color player differentiation
- Handles variable player participation
- Custom tooltip with formatted data
- Responsive sizing

**Data Transformation:**
```typescript
const graphData = Array.from({ length: maxRound }, (_, i) => {
  const round = i + 1
  const dataPoint: any = { round }

  players.forEach(player => {
    // Only show score if player was active this round
    if (player.joinedAtRound <= round && player.isActive) {
      dataPoint[player.id] = cumulativeScore
    } else {
      dataPoint[player.id] = null
    }
  })

  return dataPoint
})
```

### 5. AI Game Analysis

**12 Comedic Personas:**
1. Sarcastic sports commentator
2. Shakespeare-style narrator
3. Detective investigating plays
4. Nature documentary narrator
5. Conspiracy theorist
6. Weather forecaster
7. Movie trailer narrator
8. Tech startup CEO
9. Pirate captain
10. Food critic
11. Fitness trainer
12. Meditation guru

**Analysis Content:**
- Winner celebration
- Player rankings with context
- Biggest gains/losses
- Strategic observations
- Character-specific humor

**Voice Settings per Theme:**
```typescript
const voiceSettings = {
  'sports commentator': { rate: 1.1, pitch: 1.05 },
  'Shakespeare': { rate: 0.9, pitch: 1.1 },
  'detective': { rate: 0.95, pitch: 0.95 },
  'nature documentary': { rate: 0.85, pitch: 0.9 }
}
```

---

## Development Workflow

### Local Development

**Prerequisites:**
```bash
node >= 18.0.0
npm or bun
```

**Setup:**
```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:8080
```

**Development Features:**
- Hot Module Replacement (HMR)
- Fast Refresh for React
- Source maps
- TypeScript type checking
- ESLint warnings

### Code Quality

**Linting:**
```bash
npm run lint
```

**Type Checking:**
```bash
npx tsc --noEmit
```

**Code Formatting:**
- Relies on ESLint + Prettier (if configured)
- shadcn components follow consistent patterns

### Deployment

**Production Build:**
```bash
npm run build
# Output: dist/
```

**Build Artifacts:**
- Minified JavaScript bundles
- Optimized CSS
- Source maps (optional)
- Static assets

**Deployment Target:**
- Lovable.app (current deployment)
- Can deploy to Vercel, Netlify, Cloudflare Pages
- Requires static hosting (SPA)

### Environment Configuration

**Supabase Integration:**
```typescript
// src/integrations/supabase/client.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

**Required Environment Variables:**
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Edge Function Development

**Local Testing:**
```bash
# Requires Supabase CLI
supabase functions serve analyze-game

# Test with curl
curl -X POST http://localhost:54321/functions/v1/analyze-game \
  -H "Content-Type: application/json" \
  -d '{"players": [...], "language": "en"}'
```

**Deployment:**
```bash
supabase functions deploy analyze-game
```

---

## Performance Considerations

### Current Optimizations
- **Component size:** Small, focused components
- **No heavy libraries:** Lightweight dependencies
- **Lazy loading:** React Router code splitting
- **Immutable updates:** Efficient React re-renders
- **No virtual scrolling:** Player count capped at 10

### Potential Optimizations
- **Memoization:** useMemo for expensive calculations (graph data)
- **useCallback:** Prevent unnecessary re-renders
- **Code splitting:** Lazy load Results screen
- **Image optimization:** Compress public assets
- **Bundle analysis:** Identify large dependencies

### Current Bundle Size
- React + React DOM: ~140 KB
- Recharts: ~80 KB
- shadcn/ui + Radix: ~200 KB (tree-shakeable)
- Total estimated: ~500-600 KB (uncompressed)

---

## Security Considerations

### Current Security Measures
- **Input validation:** Name length, score type checking
- **CORS:** Edge function configured for Lovable domain
- **No user auth:** No sensitive data storage
- **Client-side only:** No backend persistence
- **Supabase anon key:** Public, limited permissions

### Data Privacy
- **No data persistence:** All game data in memory
- **No analytics:** Privacy-first approach
- **No user tracking:** No cookies or localStorage for user data

---

## Future Enhancement Opportunities

### Potential Features
1. **Game history persistence** (localStorage or Supabase)
2. **Multiplayer sync** (real-time with Supabase Realtime)
3. **Custom scoring rules** (per-game configuration)
4. **Statistics dashboard** (player win rates over time)
5. **Export game data** (CSV, JSON)
6. **Custom themes** (user-defined color schemes)
7. **PWA support** (offline capability)
8. **Undo/redo** (score entry mistakes)
9. **Game templates** (preset rules for popular games)
10. **Shareable game links** (share results)

### Technical Debt
- Add comprehensive unit tests (Vitest)
- Add E2E tests (Playwright)
- Implement error boundaries
- Add loading states for async operations
- Improve accessibility (ARIA labels)
- Add storybook for component documentation

---

## References

### Key Files
- **Entry Point:** `src/main.tsx`
- **Main Orchestrator:** `src/pages/Index.tsx`
- **Type Definitions:** `src/types/game.ts`
- **Translations:** `src/lib/translations.ts`
- **AI Function:** `supabase/functions/analyze-game/index.ts`
- **Design Tokens:** `src/index.css`

### External Resources
- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Recharts Documentation](https://recharts.org)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Tailwind CSS](https://tailwindcss.com)

---

**Document Version:** 1.0
**Last Updated:** 2025-12-26
**Codebase Version:** main branch (commit 5efadec)
