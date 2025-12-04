# Flux Glossary

**Purpose:** Consistent terminology across all Flux documentation. When in doubt, reference this document.

**Last Updated:** December 2, 2025

---

## Core Concepts

### Log
A recorded completion of a habit. Every log includes a timestamp and earns the user a transfer right. Logs are the fundamental data unit in Flux - all pattern recognition, scoring, and earnings derive from log history.

### Position
A habit displayed using investment portfolio metaphor. Each habit is a "position" in the user's behavioral portfolio, with performance metrics similar to financial investments.

### Ticker
A short symbol representing a habit (e.g., $RUN, $ZEN, $WORK, $READ). Used throughout the UI to reinforce the investment portfolio aesthetic.

### Habit Library
The curated set of 15 pre-defined habits users can select from in MVT. Users choose from this library rather than creating custom habits, ensuring consistent data quality for indices.

---

## Money Flow

### Transfer Rights
What users earn when they log a habit completion. Each log earns one transfer right, which converts to real money during the weekly Friday transfer.

### Transfer Amount
The dollar value earned per log. Can be structured two ways:
- **Fixed Rate:** Flat amount per completion (e.g., $5 per workout)
- **Variable Rate:** Amount per unit (e.g., $0.10/minute, $1/mile, $0.50/chapter)

### Pending Balance
Transfer rights accumulated during the current week that haven't yet been transferred. Resets to zero after Friday transfer.

### Friday Transfer
The weekly transfer of pending balance from user's checking account to their Flux savings. Occurs every Friday. This is when "potential earnings" become "real savings."

### Flux Savings
The user's savings held in Flux via Stripe Treasury. This is real money in FDIC-insured accounts, withdrawable anytime. Not virtual currency or points.

### Portfolio Balance
Total real money held in the user's Flux savings account. Represents cumulative earnings from all completed habits minus any withdrawals.

---

## Pattern Recognition

### Baseline
A user's established behavioral pattern for a specific habit, calculated from historical logs (typically 90-day window). Includes typical frequency, average gap between logs, and for measurable habits, average volume. Baseline establishes what's "normal" for this user.

### Building Baseline
The early phase (first ~10 logs) before Flux can reliably identify patterns. During this phase, users see simplified metrics and the message "Keep logging to unlock full Flux Score."

### Typical Gap
The average number of days between logs for a given habit. Used to determine when a user is "overdue" relative to their own pattern.

### Gap Variance
How much the gap between logs fluctuates. Low variance = consistent habit. High variance = irregular habit. Affects the Consistency component of Flux Score.

---

## Flux Score

### Flux Score
A proprietary 100-point score measuring habit quality. Replaces the old "Habit Strength Score (HSS)" terminology. Calculated from five components:

1. **Frequency Trend (30 pts)** - Recent frequency vs. baseline frequency
2. **Consistency (25 pts)** - Variance in gaps between logs (lower variance = higher score)
3. **Recency (20 pts)** - Days since last log relative to typical gap
4. **Volume/Intensity (15 pts)** - For measurable habits: recent average vs. baseline average
5. **Data Maturity (10 pts)** - Confidence based on total log count (maxes at 30+ logs)

Uses continuous mathematical formulas with exponential decay - no arbitrary thresholds or tiers.

---

## Savings Goals

### Savings Goal
A specific financial objective a user can link to their habits. Examples: vacation fund, emergency savings, new laptop, wedding fund. Creates direct connection between behavior and wealth-building: "Every meditation session adds $4 to my vacation fund."

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
| BUILD habits | (removed - all habits require logging) |
| RESIST habits | (removed - all habits require logging) |
| Scheduled days | (removed - no forced schedules) |
| Completion percentage | Frequency trend, consistency |
| Streak | (avoided - use patterns, consistency) |
| Auto-earning | (removed - all logs are explicit) |

---

## Quick Reference

| Term | One-Line Definition |
|------|---------------------|
| Log | Recorded habit completion with timestamp |
| Position | A habit as a portfolio investment |
| Ticker | Short symbol for habit ($RUN, $ZEN) |
| Habit Library | 15 pre-defined habits for MVT |
| Transfer Rights | What you earn per log |
| Pending Balance | This week's unprocessed earnings |
| Friday Transfer | Weekly checking → Flux savings move |
| Flux Savings | Real money held by Flux (Stripe Treasury) |
| Portfolio Balance | Total savings in Flux account |
| Baseline | Your established pattern for a habit |
| Typical Gap | Average days between your logs |
| Flux Score | 100-point habit quality measure (5 components) |
| Savings Goal | Financial objective linked to habits |
| Behavior-Level Index | Aggregate user performance for a behavior |

---

*Flux Technologies LLC | December 2025*
