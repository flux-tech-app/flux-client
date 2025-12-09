# Flux Glossary

**Purpose:** Consistent terminology across all Flux documentation. When in doubt, reference this document.

**Last Updated:** December 8, 2025

---

## Core Concepts

### Log
A recorded completion of a behavior. Every log includes a timestamp and earns the user a transfer right. Logs are the fundamental data unit in Flux - all pattern recognition, scoring, and earnings derive from log history.

### Pass
A recorded successful avoidance of a behavior the user is trying to reduce or quit. Each pass earns a transfer right just like a log. Used for behaviors like takeout, smoking, or impulse purchases.

### Position
A behavior displayed using investment portfolio metaphor. Each behavior is a "position" in the user's behavioral portfolio, with performance metrics similar to financial investments.

### Ticker
A short symbol representing a behavior (e.g., $RUN, $ZEN, $TAKEOUT, $SMOKE). Used throughout the UI to reinforce the investment portfolio aesthetic.

### Behavior Library
The curated set of 23 pre-defined behaviors users can select from in MVT (13 Log behaviors + 10 Pass behaviors). Users choose from this library rather than creating custom behaviors, ensuring consistent data quality for indices.

---

## Money Flow

### Transfer Rights
What users earn when they log a completion or pass on a behavior. Each action earns one transfer right, which converts to real money during the weekly Friday transfer.

### Transfer Amount
The dollar value earned per log or pass. Can be structured two ways:
- **Fixed Rate:** Flat amount per completion (e.g., $5 per workout, $7 per takeout pass)
- **Variable Rate:** Amount per unit (e.g., $0.10/minute, $1/mile, $0.50/chapter)

### Pending Balance
Transfer rights accumulated during the current week that haven't yet been transferred. Resets to zero after Friday transfer.

### Friday Transfer
The weekly transfer of pending balance from user's checking account to their Flux savings. Occurs every Friday. This is when "potential earnings" become "real savings."

### Flux Savings
The user's savings held in Flux via Stripe Treasury. This is real money in FDIC-insured accounts, withdrawable anytime. Not virtual currency or points.

### Portfolio Balance
Total real money held in the user's Flux savings account. Represents cumulative earnings from all completed behaviors minus any withdrawals.

---

## Pattern Recognition

### Baseline
A user's established behavioral pattern for a specific behavior, calculated from historical logs (typically 90-day rolling window). Includes typical frequency, average gap between logs, and for measurable behaviors, average volume. Baseline establishes what's "normal" for this user.

### Building Baseline
The early phase (first ~10 logs) before Flux can reliably identify patterns. During this phase, users see simplified metrics and the message "Keep logging to unlock full Flux Score."

### Typical Gap
The average number of days between logs for a given behavior. Used to determine when a user is "overdue" relative to their own pattern.

### Gap Variance
How much the gap between logs fluctuates. Low variance = consistent behavior. High variance = irregular behavior. Affects the Consistency component of Flux Score.

---

## Flux Score

### Flux Score
A proprietary 100-point score measuring behavior quality. Replaces the old "Habit Strength Score (HSS)" terminology. Calculated from five components:

1. **Frequency Trend (30 pts)** - Recent frequency vs. baseline frequency
2. **Consistency (25 pts)** - Variance in gaps between logs (lower variance = higher score)
3. **Recency (20 pts)** - Days since last log relative to typical gap
4. **Volume/Intensity (15 pts)** - For measurable behaviors: recent average vs. baseline average
5. **Data Maturity (10 pts)** - Confidence based on total log count (maxes at 30+ logs)

Uses continuous mathematical formulas with exponential decay - no arbitrary thresholds or tiers.

---

## Goals

### Goal
A user-set aspirational target for a behavior, consisting of an **amount** and a **period**. Goals represent where the user wants to be, as opposed to baseline which represents where they currently are. Examples: "15 miles / week", "10,000 steps / day", "4 gym sessions / week".

Goals are **required** at behavior setup and exist alongside pattern recognition. They do not affect Flux Score calculation but provide a growth dimension beyond maintenance. For Pass behaviors, goals represent maximum acceptable frequency (e.g., "Max 2 takeout orders / week" or "0 cigarettes / day").

### Goal Period
The time frame over which a goal is measured: day, week, or month. Users choose the period that matches how they naturally think about the behavior. Steps might be daily; running might be weekly; budget review might be monthly.

### Goal Progress
The measurement of current performance relative to the gap between baseline and goal. Expressed as a percentage or visual indicator showing how close the user is to their aspirational target.

```
[Baseline ●━━━━━━━━○━━━━━ Goal]
           ↑ Current
```

### Goal Projection
The financial value of achieving a goal, calculated from goal amount × rate. Shown at behavior setup and on detail pages:
- "At your goal, you'd earn: $15/week, $780/year"
- "Gap: $5.80/week you're leaving on the table"

### Baseline Ratchet
The automatic increase of a user's baseline when they consistently exceed it (3-4 weeks above baseline, with minimum 4 weeks between ratchets). The ratchet "raises the floor"—the user's new normal is now higher than before. Users can then set new goals to continue progressing.

### At Goal
When a user's baseline meets or exceeds their goal. The user has successfully improved to their aspirational target and can either set a new, higher goal or maintain at their current level.

---

## Savings Goals

### Savings Goal
A specific financial objective a user can link to their behaviors. Examples: vacation fund, emergency savings, new laptop, wedding fund. Creates direct connection between behavior and wealth-building: "Every meditation session adds $4 to my vacation fund."

### Savings Goal Projection
Time-to-goal calculations based on current pace vs. goal pace:
- "At baseline: 24 weeks to Hawaii"
- "At goal: 16 weeks to Hawaii"
- "Hitting your goals gets you there 8 weeks sooner"

---

## Indices

### Behavior-Level Index
An aggregate performance metric for a specific behavior across all Flux users (e.g., "Cardio Index: 71.3%"). Shows how users collectively perform on that behavior, providing individual context: "You: Top 15%."

Key distinction: These are behavior-specific (Cardio Index, Meditation Index) rather than category rollups (not "Exercise Category Index"). Requires minimum users per behavior to be statistically valid.

### Index Comparison
Optional feature allowing users to see how their performance compares to other Flux users on the same behavior. Opt-in only. Not a social feature - purely informational context.

---

## Deprecated Terminology

**Do not use these terms in any new documentation:**

| Deprecated | Use Instead |
|------------|-------------|
| HSS / Habit Strength Score | Flux Score |
| BUILD habits | (removed - all behaviors require logging) |
| RESIST habits | (removed - use Pass action instead) |
| Scheduled days | (removed - no forced schedules) |
| Completion percentage | Frequency trend, consistency |
| Streak | (avoided - use patterns, consistency) |
| Auto-earning | (removed - all logs are explicit) |
| Target (ambiguous) | Goal (for aspiration) or Baseline (for pattern) |
| Habit | Behavior (preferred in current documentation) |

---

## Quick Reference

| Term | One-Line Definition |
|------|---------------------|
| Log | Recorded behavior completion with timestamp |
| Pass | Recorded successful avoidance of a behavior |
| Position | A behavior as a portfolio investment |
| Ticker | Short symbol for behavior ($RUN, $ZEN) |
| Behavior Library | 23 pre-defined behaviors for MVT |
| Transfer Rights | What you earn per log or pass |
| Pending Balance | This week's unprocessed earnings |
| Friday Transfer | Weekly checking → Flux savings move |
| Flux Savings | Real money held by Flux (Stripe Treasury) |
| Portfolio Balance | Total savings in Flux account |
| Baseline | Your established pattern for a behavior |
| Typical Gap | Average days between your logs |
| Flux Score | 100-point behavior quality measure (5 components) |
| Goal | Required aspirational target (amount + period) |
| Goal Progress | How close you are to your goal vs. baseline |
| Baseline Ratchet | Automatic baseline increase after sustained improvement (min 4 weeks apart) |
| Savings Goal | Financial objective linked to behaviors |
| Behavior-Level Index | Aggregate user performance for a behavior |

---

*Flux Technologies LLC | December 2025*
