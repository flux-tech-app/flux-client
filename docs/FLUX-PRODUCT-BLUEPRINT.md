# Flux Product Blueprint

**Complete Feature Specifications**

**Last Updated:** December 4, 2025

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

1. **Select behaviors** from curated library (MVT: 23 behaviors)
2. **Complete behavior** in real life (or successfully avoid it)
3. **Log or Pass** in app
4. **Earn transfer right** (each log/pass = money earned)
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
| Awkward "No X" habit framing | Clean Log/Pass action system |

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

Users configure transfer amounts per behavior. Two structures available:

**Fixed Rate**
- Flat amount per completion
- Examples: $5 per workout, $2 per meditation session, $7 per takeout pass

**Variable Rate**
- Amount per unit (duration, distance, count)
- Examples: $0.10/minute running, $1/mile biked, $0.50/chapter read, $0.25/rep

### Weekly Transfer Flow

| Day | Action |
|-----|--------|
| Mon-Thu | User logs/passes behaviors → earns transfer rights → pending balance increases |
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
1. **Index data quality** - Consistent behavior definitions enable meaningful comparisons
2. **Simplified scope** - Reduces edge cases and complexity
3. **Faster onboarding** - Select instead of configure
4. **Better insights** - AI can reference shared behavior definitions

### Dual-Action System: Log & Pass

Behaviors are defined neutrally. The user's action determines intent:

| Action | Purpose | Example |
|--------|---------|---------|
| **Log** | Track completion of positive behaviors | "Logged gym workout" |
| **Pass** | Track successful avoidance | "Passed on takeout" |

This eliminates awkward "No X" habit framing. Instead of creating "No Takeout" and logging when you didn't order food, you have "Takeout" as a behavior and hit **Pass** when you successfully avoid it.

**Key insight:** The action carries the intent, not the behavior definition itself.

### MVT Library Structure

**2 Action Types, 23 Behaviors**

#### Log Behaviors (13)

| # | Habit | Ticker | Rate Type | Default Rate |
|---|-------|--------|-----------|--------------|
| 1 | Running | $RUN | Distance | $1.00/mile |
| 2 | Gym Workout | $GYM | Binary | $5.00/session |
| 3 | Push Ups | $PUSH | Count | $0.05/rep |
| 4 | Walking | $WALK | Count | $0.001/step |
| 5 | Crunches | $CRUNCH | Count | $0.03/rep |
| 6 | Review Budget | $BUDGET | Binary | $3.00/session |
| 7 | Cook at Home | $COOK | Binary | $4.00/meal |
| 8 | Reading | $READ | Count | $0.50/chapter |
| 9 | Learning/Study | $STUDY | Duration | $0.10/minute |
| 10 | Meditation | $ZEN | Duration | $0.20/minute |
| 11 | Journaling | $JOURNAL | Binary | $2.00/session |
| 12 | Give Compliment | $KIND | Count | $1.00/compliment |
| 13 | Make Bed | $BED | Binary | $2.00/day |

#### Pass Behaviors (Avoidance) (10)

| # | Behavior | Ticker | Rate Type | Default Rate |
|---|----------|--------|-----------|--------------|
| 14 | Takeout | $TAKEOUT | Binary | $7.00/pass |
| 15 | Alcohol | $BOOZE | Binary | $5.00/pass |
| 16 | Doomscrolling | $SCROLL | Binary | $3.00/pass |
| 17 | Smoking | $SMOKE | Binary | $5.00/pass |
| 18 | Vaping | $VAPE | Binary | $5.00/pass |
| 19 | Impulse Purchases | $IMPULSE | Binary | $5.00/pass |
| 20 | Junk Food | $JUNK | Binary | $3.00/pass |
| 21 | Midnight Snacks | $MIDNIGHT | Binary | $3.00/pass |
| 22 | Gambling | $BET | Binary | $10.00/pass |
| 23 | Hitting Snooze | $SNOOZE | Binary | $2.00/pass |

### Avoidance Behaviors: Key Characteristics

Pass behaviors share a common pattern: **frequent impulse + immediate gratification + long-term cost**. Success = not doing the thing.

**Stake Treatment:** Pass actions are treated identically to Log actions for financial stakes. Successfully passing on a behavior earns toward the stake just like logging a positive behavior.

**Flux Score for Avoidance:** Deferred post-MVT. The pattern recognition model doesn't cleanly map to avoidance (no natural frequency baseline, asymmetric data). MVT will validate whether users engage with Pass functionality before designing scoring.

### Behavior Configurations

Each behavior has default configurations that users can customize:

**Rate Type Options:**
- Binary (complete/not complete)
- Duration (minutes/hours)
- Distance (miles/km)
- Count (reps, chapters, sessions)

**Rate Selection at Log/Pass Time:**
- Low (suggested lower amount)
- Default (pre-set amount)
- High (suggested higher amount)
- Custom (user enters amount)

**Custom Defaults:** Users can set their own default rate type and amount when adding a behavior, overriding the preset defaults.

### User Flow: Logging & Passing

1. **Press FAB** → Presented with two options: **Log** or **Pass**
2. **Select action** → Smart input field appears with predictive autocomplete
3. **Type or browse** → Active behaviors filter as user types
4. **Select behavior** → Rate selection (Low/Default/High/Custom)
5. **Confirm** → Done

### Request Behavior (Coming Soon)

Users can request behaviors not in the MVT library. Placeholder UI with "Coming Soon" message captures interest for future custom behavior feature.

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

### What It Measures

The Flux Score (0-100) represents the overall health and strength of a user's behavioral patterns. It's calculated per habit and aggregated across all habits.

### Five Components

| Component | Weight | What It Measures |
|-----------|--------|------------------|
| Consistency | 30% | Regular gaps between logs (low variance) |
| Momentum | 25% | Recent trend vs. historical baseline |
| Volume | 20% | Meeting/exceeding typical output |
| Longevity | 15% | Total time tracking this habit |
| Recency | 10% | How recently you've logged |

### Score Interpretation

| Score Range | Label | Meaning |
|-------------|-------|---------|
| 90-100 | Exceptional | Habit is deeply established, highly consistent |
| 75-89 | Strong | Solid pattern, minor room for improvement |
| 60-74 | Building | Pattern emerging, some inconsistency |
| 40-59 | Developing | Early stage or inconsistent |
| 0-39 | Nascent | Just starting or significant gap |

### Key Principles

**Compare to Yourself:**
- Score reflects YOUR patterns, not external standards
- A 75 for someone who exercises 2x/week is as valid as 75 for someone who exercises 6x/week
- Consistency to your own baseline matters most

**No Punishment:**
- Score can decrease but messaging stays neutral
- "Your score dropped 8 points this week" not "You're failing"
- Dips are information, not judgment

**Flux Score for Avoidance Behaviors:**
- Deferred to post-MVT
- Pattern recognition model doesn't cleanly map to avoidance
- MVT tracks Pass logs without scoring

---

## 6. Savings Goals

### The Concept

Users can link habits to specific financial objectives, creating a direct behavior-to-wealth connection.

**Examples:**
- "My running earnings go toward my vacation fund"
- "Meditation money builds my emergency savings"
- "Every gym session adds to my new bike fund"

### How It Works

1. **Create savings goal** with name and target amount
2. **Link one or more habits** to the goal
3. **Each log** adds to that goal's progress
4. **Visualize progress** toward the target

### Display Example

```
🏖️ Vacation Fund
━━━━━━━━━━━━━━━━━━━━
$847 of $2,000 (42%)
Habits contributing: Running, Gym Workout
This week: +$34 from 6 logs
```

### Key Principles

- Goals are optional (users can use Flux without them)
- One habit can link to one goal (MVP simplicity)
- Goals don't affect Flux Score or pattern recognition
- Purely motivational/visualization feature

---

## 7. Behavior-Level Indices

### The Concept

Aggregate anonymized data across users to create behavior-level benchmarks. Users can opt-in to see how they compare to others doing the same behaviors.

**Example:** "Your running Flux Score is in the 73rd percentile of all Flux runners"

### Why Behavior-Level (Not Category)

- Comparing runners to runners is meaningful
- Comparing "all fitness people" mixes incomparable behaviors
- Cleaner data, more actionable insights

### Minimum Threshold

Indices require minimum users per behavior for statistical validity. Target: 50+ active users per behavior before index becomes available.

### Privacy & Opt-In

- Indices are opt-in only
- Data is anonymized and aggregated
- Users can contribute data without viewing indices
- Clear consent flow

### Index Display Example

```
$RUN Running Index
━━━━━━━━━━━━━━━━━━━━
Your Flux Score: 78
Percentile: 73rd
Index Average: 71
Active Runners: 1,247
```

---

## 8. Negative Behavior Logging

### The Concept

Users can track "quit" behaviors (smoking, gambling, etc.) by logging slips. This enables pattern recognition and AI coaching for behaviors they want to eliminate.

**Important:** This is separate from Pass behaviors. Negative behavior logging is for tracking failures/slips in quit attempts, not successful avoidance.

### How It Works

1. User adds a "quit" behavior (e.g., "Quit Smoking")
2. User logs when they slip (have a cigarette)
3. Flux tracks slip patterns over time
4. AI provides coaching based on slip data

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
| Behaviors | Displayed as "positions" |
| Behavior names | Ticker symbols ($RUN, $ZEN) |
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

1. **Today** - Daily behaviors available to log/pass, quick action *(under evaluation - may merge into Dashboard/Portfolio)*
2. **Dashboard** - Overall performance view, key metrics at a glance
3. **Portfolio** - All positions, total balance, earnings breakdown
4. **Behavior Detail** - Individual behavior metrics, history, patterns
5. **Flux Score** - Score breakdown, component visualization, trends
6. **Activity Feed** - Log history, earnings, transfers
7. **Indices** - Behavior-level performance (opt-in)
8. **Settings** - Transfer amounts, goals, preferences

---

## Appendix: Feature Status

| Feature | MVT Status | Notes |
|---------|------------|-------|
| Behavior Library (23 behaviors) | ✓ Required | Curated selection, no custom creation |
| Log/Pass Dual-Action | ✓ Required | Neutral behaviors, action carries intent |
| Manual Logging | ✓ Required | Core input method |
| Transfer Rights/Earnings | ✓ Required | Each log/pass earns |
| Friday Transfers | ✓ Required | Weekly settlement |
| Pattern Recognition | ✓ Required | No schedules, learn from logs |
| Flux Score (Log behaviors) | ✓ Required | 5 components, 100-point |
| Portfolio Dashboard | ✓ Required | Position view |
| Basic AI Insights | ✓ Required | Contextual, not chat-first |
| Custom Rate Configuration | ✓ Required | At setup and log/pass time |
| Predictive Autocomplete | ✓ Required | Smart input for behavior selection |
| Savings Goals | ○ Stretch | Link behaviors to objectives |
| Behavior-Level Indices | ○ Stretch | Requires 50+ users per behavior |
| Optional User Goals | ○ Post-MVT | Targets alongside patterns |
| Flux Score (Pass behaviors) | ○ Post-MVT | Scoring model needs user data |
| Avoidance Indices | ○ Post-MVT | Requires Pass scoring model |
| Negative Behavior Logging | ○ Post-MVT | Quit tracking |
| AI Chat Interface | ○ Post-MVT | Deep-dive conversations |
| App Integrations | ✗ Future | After core validation |

---

*Flux Technologies LLC | December 2025*
