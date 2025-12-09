# Flux Product Blueprint

**Complete Feature Specifications**

**Last Updated:** December 8, 2025

---

## Document Purpose

This document defines what Flux is and how it works. It serves as the authoritative specification for all product features, replacing scattered documentation across multiple outdated files. When building, designing, or explaining Flux, reference this document.

For terminology definitions, see FLUX-GLOSSARY.md.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Money Flow](#2-money-flow)
3. [Behavior Library (MVT)](#3-behavior-library-mvt)
4. [Pattern Recognition](#4-pattern-recognition)
5. [Flux Score](#5-flux-score)
6. [Savings Goals](#6-savings-goals)
7. [Behavior-Level Indices](#7-behavior-level-indices)
8. [Negative Behavior Logging](#8-negative-behavior-logging)
9. [Goals](#9-goals)
10. [AI Companion](#10-ai-companion)
11. [App Integrations (Future)](#11-app-integrations-future)
12. [User Interface Philosophy](#12-user-interface-philosophy)

---

## 1. Product Overview

### What Flux Is

Flux is a behavioral intelligence platform that connects behavior completion to real financial outcomes. Users earn real money by logging completed behaviors, with earnings transferred to FDIC-insured savings accounts. Unlike traditional habit trackers, Flux learns user patterns from actual behavior rather than enforcing rigid schedules.

### Core Experience Loop

1. **Select behaviors** from curated library (MVT: 23 behaviors)
2. **Set goals** for each behavior (amount + period)
3. **Complete behavior** in real life (or successfully avoid it)
4. **Log or Pass** in app
5. **Earn transfer right** (each log/pass = money earned)
6. **Friday transfer** moves pending earnings to Flux savings
7. **View patterns** as data accumulates
8. **Track goal progress** toward aspirational targets
9. **Receive insights** from AI based on your behavior

### What Makes Flux Different

| Traditional Habit Trackers | Flux |
|---------------------------|------|
| Virtual points, badges, streaks | Real money transfers |
| User sets arbitrary schedules | Flux learns your natural patterns |
| Measures compliance to goals | Compares you to yourself AND your goals |
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
- Users never lose money when they skip a behavior
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

## 3. Behavior Library (MVT)

### Why a Curated Library

For Minimum Viable Test (MVT), users select from a pre-defined library rather than creating custom behaviors.

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

| # | Behavior | Ticker | Rate Type | Default Rate |
|---|----------|--------|-----------|--------------|
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

**Goals for Pass Behaviors:** Pass behaviors have goals representing maximum acceptable frequency (e.g., "Max 2 takeout orders / week" or "0 cigarettes / day"). Lower is better.

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

Flux doesn't enforce schedules. Users log whenever they complete behaviors, and Flux learns natural patterns from actual behavior.

**Schedule Enforcement (What We Don't Do):**
- User sets "M/W/F" schedule
- App measures adherence to schedule
- Miss Wednesday = failed day
- Streak breaks, guilt ensues

**Pattern Recognition (What We Do):**
- User logs when they actually complete behaviors
- Flux identifies natural frequency over time
- "You typically exercise 4-5x/week, usually mornings"
- Compare current behavior to your own baseline

### How Pattern Recognition Works

**Phase 1: Building Baseline (First 10 logs)**
- Insufficient data for pattern identification
- Show simple metrics: "You've logged 8 times in 12 days"
- Message: "Flux is learning your patterns - keep logging!"
- Simplified Flux Score shown
- Goal provides immediate direction during this phase

**Phase 2: Patterns Emerging (10-30 logs)**
- Baseline begins forming
- Flux identifies typical gap between logs
- Consistency patterns visible
- Full Flux Score calculation begins
- Goal progress becomes meaningful (baseline vs. goal comparison)

**Phase 3: Established Patterns (30+ logs)**
- High-confidence baseline established
- Detailed insights available
- "Your pattern varies: typically 4x/week with 1.8-day gaps"
- Accurate comparison to baseline
- Baseline ratchet eligibility begins

### Pattern Metrics Tracked

For each behavior, Flux calculates:

| Metric | Description |
|--------|-------------|
| Typical Gap | Average days between logs |
| Gap Variance | How much gaps fluctuate (low = consistent) |
| Baseline Frequency | Expected logs per week based on history |
| Volume Baseline | For measurable behaviors: average units per log |
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

The Flux Score (0-100) represents the overall health and strength of a user's behavioral patterns. It's calculated per behavior and aggregated across all behaviors.

### Five Components

| Component | Weight | What It Measures |
|-----------|--------|------------------|
| Frequency Trend | 30% | Recent frequency vs. baseline frequency |
| Consistency | 25% | Regular gaps between logs (low variance) |
| Recency | 20% | Days since last log relative to typical gap |
| Volume/Intensity | 15% | For measurable behaviors: recent avg vs. baseline avg |
| Data Maturity | 10% | Confidence based on total log count (maxes at 30+) |

### Score Interpretation

| Score Range | Label | Meaning |
|-------------|-------|---------|
| 90-100 | Exceptional | Behavior is deeply established, highly consistent |
| 75-89 | Strong | Solid pattern, minor room for improvement |
| 60-74 | Building | Pattern emerging, some inconsistency |
| 40-59 | Developing | Early stage or inconsistent |
| 0-39 | Nascent | Just starting or significant gap |

### Key Principles

**Compare to Yourself:**
- Score reflects YOUR patterns, not external standards
- A 75 for someone who exercises 2x/week is as valid as 75 for someone who exercises 6x/week
- Consistency to your own baseline matters most

**Flux Score ≠ Goal Progress:**
- Score measures habit health (how consistently you maintain your pattern)
- Goal progress measures growth (how close you are to your aspiration)
- Both are displayed but serve different purposes

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

Users can link behaviors to specific financial objectives, creating a direct behavior-to-wealth connection.

**Examples:**
- "My running earnings go toward my vacation fund"
- "Meditation money builds my emergency savings"
- "Every gym session adds to my new bike fund"

### How It Works

1. **Create savings goal** with name and target amount
2. **Link one or more behaviors** to the goal
3. **Each log** adds to that goal's progress
4. **Visualize progress** toward the target

### Display Example

```
🏖️ Vacation Fund
━━━━━━━━━━━━━━━━━━━━
$847 of $2,000 (42%)
Behaviors contributing: Running, Gym Workout
This week: +$34 from 6 logs
```

### Integration with Behavior Goals

Savings Goals now connect to behavior goals for time-to-target projections:

```
Hawaii Trip: $3,000

At current pace (baseline): 24 weeks
At goal pace:               16 weeks

Hitting your goals gets you there 8 weeks sooner.
```

### Key Principles

- Savings Goals are optional (users can use Flux without them)
- One behavior can link to one savings goal (MVP simplicity)
- Savings Goals don't affect Flux Score or pattern recognition
- Powerful when combined with behavior goals for projections

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

## 9. Goals

### The Problem Goals Solve

Pattern Recognition and Flux Score answer: "How healthy is this behavior right now?"

But they don't answer: "Am I becoming who I want to be?"

Without goals, users who want to **improve** have no aspirational target. The system validates whatever they're currently doing as "normal." Goals add an aspirational layer that coexists with pattern recognition.

### Two Coexisting Systems

| System | Question | Source | Affects Score? |
|--------|----------|--------|----------------|
| **Flux Score** | "How healthy is this behavior?" | Calculated from logs | Yes (the score) |
| **Goal Progress** | "Am I reaching my aspiration?" | User-set target vs. baseline | No |

Neither replaces the other:
- Flux Score measures current health (maintenance)
- Goals measure growth toward aspiration (improvement)

A user can have a high Flux Score (healthy behavior) while still being far from their goal (room to grow).

### Goal Structure

Every goal has two components:

**Amount** — The target value (15 miles, 10,000 steps, 4 sessions)
**Period** — The time frame (per day, per week, per month)

Users choose both, allowing flexibility:
- "10,000 steps / day" (daily stepper)
- "50,000 steps / week" (weekend warrior)
- "30 min meditation / week" (casual practitioner)
- "20 min meditation / day" (serious practitioner)

### Goal Types by Rate Type

Goals are native to the behavior's unit type:

| Rate Type | Goal Expressed As | Example |
|-----------|-------------------|---------|
| BINARY | Frequency per period | "4 sessions / week" |
| DURATION | Time per period | "30 min / day" or "3 hrs / week" |
| DISTANCE | Distance per period | "15 miles / week" |
| COUNT | Units per period | "10,000 steps / day" |

### Goals Are Required

Every behavior requires a goal at setup. This ensures:
- All users have aspirational targets from day one
- Financial projections are always available
- The cold start period has immediate direction

**Goal editing:** Users can adjust goals anytime, including lowering them. Life circumstances change; goals should adapt. Baseline is unaffected by goal changes—it's always calculated from actual behavior.

### User Flow: Setting a Goal

**At Behavior Setup (Onboarding or Add Behavior):**

After selecting rate, user sets goal:

```
┌─────────────────────────────────┐
│  What's your goal for Running?  │
│                                 │
│  Amount: [15] miles             │
│                                 │
│  Period: [per week ▼]           │
│          ├─ per day             │
│          ├─ per week            │
│          └─ per month           │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  At this goal, you'd earn:      │
│    $15 / week                   │
│    $60 / month                  │
│    $780 / year                  │
│                                 │
│  [Continue]                     │
└─────────────────────────────────┘
```

**Smart Defaults:** Each behavior in the library has suggested goals that users can accept or customize. The goal input pre-populates with a sensible default.

### How Goals Display

**During Calibration (0-10 logs):**

Goal provides direction while baseline builds:

```
$RUN — Running
Goal: 15 miles / week

Flux Score: Building baseline...
Logged: 18 miles over 3 weeks

Keep going — 3 more logs to unlock full insights
```

**After Baseline Emerges (10+ logs):**

Two metrics shown together:

```
$RUN — Running

Flux Score: 74
Baseline: 9.2 miles / week (learned)
Goal: 15 miles / week

[Baseline ●━━━━━━━━○━━━━━ Goal]
           ↑ You (11.3 this week)

Gap: 3.7 miles / week
     $192 / year potential
```

### Financial Projections

Goals unlock powerful financial insights:

**At Setup:**
"At this goal, you'd earn $15/week, $780/year"

**On Behavior Detail:**
```
Goal: 15 miles / week → $15/week
Baseline: 9.2 miles / week → $9.20/week

Gap: $5.80 / week
     $302 / year you're leaving on the table
```

**Portfolio-Level:**
```
Your Goals (All Behaviors)

At baseline: $127 / week
At goal:     $185 / week

Potential gain: $58 / week
                $3,016 / year

You're capturing 69% of your goal potential.
```

### The Baseline Ratchet

When users consistently exceed their baseline (3-4 weeks), the baseline automatically increases (minimum 4 weeks between ratchets):

```
┌─────────────────────────────────┐
│  Your running baseline has      │
│  increased!                     │
│                                 │
│  Old: 9.2 miles / week          │
│  New: 11.8 miles / week         │
│                                 │
│  This reflects your actual      │
│  performance over the last      │
│  4 weeks. Your floor has risen. │
│                                 │
│  [Set New Goal]  [Keep Current] │
└─────────────────────────────────┘
```

**The Ratchet Creates Natural Progression:**
1. User sets goal above baseline
2. User works toward goal
3. Baseline ratchets up as user improves
4. Eventually baseline meets goal
5. User sets new goal (or maintains)

### Pass Behaviors and Goals

For avoidance behaviors (Pass actions), goals represent maximum acceptable frequency:

**Examples:**
- "Max 2 takeout orders / week" (reduction goal)
- "0 cigarettes / day" (complete avoidance)
- "Max 1 alcohol drink / week" (moderation)

The same goal structure (amount + period) works for avoidance. Lower is better for Pass behaviors.

**Goal Progress for Pass Behaviors:**
- Baseline = current average frequency of slips
- Goal = target maximum frequency
- Progress = moving from baseline toward goal (reducing frequency)

**Financial Projections:**
- "At your goal (0 cigarettes/day), you'd earn $35/week"
- "Current baseline: 3 cigarettes/day → $20/week"
- "Gap: $15/week potential by hitting your goal"

### What Goals Don't Do

- **Don't affect Flux Score** — Score measures pattern health, not goal compliance
- **Don't reduce earnings** — Missing a goal doesn't cost money
- **Don't enforce schedules** — Goals are targets, not commitments
- **Don't create guilt** — Missing a goal is just data, not failure

---

## 10. AI Companion

### Role Definition

The Flux AI provides intelligent insights and coaching throughout the app. It is NOT the primary command center - traditional UI handles core interactions (behavior creation, logging, navigation).

**AI is:** Intelligent companion, reflection tool, pattern analyst
**AI is not:** Chat-first interface, primary input method, command center

### Where AI Appears

**Contextual Insights (Throughout App):**
- Home page: "Good morning! You typically meditate on Tuesdays - want to log?"
- Behavior detail: "Your running consistency has increased 23% this month"
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
- "You're 3 runs away from hitting your weekly goal"
- "At this pace, you'll reach your vacation fund by March"
- "You've been exceeding your baseline for 3 weeks - baseline ratchet coming soon!"

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
- User context: behavior library, log history, patterns, goals
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
3. **Portfolio** - All positions, total balance, earnings breakdown, goal progress summaries
4. **Behavior Detail** - Individual behavior metrics, history, patterns, goal progress
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
| **Goals (Required)** | ✓ Required | Amount + period at setup, financial projections |
| **Pass Behavior Goals** | ✓ Required | Max frequency targets |
| Savings Goals | ○ Stretch | Link behaviors to objectives |
| Behavior-Level Indices | ○ Stretch | Requires 50+ users per behavior |
| **Baseline Ratchet** | ○ Post-MVT | Min 4 weeks between ratchets |
| Flux Score (Pass behaviors) | ○ Post-MVT | Scoring model needs user data |
| Avoidance Indices | ○ Post-MVT | Requires Pass scoring model |
| Negative Behavior Logging | ○ Post-MVT | Quit tracking |
| AI Chat Interface | ○ Post-MVT | Deep-dive conversations |
| App Integrations | ✗ Future | After core validation |

---

*Flux Technologies LLC | December 2025*
