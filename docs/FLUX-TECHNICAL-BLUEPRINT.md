# Flux Technical Blueprint

**Architecture, Stack & Implementation**

**Last Updated:** December 2, 2025

---

## Document Purpose

This document defines the technical architecture for Flux. It covers the current prototype, target architecture, and implementation details. This is a living document that will expand during the build phase.

For product specifications, see FLUX-PRODUCT-BLUEPRINT.md.
For timeline, see FLUX-ROADMAP.md.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Current Prototype](#2-current-prototype)
3. [Target Architecture](#3-target-architecture)
4. [Data Models](#4-data-models)
5. [Key Algorithms](#5-key-algorithms)
6. [API Integrations](#6-api-integrations)
7. [Security Considerations](#7-security-considerations)
8. [Development Workflow](#8-development-workflow)

---

## 1. Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (React)                          │
├─────────────────────────────────────────────────────────────┤
│  UI Components  │  Contexts  │  Utilities  │  Styles        │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                          │
├─────────────────────────────────────────────────────────────┤
│  HabitContext (habits, logs, transfers, user)               │
│  NavigationContext (page transitions)                        │
│  FluxChatContext (AI chat state)                            │
└────────────────────────────┬────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
┌─────────────────┐ ┌───────────────┐ ┌─────────────────┐
│  localStorage   │ │  Anthropic    │ │  Future:        │
│  (MVT)          │ │  Claude API   │ │  Supabase +     │
│                 │ │               │ │  Stripe + Plaid │
└─────────────────┘ └───────────────┘ └─────────────────┘
```

### Architecture Principles

1. **Single Source of Truth** - All habit data flows through HabitContext
2. **Client-First for MVT** - localStorage persistence, no backend required
3. **Mobile-First Design** - Touch interactions, responsive layouts
4. **Offline Capable** - App functions without network (except AI features)
5. **Migration Ready** - Data structures designed for cloud migration

---

## 2. Current Prototype

### Tech Stack (Deployed)

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | React 18 | Vite build system |
| State | React Context | HabitContext, NavigationContext, FluxChatContext |
| Styling | CSS Modules | CSS variables for theming |
| Persistence | localStorage | Client-side only |
| Hosting | Vercel | Automatic deployments |
| Version Control | GitHub | Main branch deploys |

### Folder Structure

```
flux-2.0/
├── src/
│   ├── components/
│   │   ├── common/          # Shared UI components
│   │   ├── habits/          # Habit-related components
│   │   ├── portfolio/       # Portfolio views
│   │   ├── activity/        # Activity feed
│   │   └── chat/            # AI chat components
│   ├── contexts/
│   │   ├── HabitContext.jsx
│   │   ├── NavigationContext.jsx
│   │   └── FluxChatContext.jsx
│   ├── pages/
│   │   ├── Home/
│   │   ├── Portfolio/
│   │   ├── Indices/
│   │   ├── Activity/
│   │   ├── Settings/
│   │   └── HabitDetail/
│   ├── utils/
│   │   ├── calculations.js  # Money & score calculations
│   │   ├── patterns.js      # Pattern recognition
│   │   └── formatters.js    # Display formatting
│   ├── styles/
│   │   └── variables.css    # Theme variables
│   ├── App.jsx
│   └── main.jsx
├── public/
├── package.json
└── vite.config.js
```

### Context Architecture

**HabitContext.jsx** - Central state management
```javascript
{
  habits: [...],           // All habit configurations
  logs: [...],             // Activity log entries
  pendingBalance: number,  // Current week earnings
  portfolioBalance: number, // Total transferred
  transfers: [...],        // Transfer history
  user: {...}              // User preferences
}
```

**NavigationContext.jsx** - Page transitions
```javascript
{
  direction: 'forward' | 'back',
  setDirection: function
}
```

**FluxChatContext.jsx** - AI chat state
```javascript
{
  isOpen: boolean,
  openChat: function,
  closeChat: function,
  toggleChat: function
}
```

---

## 3. Target Architecture

### Phase 4+ Architecture (Post-Validation)

```
┌─────────────────────────────────────────────────────────────┐
│                   MOBILE CLIENT                              │
│              (React Native - iOS/Android)                    │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER                               │
├─────────────────────────────────────────────────────────────┤
│  Supabase Edge Functions  │  Anthropic API                  │
└────────────────────────────┬────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
┌─────────────────┐ ┌───────────────┐ ┌─────────────────┐
│  Supabase       │ │  Stripe       │ │  Plaid          │
│  PostgreSQL     │ │  Treasury     │ │  Link           │
│  Auth           │ │  Transfers    │ │  Bank Connect   │
└─────────────────┘ └───────────────┘ └─────────────────┘
```

### Target Tech Stack

| Layer | Technology | Phase |
|-------|------------|-------|
| Mobile | React Native | Phase 6 |
| Web | React (maintained) | Phase 1+ |
| Backend | Supabase | Phase 4 |
| Database | PostgreSQL | Phase 4 |
| Auth | Supabase Auth | Phase 4 |
| Banking | Stripe Treasury | Phase 4 |
| Bank Linking | Plaid | Phase 4 |
| AI | Anthropic Claude | Phase 1+ |
| Notifications | Firebase/OneSignal | Phase 5 |

---

## 4. Data Models

### Habit Model

```javascript
{
  id: string,              // UUID
  ticker: string,          // e.g., "$RUN", "$GYM"
  name: string,            // Display name
  category: string,        // FITNESS | FINANCIAL | PRODUCTIVITY | WELLNESS
  rateType: string,        // BINARY | DURATION | DISTANCE | COUNT
  rateAmount: number,      // Dollar amount per unit
  rateUnit: string,        // "session" | "minute" | "mile" | "rep"
  isNegative: boolean,     // true for quit behaviors
  createdAt: timestamp,
  
  // Pattern Recognition (calculated)
  baseline: {
    frequency: number,     // Average logs per 14 days
    typicalGap: number,    // Average days between logs
    gapVariance: number,   // Consistency measure
    avgUnits: number,      // Average units per log
    status: string         // "building" | "emerging" | "established"
  }
}
```

### Log Model

```javascript
{
  id: string,              // UUID
  habitId: string,         // Reference to habit
  timestamp: timestamp,    // When logged
  units: number,           // Duration/distance/count
  earned: number,          // Dollar amount earned
  notes: string,           // Optional user notes
  
  // For negative behaviors (slips)
  isSlip: boolean,         // true if logging a failure
}
```

### Transfer Model

```javascript
{
  id: string,              // UUID
  date: timestamp,         // Friday transfer date
  amount: number,          // Total transferred
  breakdown: [             // Per-habit breakdown
    { habitId: string, amount: number }
  ],
  status: string           // "pending" | "completed" | "failed"
}
```

### User Model (Phase 4+)

```javascript
{
  id: string,              // UUID
  email: string,
  createdAt: timestamp,
  
  // Plaid (Phase 4)
  plaidAccessToken: string,
  linkedAccountId: string,
  
  // Stripe Treasury (Phase 4)
  stripeCustomerId: string,
  treasuryAccountId: string,
  
  // Preferences
  preferences: {
    notifications: boolean,
    weeklyReports: boolean
  }
}
```

---

## 5. Key Algorithms

### Flux Score Calculation

**Total Score: 100 points across 5 components**

```javascript
function calculateFluxScore(habit, logs) {
  // Require minimum 10 logs
  if (logs.length < 10) {
    return { score: null, status: 'building' };
  }
  
  const baseline = calculateBaseline(logs);
  const recentLogs = logs.filter(l => isWithin14Days(l.timestamp));
  
  // 1. Frequency Trend (30 points)
  const recentFrequency = recentLogs.length;
  const frequencyScore = 30 * Math.min(1, recentFrequency / baseline.frequency);
  
  // 2. Consistency (25 points)
  const gaps = calculateGaps(recentLogs);
  const gapVariance = standardDeviation(gaps);
  const consistencyScore = 25 * Math.exp(-gapVariance / baseline.typicalGap);
  
  // 3. Recency (20 points)
  const daysSinceLog = daysSince(mostRecentLog(logs));
  const recencyScore = 20 * Math.exp(-daysSinceLog / baseline.typicalGap);
  
  // 4. Volume/Intensity (15 points)
  const recentAvgUnits = average(recentLogs.map(l => l.units));
  const volumeScore = 15 * Math.min(1, recentAvgUnits / baseline.avgUnits);
  
  // 5. Data Maturity (10 points)
  const maturityScore = 10 * Math.min(1, logs.length / 30);
  
  const totalScore = frequencyScore + consistencyScore + 
                     recencyScore + volumeScore + maturityScore;
  
  return {
    score: Math.round(totalScore),
    components: {
      frequency: frequencyScore,
      consistency: consistencyScore,
      recency: recencyScore,
      volume: volumeScore,
      maturity: maturityScore
    },
    status: 'established'
  };
}
```

### Pattern Recognition

```javascript
function calculateBaseline(logs) {
  const sortedLogs = logs.sort((a, b) => a.timestamp - b.timestamp);
  
  // Calculate gaps between consecutive logs
  const gaps = [];
  for (let i = 1; i < sortedLogs.length; i++) {
    gaps.push(daysBetween(sortedLogs[i-1].timestamp, sortedLogs[i].timestamp));
  }
  
  return {
    frequency: logs.length / 14,  // Logs per 14-day period
    typicalGap: median(gaps),
    gapVariance: standardDeviation(gaps),
    avgUnits: average(logs.map(l => l.units)),
    status: getBaselineStatus(logs.length)
  };
}

function getBaselineStatus(logCount) {
  if (logCount < 10) return 'building';
  if (logCount < 30) return 'emerging';
  return 'established';
}
```

### Money Calculations

```javascript
function calculateEarnings(habit, log) {
  // Negative behaviors (slips) don't earn
  if (habit.isNegative && log.isSlip) {
    return 0;
  }
  
  switch (habit.rateType) {
    case 'BINARY':
      return habit.rateAmount;  // Flat rate per session
    case 'DURATION':
      return habit.rateAmount * log.units;  // $ per minute
    case 'DISTANCE':
      return habit.rateAmount * log.units;  // $ per mile
    case 'COUNT':
      return habit.rateAmount * log.units;  // $ per unit
    default:
      return 0;
  }
}

function processWeeklyTransfer(habits, logs, currentWeekStart) {
  const weekLogs = logs.filter(l => 
    l.timestamp >= currentWeekStart && 
    l.timestamp < addDays(currentWeekStart, 7)
  );
  
  let totalAmount = 0;
  const breakdown = [];
  
  for (const habit of habits) {
    const habitLogs = weekLogs.filter(l => l.habitId === habit.id);
    const habitTotal = habitLogs.reduce((sum, l) => sum + l.earned, 0);
    
    if (habitTotal > 0) {
      breakdown.push({ habitId: habit.id, amount: habitTotal });
      totalAmount += habitTotal;
    }
  }
  
  return {
    date: getFriday(currentWeekStart),
    amount: totalAmount,
    breakdown,
    status: 'completed'
  };
}
```

### Behavior-Level Index Calculation

```javascript
function calculateBehaviorIndex(behaviorId, allUserData) {
  // Filter to users with this behavior and minimum logs
  const eligibleUsers = allUserData.filter(u => 
    u.behaviors[behaviorId] && 
    u.behaviors[behaviorId].logs.length >= 10
  );
  
  // Require minimum 50 users for valid index
  if (eligibleUsers.length < 50) {
    return { valid: false, reason: 'insufficient_users' };
  }
  
  // Calculate each user's performance ratio
  const performanceRatios = eligibleUsers.map(u => {
    const behavior = u.behaviors[behaviorId];
    const recentFrequency = getRecentFrequency(behavior.logs);
    const baseline = behavior.baseline.frequency;
    return recentFrequency / baseline;
  });
  
  // Index = average of all ratios × 100
  const indexValue = average(performanceRatios) * 100;
  
  return {
    valid: true,
    value: Math.round(indexValue * 10) / 10,
    userCount: eligibleUsers.length,
    updatedAt: new Date()
  };
}

function calculateUserPercentile(userId, behaviorId, allUserData) {
  const userRatio = getUserPerformanceRatio(userId, behaviorId);
  const allRatios = getAllPerformanceRatios(behaviorId, allUserData);
  
  const belowCount = allRatios.filter(r => r < userRatio).length;
  return Math.round((belowCount / allRatios.length) * 100);
}
```

---

## 6. API Integrations

### Anthropic Claude API (Phase 1)

**Use Cases:**
- Contextual insights on habit performance
- Pattern observations
- Coaching suggestions
- Optional chat exploration

**Implementation:**
```javascript
// Vercel Edge Function or direct client call
async function getFluxInsight(habitData, userContext) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    system: FLUX_AI_SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: formatContextForAI(habitData, userContext) }
    ]
  });
  
  return response.content[0].text;
}
```

**Cost Management:**
- Cache common insights
- Limit to 3% of revenue target
- Optimize prompt length

### Plaid API (Phase 4)

**Use Cases:**
- Link user bank accounts
- Verify account ownership
- Check available balance before transfers

**Key Endpoints:**
- `/link/token/create` - Initialize Plaid Link
- `/item/public_token/exchange` - Get access token
- `/accounts/balance/get` - Check balance

### Stripe Treasury API (Phase 4)

**Use Cases:**
- Create FDIC-insured accounts
- Process Friday transfers
- Handle withdrawals

**Key Endpoints:**
- `/v1/treasury/financial_accounts` - Create/manage accounts
- `/v1/treasury/outbound_transfers` - Process transfers
- `/v1/treasury/transactions` - Transaction history

---

## 7. Security Considerations

### MVT Phase (localStorage)

| Risk | Mitigation |
|------|------------|
| Data in browser storage | Accept for MVP; warn users data is local-only |
| No authentication | Accept for MVP; single-user assumption |
| API key exposure | Use Vercel Edge Functions for AI calls |

### Phase 4+ (Production)

| Area | Implementation |
|------|----------------|
| Authentication | Supabase Auth (email, OAuth) |
| Data encryption | PostgreSQL encryption at rest |
| API security | Row-level security in Supabase |
| Banking | Stripe/Plaid handle PCI compliance |
| Secrets | Environment variables, Vercel secrets |

### Data Privacy

- Opt-in for index data contribution
- Anonymized aggregation for indices
- GDPR compliance planned
- Clear data deletion process

---

## 8. Development Workflow

### Git Workflow

```
main (production)
  └── develop (integration)
       ├── feature/habit-library
       ├── feature/pattern-recognition
       └── fix/money-calculation
```

**Process:**
1. Create feature branch from develop
2. Implement and test locally
3. Push and create PR
4. Review and merge to develop
5. Test in staging
6. Merge develop to main for production

### Local Development

```bash
# Clone and install
git clone [repo]
cd flux-2.0
npm install

# Run development server
npm run dev

# Access on mobile (same network)
# Use network IP shown in terminal
```

### Deployment

- **Vercel** auto-deploys main branch
- Preview deployments for PRs
- Environment variables in Vercel dashboard

### Testing Strategy

**Manual Testing (MVT):**
- Test critical flows on mobile device
- Verify money calculations with edge cases
- Check data persistence across sessions

**Automated Testing (Phase 4+):**
- Unit tests for calculations (Jest)
- Integration tests for API flows
- E2E tests for critical paths (Playwright)

---

## Appendix: Technical Decisions

| Decision | Rationale |
|----------|-----------|
| React over React Native for MVT | Faster iteration, deploy via web, RN for Phase 6 |
| localStorage over backend | Reduces complexity for validation phase |
| Supabase over custom backend | Faster development, built-in auth, real-time |
| Stripe Treasury over alternatives | Best docs, ecosystem integration, FDIC included |
| Vercel over alternatives | Free tier, automatic deploys, edge functions |

---

*Flux Technologies LLC | December 2025*
