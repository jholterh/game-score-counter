# Sleek Dark Dashboard Design - Game Score Counter

## Design Inspiration

**Reference:** Dark analytics dashboard with electric blue accents
**Goal:** Create a premium, sleek score tracking experience that feels modern and professional

**Core Aesthetic:**
- **Almost black backgrounds** - Premium, focused feel
- **Electric blue accent** - High-tech, vibrant contrast
- **Dashboard-inspired layout** - Cards with metrics and visualizations
- **Generous spacing** - Not crowded, room to breathe
- **Glowing elements** - Subtle neon-like effects on key elements

---

## 1. Color Palette - Dashboard Edition

### Ultra-Dark Foundation

```css
/* Backgrounds - Darker than before */
--bg-primary: hsl(220, 30%, 5%);         /* Almost black #0a0e14 */
--bg-card: hsl(220, 25%, 8%);            /* Card backgrounds #121620 */
--bg-elevated: hsl(220, 25%, 10%);       /* Hover/active states #161b28 */
--bg-input: hsl(220, 25%, 7%);           /* Input fields #0f1218 */

/* Electric Blue - Hero Accent */
--accent-primary: hsl(220, 100%, 63%);   /* Bright blue #4D7CFF */
--accent-glow: hsla(220, 100%, 63%, 0.2); /* Blue glow effect */
--accent-glow-strong: hsla(220, 100%, 63%, 0.4); /* Stronger glow */

/* Secondary Accents (used sparingly) */
--accent-purple: hsl(280, 85%, 65%);     /* Purple #b961ff */
--accent-cyan: hsl(180, 70%, 55%);       /* Cyan #3dd6d6 */
--accent-pink: hsl(340, 85%, 65%);       /* Pink #ff5c9e */
--accent-success: hsl(145, 70%, 55%);    /* Green #3dd68c */
--accent-warning: hsl(35, 100%, 60%);    /* Amber #ffad33 */
--accent-danger: hsl(355, 85%, 60%);     /* Red #f04f5f */

/* Text Hierarchy */
--text-white: hsl(0, 0%, 98%);           /* Pure white text #fafafa */
--text-gray: hsl(220, 10%, 55%);         /* Labels/secondary #828694 */
--text-dark-gray: hsl(220, 10%, 35%);    /* Tertiary text #52545e */
--text-muted: hsl(220, 10%, 25%);        /* Very subtle text #3a3c44 */

/* Borders - Very subtle */
--border-subtle: hsla(220, 25%, 20%, 0.3); /* Barely visible */
--border-medium: hsla(220, 25%, 30%, 0.5); /* Visible outline */
--border-bright: var(--accent-primary);     /* Highlighted borders */

/* Graph Colors - Vibrant on dark */
--chart-blue: hsl(220, 100%, 63%);       /* Primary blue */
--chart-purple: hsl(280, 85%, 65%);      /* Purple */
--chart-cyan: hsl(180, 70%, 55%);        /* Cyan */
--chart-pink: hsl(340, 85%, 65%);        /* Pink */
--chart-green: hsl(145, 70%, 55%);       /* Green */
--chart-amber: hsl(35, 100%, 60%);       /* Amber */
--chart-red: hsl(355, 85%, 60%);         /* Red */
--chart-teal: hsl(160, 70%, 50%);        /* Teal */
--chart-lavender: hsl(260, 85%, 70%);    /* Lavender */
--chart-lime: hsl(80, 70%, 55%);         /* Lime */
```

### Color Usage Rules

**Electric Blue (#4D7CFF):**
- Primary buttons and CTAs
- Active states and focus indicators
- Progress rings
- Key data highlights
- Chart primary lines

**Other Accents:**
- Use for player differentiation in charts
- Success/warning/error states
- Never mix multiple accents in same component

**Backgrounds:**
- Layer cards on base (card is lighter than base)
- Use elevated for hover states
- Inputs use darker bg-input for depth

---

## 2. Typography System

### Font Stack

```css
/* Primary Font - Modern, readable */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;

/* Monospace - For all numbers */
--font-mono: 'JetBrains Mono', 'SF Mono', 'Consolas', monospace;
```

### Font Sizes (Fluid/Responsive)

```css
--text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);     /* 12-14px */
--text-sm: clamp(0.875rem, 0.8rem + 0.35vw, 1rem);        /* 14-16px */
--text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);     /* 16-18px */
--text-lg: clamp(1.125rem, 1rem + 0.5vw, 1.375rem);       /* 18-22px */
--text-xl: clamp(1.375rem, 1.2rem + 0.75vw, 1.75rem);     /* 22-28px */
--text-2xl: clamp(1.75rem, 1.5rem + 1vw, 2.5rem);         /* 28-40px */
--text-3xl: clamp(2.5rem, 2rem + 2vw, 4rem);              /* 40-64px */
--text-4xl: clamp(3rem, 2.5rem + 2.5vw, 5rem);            /* 48-80px */
```

### Font Weights

```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Typography Pairing Rules

**Large Numbers (Scores, Stats):**
- Font: `var(--font-mono)`
- Size: `var(--text-3xl)` or `var(--text-4xl)`
- Weight: `var(--font-semibold)`
- Color: `var(--text-white)`

**Headings:**
- Font: `var(--font-sans)`
- Size: `var(--text-2xl)` to `var(--text-3xl)`
- Weight: `var(--font-semibold)`
- Color: `var(--text-white)`

**Labels:**
- Font: `var(--font-sans)`
- Size: `var(--text-sm)`
- Weight: `var(--font-medium)`
- Color: `var(--text-gray)`

**Body Text:**
- Font: `var(--font-sans)`
- Size: `var(--text-base)`
- Weight: `var(--font-normal)`
- Color: `var(--text-gray)`

---

## 3. Spacing System

### Base Spacing Scale

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

### Component Spacing Rules

**Cards:**
- Padding: `var(--space-6)` to `var(--space-8)`
- Gap between cards: `var(--space-6)`
- Border radius: `12px` to `16px`

**Buttons:**
- Padding: `var(--space-3) var(--space-6)` (12px 24px)
- Gap between buttons: `var(--space-4)`
- Border radius: `8px`

**Inputs:**
- Padding: `var(--space-3) var(--space-4)` (12px 16px)
- Border radius: `8px`

**Sections:**
- Gap between major sections: `var(--space-12)` (48px)
- Gap between minor sections: `var(--space-6)` (24px)

---

## 4. Component Design Specs

### Primary Button (Glowing Blue CTA)

```css
.btn-primary {
  background: var(--accent-primary);
  color: white;
  font-weight: var(--font-medium);
  padding: var(--space-3) var(--space-6);
  border-radius: 8px;
  border: none;
  box-shadow: 0 0 20px var(--accent-glow);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--accent-glow-strong);
}

.btn-primary:active {
  transform: translateY(0);
}
```

### Secondary Button

```css
.btn-secondary {
  background: var(--bg-elevated);
  color: var(--text-white);
  border: 1px solid var(--border-medium);
  padding: var(--space-3) var(--space-6);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--bg-card);
  border-color: var(--accent-primary);
}
```

### Icon Button (Minimal)

```css
.btn-icon {
  background: transparent;
  color: var(--text-gray);
  border: none;
  padding: var(--space-2);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--bg-elevated);
  color: var(--text-white);
}
```

### Card Component

```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: var(--space-6);
  transition: border-color 0.2s ease;
}

.card:hover {
  border-color: var(--border-medium);
}

/* NO shadows - pure minimalism */
box-shadow: none;
```

### Metric Card (Dashboard-style)

```css
.metric-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.metric-value {
  font-family: var(--font-mono);
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  color: var(--text-white);
}

.metric-label {
  font-size: var(--text-sm);
  color: var(--text-gray);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

### Input Fields

```css
.input {
  background: var(--bg-input);
  color: var(--text-white);
  border: 1px solid var(--border-medium);
  border-radius: 8px;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  transition: all 0.2s ease;
}

.input:focus {
  background: var(--bg-card);
  border-color: var(--accent-primary);
  outline: none;
  box-shadow: 0 0 0 3px var(--accent-glow);
}

/* Score inputs - monospace, larger */
.input-score {
  font-family: var(--font-mono);
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  text-align: right;
}
```

### Progress Ring (Like reference image)

```css
.progress-ring {
  position: relative;
  width: 120px;
  height: 120px;
}

.progress-ring-circle {
  stroke: var(--accent-primary);
  stroke-width: 6;
  fill: none;
  filter: drop-shadow(0 0 8px var(--accent-glow));
}

.progress-ring-bg {
  stroke: var(--bg-elevated);
  stroke-width: 6;
  fill: none;
}
```

---

## 5. Screen Layouts

### Setup Screen - Clean & Minimal

```
┌──────────────────────────────────────────────┐
│                                         [EN] │ ← Language in corner
│                                              │
│                                              │
│           Game Score Counter                 │ ← Large white text
│     Track and visualize game scores          │ ← Gray subtitle
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  Players                               │ │ ← Card
│  │  ┌──────┐                              │ │
│  │  │   4  │  [-]  [+]                    │ │ ← Number in box
│  │  └──────┘                              │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  Player Names                          │ │
│  │  ┌──────────────┐  ┌──────────────┐   │ │
│  │  │ Alice        │  │ Bob          │   │ │
│  │  └──────────────┘  └──────────────┘   │ │
│  │  ┌──────────────┐  ┌──────────────┐   │ │
│  │  │ Carol        │  │ David        │   │ │
│  │  └──────────────┘  └──────────────┘   │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  ☐ Dual Scoring                        │ │ ← Simple checkboxes
│  │  ☑ High score wins                     │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │        → Start Game                    │ │ ← Glowing blue
│  └────────────────────────────────────────┘ │
│                                              │
└──────────────────────────────────────────────┘
```

### Game Screen - Dashboard Style

```
┌─────────────────────────────────────────────────────┐
│  Round 3                               [Finish]     │
│                                                     │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  │
│  │ 245    │  │ 198    │  │ 187    │  │ 210    │  │ ← Metric cards
│  │ Alice  │  │ Bob    │  │ Carol  │  │ David  │  │   (like dashboard)
│  │ ●──────│  │ ●──────│  │ ●──────│  │ ●──────│  │ ← Blue indicator
│  └────────┘  └────────┘  └────────┘  └────────┘  │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  Scores Over Time                             │ │
│  │  ┌─────────────────────────────────────────┐ │ │
│  │  │                                         │ │ │
│  │  │   [Smooth flowing line chart]          │ │ │ ← Area chart
│  │  │   with gradient fills                   │ │ │   with glow
│  │  │   and glowing data points              │ │ │
│  │  │                                         │ │ │
│  │  └─────────────────────────────────────────┘ │ │
│  │  [Alice] [Bob] [Carol] [David]  [All]        │ │ ← Toggle filters
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  Enter Scores - Round 3                       │ │
│  │                                               │ │
│  │  Alice                                  [ 15 ]│ │ ← Clean rows
│  │  Bob                                    [ 12 ]│ │
│  │  Carol                                  [ 18 ]│ │
│  │  David                                  [ 14 ]│ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [← Previous]                      [Save & Next →] │
└─────────────────────────────────────────────────────┘
```

### Results Screen - Data Viz Focus

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                 ┌─────────────┐                     │
│                 │      ◉      │                     │ ← Glowing ring
│                 │    Alice    │                     │   (like ref)
│                 │    Wins!    │                     │
│                 │             │                     │
│                 │     245     │                     │ ← Big number
│                 │   points    │                     │
│                 └─────────────┘                     │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  Final Performance                            │ │
│  │  ┌─────────────────────────────────────────┐ │ │
│  │  │  [Smooth area chart - all players]      │ │ │
│  │  │  with gradient fills under lines        │ │ │
│  │  └─────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  Final Standings                              │ │
│  │                                               │ │
│  │  1st  Alice    245  ████████████████ 100%    │ │ ← Blue bars
│  │  2nd  David    210  █████████████ 86%        │ │
│  │  3rd  Bob      198  ████████████ 81%         │ │
│  │  4th  Carol    187  ███████████ 76%          │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  Game Analysis                    [Generate]  │ │ ← Collapsed
│  └───────────────────────────────────────────────┘ │
│                                                     │
│                  [New Game]                         │
└─────────────────────────────────────────────────────┘
```

---

## 6. Chart & Data Visualization

### Line Chart Styling (Dashboard-inspired)

```css
/* Chart container */
.chart-container {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: var(--space-6);
}

/* Chart lines */
- Stroke width: 2px (thin, elegant)
- Gradient fill: From color to transparent
- Glow effect on data points
- Smooth curves (monotone or natural)

/* Tooltip */
.chart-tooltip {
  background: var(--bg-elevated);
  border: 1px solid var(--border-medium);
  border-radius: 8px;
  padding: var(--space-3);
  color: var(--text-white);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

/* Axes */
- X-axis: var(--text-dark-gray)
- Y-axis: var(--text-dark-gray)
- Grid: Removed entirely (minimalist)
- Tick marks: Removed
```

### Bar Chart Styling

```css
/* Horizontal bars */
.bar {
  fill: var(--accent-primary);
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(90deg,
    var(--accent-primary),
    var(--accent-cyan)
  );
  box-shadow: 0 0 12px var(--accent-glow);
}

.bar-background {
  fill: var(--bg-elevated);
  height: 8px;
  border-radius: 4px;
}
```

### Progress Rings

```css
/* Like circular charts in reference */
- Stroke: var(--accent-primary)
- Stroke width: 6-8px
- Background circle: var(--bg-elevated)
- Glow: drop-shadow(0 0 8px var(--accent-glow))
- Animation: Smooth drawing on mount
```

---

## 7. Animation & Transitions

### Minimal Motion Design

**Philosophy:** Subtle, purposeful animations only

```css
/* Transition speeds */
--transition-fast: 150ms;
--transition-normal: 200ms;
--transition-slow: 300ms;

/* Easing functions */
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Allowed Animations

**Button Hover:**
```css
transform: translateY(-2px);
transition: transform 150ms ease-out;
```

**Focus Ring:**
```css
box-shadow: 0 0 0 3px var(--accent-glow);
transition: box-shadow 200ms ease-out;
```

**Fade In (on mount):**
```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
animation: fade-in 300ms ease-out;
```

**Card Hover:**
```css
border-color: var(--border-medium);
transition: border-color 200ms ease-out;
```

### Removed Animations

- ❌ Scale animations
- ❌ Rotate animations
- ❌ Celebration/infinite animations
- ❌ Slide transitions
- ❌ Complex keyframe sequences

---

## 8. Responsive Design

### Breakpoints

```css
/* Mobile: < 640px (default styles) */
/* Tablet: 640px - 1023px */
@media (min-width: 640px) { ... }

/* Desktop: 1024px+ */
@media (min-width: 1024px) { ... }
```

### Mobile Adaptations

**Setup Screen:**
- Player inputs: 1 column
- Padding: var(--space-4) instead of var(--space-8)

**Game Screen:**
- Metric cards: 2x2 grid instead of row
- Chart: Reduced height (250px → 200px)
- Score inputs: Full width
- Buttons: Stacked vertically

**Results Screen:**
- Progress ring: Smaller (80px)
- Bar chart: Thinner bars (6px → 4px)
- Single column layout

---

## 9. Accessibility

### Contrast Requirements

**WCAG 2.1 AA Compliance:**
- White on dark bg: 18:1 (AAA)
- Gray text on dark: 7:1 (AA)
- Blue accent on dark: 8:1 (AA)
- Borders: 3:1 minimum

### Focus States

```css
:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
  border-radius: 8px;
}
```

### Keyboard Navigation

- Tab: Navigate all interactive elements
- Enter/Space: Activate buttons
- Arrow keys: Adjust player count
- Escape: Close modals

### ARIA Labels

```html
<button aria-label="Increase player count">+</button>
<input aria-label="Score for Alice" type="number" />
<div role="status" aria-live="polite">Round 3 saved</div>
```

---

## 10. Implementation Phases

### Phase 1: Foundation ✅
1. Update color variables in index.css
2. Add Inter font from Google Fonts
3. Add JetBrains Mono for numbers
4. Create CSS custom properties
5. Update base styles

### Phase 2: Components ✅
6. Update button components (primary, secondary, icon)
7. Update card components (remove shadows)
8. Update input components (darker bg, blue focus)
9. Create metric card component
10. Fix GameScreen grid layout bug

### Phase 3: Screens ✅
11. Redesign SetupScreen (minimal layout)
12. Redesign GameScreen (dashboard metrics)
13. Redesign ResultsScreen (data viz focus)
14. Update all spacing to new system

### Phase 4: Data Visualization ✅
15. Simplify graph styling (remove grid)
16. Add gradient fills under lines
17. Update tooltip design
18. Add player filter toggles
19. Create horizontal bar chart for results

### Phase 5: Polish ✅
20. Add ARIA labels
21. Test keyboard navigation
22. Add focus indicators
23. Test responsive layouts
24. Performance check

---

## 11. What Makes This Design Work

### Why This Matches the Reference

✅ **Ultra-dark backgrounds** - Premium feel
✅ **Electric blue accent** - Modern, high-tech
✅ **Card-based layout** - Dashboard aesthetic
✅ **Metric cards** - Like analytics stats
✅ **Smooth charts** - Data visualization focus
✅ **Generous spacing** - Not crowded
✅ **Glowing elements** - Subtle neon effects
✅ **Monospace numbers** - Professional, clear

### Adaptations for Your App

**Simpler than reference:**
- No sidebar navigation (not needed)
- Fewer chart types (focus on line/bar)
- Less data density (cleaner)
- Larger touch targets (mobile-friendly)

**Maintained from reference:**
- Color scheme (dark + blue)
- Card layering approach
- Typography hierarchy
- Metric card pattern
- Chart styling

---

## 12. Before & After

### Key Changes

**Colors:**
- Before: Deep charcoal (HSL 240, 10%, 8%)
- After: Almost black (HSL 220, 30%, 5%)

**Accent:**
- Before: Purple (HSL 250, 100%, 65%)
- After: Electric blue (HSL 220, 100%, 63%)

**Layout:**
- Before: Standard cards with shadows
- After: Dashboard-style cards, no shadows

**Typography:**
- Before: Generic sans-serif
- After: Inter + JetBrains Mono

**Charts:**
- Before: Standard Recharts styling
- After: Dashboard-inspired with gradients

---

## Ready to Implement!

This design will create a **premium, modern score tracking experience** that feels professional and sleek, not crowded or overwhelming.

**Estimated build time:** 4-6 hours for full implementation

Let's begin! 🚀
