# Flux Product Blueprint

**Complete Feature Specifications**

**Last Updated:** December 2, 2025

---

## Document Purpose

This document defines what Flux is and how it works. It serves as the authoritative specification for all product features, replacing scattered documentation across multiple outdated files. When building, designing, or explaining Flux, reference this document.

For terminology definitions, see FLUX-GLOSSARY.md.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Money Flow](#2-money-flow)
3. [Habit Library (MVT)](#3-habit-library-mvt)
4. [Pattern Recognition](#4-pattern-recognition)
5. [Flux Score](#5-flux-score)
6. [Savings Goals](#6-savings-goals)
7. [Behavior-Level Indices](#7-behavior-level-indices)
8. [Negative Behavior Logging](#8-negative-behavior-logging)
9. [Optional User Goals](#9-optional-user-goals)
10. [AI Companion](#10-ai-companion)
11. [App Integrations (Future)](#11-app-integrations-future)
12. [User Interface Philosophy](#12-user-interface-philosophy)

---

## 1. Product Overview

### What Flux Is

Flux is a behavioral intelligence platform that connects habit completion to real financial outcomes. Users earn real money by logging completed habits, with earnings transferred to FDIC-insured savings accounts. Unlike traditional habit trackers, Flux learns user patterns from actual behavior rather than enforcing rigid schedules.

### Core Experience Loop

1. **Select habits** from curated library (MVT: 15 habits)
2. **Complete habit** in real life
3. **Log completion** in app
4. **Earn transfer right** (each log = money earned)
5. **Friday transfer** moves pending earnings to Flux savings
6. **View patterns** as data accumulates
7. **Receive insights** from AI based on your behavior

### What Makes Flux Different

| Traditional Habit Trackers | Flux |
|---------------------------|------|
| Virtual points, badges, streaks | Real money transfers |
| User sets arbitrary schedules | Flux learns your natural patterns |
| Measures compliance to goals | Compares you to yourself |
| Breaks streaks when life happens | Forgiving, pattern-based analysis |
| Generic coaching | AI reflects your personal data |

---

## 2. Money Flow

### The Core Model

Users pay themselves for behavioral success. Money flows from user's checking account to their Flux savings account (held in Stripe Treasury, FDIC-insured).

```
User Checking Account
        ↓ (Friday transfer)
Flux Savings (Stripe Treasury)
        ↓ (anytime)
User Withdrawal
```

### Key Principles

**Opportunity Cost, Not Punishment**
- Users never lose money when they skip a habit
- They miss the opportunity to earn
- No guilt, no shame - just honest tracking with tangible rewards

**Real Money, Real Stakes**
- Portfolio balance = actual money held by Flux
- Not virtual currency, not points, not tokens
- Withdrawable anytime via standard bank transfer

### Transfer Amount Structure

Users configure transfer amounts per habit. Two structures available:

**Fixed Rate**
- Flat amount per completion
- Examples: $5 per workout, $2 per meditation session, $3 per deep work block

**Variable Rate**
- Amount per unit (duration, distance, count)
- Examples: $0.10/minute running, $1/mile biked, $0.50/chapter read, $0.25/rep

### Weekly Transfer Flow

| Day | Action |
|-----|--------|
| Mon-Thu | User logs habits → earns transfer rights → pending balance increases |
| Friday | Pending balance calculated → transfer executes (checking → Flux savings) |
| Sat-Sun | User continues logging → starts new week's pending balance |

### Balance Types

**Pending Balance**
- Transfer rights earned during current week
- Resets to zero after Friday transfer
- Shows as "Earning this week: $47"

**Portfolio Balance**
- Total real money in Flux savings
- Cumulative earnings minus withdrawals
- Shows as "Total saved: $1,247"

---

## 3. Habit Library (MVT)

### Why a Curated Library

For Minimum Viable Test (MVT), users select from a pre-defined library rather than creating custom habits.

**Rationale:**
1. **Index data quality** - Consistent habit definitions enable meaningful comparisons
2. **Simplified scope** - Reduces edge cases and complexity
3. **Faster onboarding** - Select instead of configure
4. **Better insights** - AI can reference shared habit definitions

### MVT Library Structure

**4 Categories, 15 Base Habits**

| Category | Habits |
|----------|--------|
| FITNESS | Running, Gym Workout, Yoga, Walking, Swimming |
| FINANCIAL | No Impulse Purchases, No Food Delivery, Budget Review, Savings Transfer |
| PRODUCTIVITY | Deep Work Session, Reading, Learning/Study, Morning Routine |
| WELLNESS | Meditation, Journaling, Sleep Hygiene |

### Habit Configurations

Each habit has default configurations that users can customize:

**Rate Type Options:**
- Binary (complete/not complete)
- Duration (minutes/hours)
- Distance (miles/km)
- Count (reps, chapters, sessions)

**Example Configurations:**

| Habit | Default Rate Type | Default Transfer |
|-------|-------------------|------------------|
| Running | Distance (miles) | $1/mile |
| Gym Workout | Binary | $5/session |
| Meditation | Duration (minutes) | $0.20/minute |
| Deep Work | Duration (minutes) | $0.15/minute |
| No Food Delivery | Binary | $7/day resisted |
| Reading | Count (chapters) | $0.50/chapter |

### Ticker Symbols

Each habit displays with an investment-style ticker:

| Habit | Ticker |
|-------|--------|
| Running | $RUN |
| Gym Workout | $GYM |
| Meditation | $ZEN |
| Deep Work | $WORK |
| Reading | $READ |
| No Food Delivery | $NDASH |

---

## 4. Pattern Recognition

### Core Philosophy

Flux doesn't enforce schedules. Users log whenever they complete habits, and Flux learns natural patterns from actual behavior.

**Schedule Enforcement (What We Don't Do):**
- User sets "M/W/F" schedule
- App measures adherence to schedule
- Miss Wednesday = failed day
- Streak breaks, guilt ensues

**Pattern Recognition (What We Do):**
- User logs when they actually complete habits
- Flux identifies natural frequency over time
- "You typically exercise 4-5x/week, usually mornings"
- Compare current behavior to your own baseline

### How Pattern Recognition Works

**Phase 1: Building Baseline (First 10 logs)**
- Insufficient data for pattern identification
- Show simple metrics: "You've logged 8 times in 12 days"
- Message: "Flux is learning your patterns - keep logging!"
- Simplified Flux Score shown

**Phase 2: Patterns Emerging (10-30 logs)**
- Baseline begins forming
- Flux identifies typical gap between logs
- Consistency patterns visible
- Full Flux Score calculation begins

**Phase 3: Established Patterns (30+ logs)**
- High-confidence baseline established
- Detailed insights available
- "Your pattern varies: typically 4x/week with 1.8-day gaps"
- Accurate comparison to baseline

### Pattern Metrics Tracked

For each habit, Flux calculates:

| Metric | Description |
|--------|-------------|
| Typical Gap | Average days between logs |
| Gap Variance | How much gaps fluctuate (low = consistent) |
| Baseline Frequency | Expected logs per week based on history |
| Volume Baseline | For measurable habits: average units per log |
| Time Patterns | When you typically log (morning/evening, weekday/weekend) |

### Pattern Insights Examples

**Recent behavior vs. baseline:**
- "You've run 6 times in 14 days (your baseline: 4x/14 days)"
- "Meditation gaps averaging 1.2 days vs your typical 2.1 days - great consistency!"
- "Deep work sessions down 40% from your 30-day baseline"

**Timing patterns:**
- "You typically meditate on weekday mornings"
- "Your gym sessions cluster on Mon/Wed/Fri"
- "Reading happens mostly on weekends"

**Anomaly detection:**
- "It's been 6 days since your last run - unusual for you (typical gap: 2.1 days)"
- "This is your longest meditation streak since starting"

---

## 5. Flux Score

### Overview

A proprietary 100-point score measuring habit quality. Uses continuous mathematical formulas with exponential decay - no arbitrary thresholds or tiers. Gets smarter as more data accumulates.

**Formerly called:** Habit Strength Score (HSS) - deprecated terminology.

### Five Components

| Component | Max Points | What It Measures |
|-----------|------------|------------------|
| Frequency Trend | 30 | Recent frequency vs. baseline |
| Consistency | 25 | Variance in gaps between logs |
| Recency | 20 | Days since last log vs. typical gap |
| Volume/Intensity | 15 | For measurable habits: units vs. baseline |
| Data Maturity | 10 | Confidence based on total logs |

### Component Formulas

**1. Frequency Trend (30 points max)**

Compares recent frequency (last 14 days) to established baseline (90-day average).

```
score = 30 × min(1, recent_frequency / baseline_frequency)
```

- 2× baseline = 30 pts (capped)
- 1× baseline = 15 pts
- 0.5× baseline = 7.5 pts
- Linear relationship, caps at 30

**2. Consistency Score (25 points max)**

Measures variance in gaps between logs. Lower variance = more consistent = higher score.

```
score = 25 × e^(-gap_variance / baseline_gap)
```

- Gap variance = 0 (perfectly consistent) = 25 pts
- Gap variance = baseline gap = ~9 pts
- Gap variance = 2× baseline gap = ~3 pts
- Exponential decay rewards low variance heavily

**3. Recency (20 points max)**

How recently you've logged relative to your typical gap.

```
score = 20 × e^(-days_since_log / typical_gap)
```

- Logged today = 20 pts
- Logged at typical gap = ~7 pts
- 2× typical gap = ~3 pts
- Exponential decay based on your pattern

**4. Volume/Intensity (15 points max)**

Only applies to habits with measurable units (minutes, miles, reps, chapters).

```
score = 15 × min(1, recent_avg_units / baseline_avg_units)
```

- 2× baseline intensity = 15 pts (capped)
- 1× baseline = 7.5 pts
- Binary habits skip this component (reallocate to others)

**5. Data Maturity Confidence (10 points max)**

More logs = more reliable score.

```
score = 10 × min(1, total_logs / 30)
```

- 5 logs = 1.67 pts
- 15 logs = 5 pts
- 30+ logs = 10 pts (full confidence)

### Example Calculation

**Exercise Habit Profile (90-Day Baseline):**
- Average frequency: 4.2 logs/week
- Gap variance: 1.8 days
- Typical gap: 1.8 days
- Average intensity: 4.1 miles/session
- Total logs: 42

**Recent Behavior (Last 14 Days):**
- Frequency: 8 logs (5.6/week) → 1.33× baseline
- Gap variance: 1.3 days
- Last log: 1 day ago
- Average intensity: 4.8 miles → 1.17× baseline

**Score Breakdown:**

| Component | Calculation | Points |
|-----------|-------------|--------|
| Frequency Trend | 30 × min(1, 1.33) | 30.0 |
| Consistency | 25 × e^(-1.3/1.8) | 12.2 |
| Recency | 20 × e^(-1/1.8) | 11.3 |
| Volume/Intensity | 15 × min(1, 1.17) | 15.0 |
| Data Maturity | 10 × min(1, 42/30) | 10.0 |
| **TOTAL** | | **78.5** |

**Interpretation:** Strong habit (78.5/100). Logging more frequently than baseline, maintaining good consistency, increasing intensity.

### Score Display

**Color Coding:**
- 80-100: Green (Strong habit)
- 60-79: Yellow (Moderate)
- 40-59: Orange (Declining)
- 0-39: Red (Needs attention)

**Trend Indicators:**
- ↑ Improving (score increased over last period)
- → Stable
- ↓ Declining

### Edge Cases

**New Habits (<10 logs):**
- Show simplified score based only on Recency + Data Maturity
- Display: "Flux Score: Building baseline... (4 logs)"
- Message: "Keep logging to unlock full Flux Score"

**Inactive Habits (>30 days no log):**
- Recency approaches 0
- Badge: "Inactive habit"
- AI prompt: "Want to archive or restart?"

**High-Variance Habits (Naturally irregular):**
- Detect baseline variance >7 days
- Adjust scoring: Weight recency less
- Display: "Your pattern varies widely - median 1x/month"

---

## 6. Savings Goals

### The Concept

Users can link habits to specific financial objectives, creating direct connections between behavior and wealth-building.

**Examples:**
- "Every meditation session adds $4 to my vacation fund"
- "Each gym workout puts $5 toward my new laptop"
- "Running earnings go to my emergency fund"

### How It Works

1. **Create Savings Goal** - Name and optional target amount
   - "Vacation Fund - $2,000"
   - "Emergency Savings - no target"
   - "Wedding - $10,000"

2. **Link Habits to Goals** - Each habit can route earnings to a specific goal
   - Running → Vacation Fund
   - Meditation → Emergency Savings
   - Deep Work → Wedding

3. **Track Progress** - See earnings accumulate toward goals
   - "Vacation Fund: $847 of $2,000 (42%)"

4. **Celebrate Milestones** - AI recognizes goal progress
   - "You just hit 50% of your vacation fund! At this rate, you'll reach your goal in 4 months."

### UX Considerations (To Be Designed)

- Default goal: Unallocated savings (if no goal specified)
- Multiple habits can feed same goal
- One habit → one goal (no splitting)
- Goals can be edited/archived
- Progress visualization on portfolio page

---

## 7. Behavior-Level Indices

### The Concept

Aggregate performance data across all Flux users for specific behaviors. Think "Morningstar for habits" - clean, thoughtful analysis rather than dense real-time data.

**Key Distinction:** Behavior-level indices (Cardio Index, Meditation Index) not category rollups (not "Exercise Category Index").

### Index Page Components

Based on current mockup (17-behavior-index-cardio.html):

**1. Index Hero**
- Index value with trend (e.g., "71.3 ↑2.1 from last week")
- Participant count (e.g., "847 users")
- Live indicator showing real-time data

**2. Your Performance Card**
- User's score vs index (e.g., "78.2")
- Percentile ranking (e.g., "Top 15%")
- Delta above/below index (e.g., "+6.9 above index")
- Context message (e.g., "You're outperforming the average")

**3. Time Range Toggles**
- 1W, 1M, 3M, 6M, 1Y, ALL
- Chart updates to show selected period

**4. Comparison Chart**
- Dual line chart: User performance vs Index over time
- User line (solid blue) vs Index line (dashed gray)
- Tooltip shows delta between lines

**5. Quick Stats Comparison**
| Your Metric | Index Average |
|-------------|---------------|
| Your logs/wk: 4.2 | Index: 3.1 |
| Your avg gap: 1.8d | Index: 2.4d |
| Consistency: 94% | Index: 76% |

**6. Population Distribution**
Visual bar showing user segments:
- Top 15% (green)
- Strong 32% (blue)
- Building 35% (yellow)
- Starting 18% (gray)
- "YOU" marker positioned on the bar

**7. Pattern Insight**
AI-generated insight comparing user to index:
> "Your cardio consistency (1.8 day avg gap) beats 84% of users. The index shows most users have 3-4 day gaps between sessions. Your pattern of shorter, more frequent sessions is outperforming the 'weekend warrior' approach common in this index."

**8. Your Habit Connection**
Links to user's specific habit that feeds this index:
- Habit name and ticker ($RUN · Morning Run)
- Rate type (Variable rate · $0.25/minute)
- Flux Score, Total Logs, Earned

**9. Leaderboard Teaser (Optional)**
Anonymous rankings showing top performers:
- Rank 1, 2, 3 with scores
- User's rank position (e.g., "#47 · 78.2")

### Index Calculation

**Pattern-Recognition Based:**

Since Flux uses pattern recognition rather than schedules, indices measure pattern adherence:

```
Index = Average of (user's recent performance / user's baseline) across all users
```

**Metrics Aggregated:**
- Logs per week (frequency)
- Average gap between logs (consistency)
- Consistency percentage (gap variance)

### User Percentile

Position relative to others on same behavior:

```
Percentile = Percentage of users whose performance ratio is lower than yours
```

### Requirements for Valid Index

**Minimum Data:**
- At least 50 users logging that specific behavior
- Each user must have 10+ logs (established baseline)
- Recent activity within last 30 days

**Data Quality:**
- Financial incentives create higher quality data than free apps
- Users care about accuracy when money is involved
- Gaming prevention through anomaly detection

### Display Philosophy

**Morningstar, Not Bloomberg:**
- Clean, accessible insights
- Long-term perspective
- What matters, not everything
- Clarity over comprehensiveness

**Opt-In Only:**
- Users choose to see comparative data
- Not forced social comparison
- Informational, not competitive pressure

### Future: Data Licensing

As user base grows, anonymized index data becomes valuable for:
- Corporate wellness programs
- Insurance companies
- Academic researchers
- Behavioral science applications

---

## 8. Negative Behavior Logging

### The Concept

Users can track behaviors they're trying to quit (gambling, vaping, excessive spending, etc.) by logging when they slip.

**Key Principle:** These logs provide insights but do NOT earn transfer rights.

### How It Works

1. **Add quit behavior** to habit library
   - "Quit Vaping"
   - "No Gambling"
   - "Limit Alcohol"

2. **Log when you slip** (not when you resist)
   - "Logged: Vaped today"
   - "Logged: Bought lottery tickets"

3. **Receive pattern insights** (no money earned)
   - "You tend to slip on weekends"
   - "3 days since last slip - that's your longest streak"
   - "Slips correlate with late nights"

### Why No Earnings

- Earning for resistance creates wrong incentive (just don't log slips)
- Honest data collection requires no penalty for logging
- Pattern recognition works best with complete data
- AI coaching more valuable when user is honest

### AI Coaching for Quit Behaviors

- "You've gone 5 days without vaping - nice progress"
- "Last week you slipped twice (both Saturdays). Want to plan for this weekend?"
- "Your slip frequency is down 40% from your first month"

### Design Consideration (Not Committed for MVT)

**Potential future feature:** Deductions for negative behavior logs
- When logging a slip, deduct from pending weekly balance
- Creates real accountability in both directions
- Would deduct from pending only, cap at zero (no negative balance)

**Challenge:** Users might not log to avoid penalty, undermining honesty.

**Status:** Flagged for future discussion. MVT focuses on insights without financial consequence.

---

## 9. Optional User Goals

### The Concept

Users can optionally set daily/weekly/monthly targets for any habit. These exist alongside pattern recognition - Flux still learns natural patterns regardless of goals.

**Goals provide:** User-defined benchmarks for motivation
**Pattern recognition provides:** Data-driven insights based on actual behavior

Neither replaces the other.

### How It Works

1. **Set optional goal** (not required)
   - "I want to run 4x/week"
   - "Target: 20 minutes meditation daily"
   - "Goal: 3 deep work sessions per week"

2. **Flux tracks against goal AND pattern**
   - "This week: 3 of 4 runs (goal) | +1 from your baseline"

3. **No penalty for missing goals**
   - Goals don't affect Flux Score
   - Goals don't reduce earnings
   - Just informational tracking

### Display Example

```
Running This Week
━━━━━━━━━━━━━━━━━
Goal: 3 of 4 runs ○○○●
Pattern: +1 above your typical 2.3/week
```

### Why This Matters

Some users are motivated by explicit goals. Others find them stressful. Flux accommodates both:

- **Goal-oriented users:** Set targets, track progress
- **Pattern-oriented users:** Just log, let Flux learn

---

## 10. AI Companion

### Role Definition

The Flux AI provides intelligent insights and coaching throughout the app. It is NOT the primary command center - traditional UI handles core interactions (habit creation, logging, navigation).

**AI is:** Intelligent companion, reflection tool, pattern analyst
**AI is not:** Chat-first interface, primary input method, command center

### Where AI Appears

**Contextual Insights (Throughout App):**
- Home page: "Good morning! You typically meditate on Tuesdays - want to log?"
- Habit detail: "Your running consistency has increased 23% this month"
- Portfolio: "Great week! You're on pace for $104 by Friday"

**Dedicated Chat (Optional Deep Dive):**
- Accessible via floating button
- For questions, exploration, coaching conversations
- "How am I doing compared to last month?"
- "What should I focus on this week?"

### AI Capabilities

**Pattern Reflection:**
- "You typically run Tuesday and Thursday mornings"
- "It's been 6 days since your last run - unusual for you"
- "Your meditation consistency has improved 23% this month"

**Insights Based on Data:**
- "Your deep work sessions are most productive in the morning"
- "You tend to skip gym when you travel"
- "Reading happens mostly on weekends for you"

**Goal Coaching:**
- "You're 3 runs away from hitting your monthly goal"
- "At this pace, you'll reach your vacation fund by March"

**Gentle Accountability:**
- Not pushy or judgmental
- References user's own patterns, not external standards
- "Want to log?" not "You should exercise more"

### What AI Doesn't Do

- Replace primary UI for logging/creation
- Push notifications (unless user opts in)
- Generic advice unconnected to user data
- Shame or guilt-based messaging

### Technical Implementation (Future)

- LLM-powered (Claude or GPT)
- User context: habit library, log history, patterns, goals
- Streaming responses for conversational feel
- Function calling for structured actions

---

## 11. App Integrations (Future)

### The Concept

Connect to fitness apps and devices to bootstrap pattern recognition with historical data and enable automatic logging.

**Not MVT.** Validate core model with manual logging first.

### Potential Integrations

| Platform | Data Available | Use Case |
|----------|----------------|----------|
| Apple Health | Workouts, steps, sleep | Pre-populate running/walking patterns |
| Strava | Runs, rides, activities | Automatic activity logging |
| Fitbit | All fitness metrics | Pattern import |
| Google Fit | Exercise, steps | Cross-platform sync |
| Headspace/Calm | Meditation sessions | Automatic meditation logging |

### Benefits

**Reduce Cold-Start Problem:**
- New user connects Strava
- Flux immediately knows their running patterns
- Baseline established from historical data

**Automatic Logging:**
- Strava activity syncs to Flux
- User just approves/confirms
- Lower friction for consistent logging

**Richer Pattern Data:**
- Duration, distance, heart rate
- Time of day, frequency
- Comparison to device-tracked metrics

### Implementation Considerations

- OAuth integration for each platform
- Data sync frequency (real-time vs. daily)
- Conflict resolution (manual log vs. auto-sync)
- Privacy: clear consent for data access
- Verification: device data adds credibility to manual logs

---

## 12. User Interface Philosophy

### Investment Portfolio Aesthetic

Flux uses financial/investment metaphor throughout:

| Element | Implementation |
|---------|----------------|
| Habits | Displayed as "positions" |
| Habit names | Ticker symbols ($RUN, $ZEN) |
| Log history | "Transaction history" |
| Earnings | "Returns" |
| Dashboard | "Portfolio" view |
| Flux Score | Like a stock rating |

### Design Principles

**Professional, Not Playful:**
- Clean, minimal interface
- Sophisticated typography and spacing
- No cartoon graphics or excessive gamification
- Think Coinbase, Robinhood, Apple native apps

**Morningstar, Not Bloomberg:**
- Clarity over information density
- Trends over raw numbers
- What matters, not everything
- Accessible insights over comprehensive data

**No Guilt UX:**
- Compare users to themselves, not others
- No "broken streak" shame
- Gaps are noted, not judged
- "It's been 6 days" not "You failed"

**Mobile-First:**
- Primary experience is mobile
- Touch-optimized interactions
- Logging should be < 5 seconds
- Insights readable at a glance

### Core Screens

1. **Today** - Daily habits available to log, quick log *(under evaluation - may merge into Dashboard/Portfolio)*
2. **Dashboard** - Overall performance view, key metrics at a glance
3. **Portfolio** - All positions, total balance, earnings breakdown
4. **Habit Detail** - Individual habit metrics, history, patterns
5. **Flux Score** - Score breakdown, component visualization, trends
6. **Activity Feed** - Log history, earnings, transfers
7. **Indices** - Behavior-level performance (opt-in)
8. **Settings** - Transfer amounts, goals, preferences

---

## Appendix: Feature Status

| Feature | MVT Status | Notes |
|---------|------------|-------|
| Habit Library (15 habits) | ✓ Required | Curated selection, no custom creation |
| Manual Logging | ✓ Required | Core input method |
| Transfer Rights/Earnings | ✓ Required | Each log earns |
| Friday Transfers | ✓ Required | Weekly settlement |
| Pattern Recognition | ✓ Required | No schedules, learn from logs |
| Flux Score | ✓ Required | 5 components, 100-point |
| Portfolio Dashboard | ✓ Required | Position view |
| Basic AI Insights | ✓ Required | Contextual, not chat-first |
| Savings Goals | ○ Stretch | Link habits to objectives |
| Behavior-Level Indices | ○ Stretch | Requires 50+ users per behavior |
| Optional User Goals | ○ Post-MVT | Targets alongside patterns |
| Negative Behavior Logging | ○ Post-MVT | Quit tracking |
| AI Chat Interface | ○ Post-MVT | Deep-dive conversations |
| App Integrations | ✗ Future | After core validation |

---

*Flux Technologies LLC | December 2025*
