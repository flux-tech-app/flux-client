# Flux Current State Corrections

**Last Updated:** December 2024

**Purpose:** This document contains critical product and technical changes that override any conflicting information found in older project documentation. Always read this AFTER reviewing project files to understand current product state.

---

## Critical Corrections (Override All Conflicting Documentation)

### 1. No BUILD/RESIST Mechanics
**OLD (Incorrect):** Flux used BUILD habits (complete to earn) and RESIST habits (auto-earn unless failure logged).

**CURRENT (Correct):** 
- All habits require explicit logging to earn transfer rights
- No auto-earning mechanics
- No BUILD/RESIST distinction in earning logic
- User logs completions regardless of habit type
- Every log = earns transfer right to Flux savings

### 2. Money Flow Model
**OLD (Incorrect):** Money transfers from user's checking account to user's personal savings account.

**CURRENT (Correct):**
- Money transfers from user's **checking account** → **Flux savings account** (Stripe Treasury)
- Flux holds real money in FDIC-insured accounts via Stripe Treasury (Banking-as-a-Service)
- Portfolio balance = REAL money held by Flux, not tracking/virtual currency
- Friday transfers move money from pending balance into user's Flux savings
- Users are building actual savings held by Flux, not moving to personal accounts

### 3. AI Assistant Role
**OLD (Incorrect):** Flux AI chat is the primary command center for all interactions (habit creation, scheduling, logging, etc.).

**CURRENT (Correct):**
- Flux AI assistant provides **insights and coaching throughout the app**
- AI is embedded contextually on relevant screens
- Traditional UI handles primary interactions (habit creation, logging, scheduling)
- AI augments experience with intelligence, not replaces core UI
- Think: Intelligent companion, not command-line interface

### 4. Pattern Recognition vs. Scheduled Habits
**OLD (Incorrect):** Users set specific schedules (daily, weekdays, X times per week) and are measured against those schedules.

**CURRENT (Correct):**
- **Every habit is effectively "daily" from a scheduling perspective**
- Users log whenever they complete habits—no forced schedules
- Flux learns behavioral patterns over time through actual logs
- After sufficient data, Flux identifies:
  - Natural frequency patterns (e.g., "user typically exercises 4-5x/week")
  - Timing patterns (e.g., "user meditates weekday mornings")
  - Consistency trends (regular vs. sporadic)
  - Baseline establishment for comparison
- **This is a behavioral intelligence platform**, not a schedule tracker
- Insights compare current behavior against **user's own established patterns**, not arbitrary goals
- More data = smarter insights and more accurate pattern recognition

### 5. Habit Strength Score (HSS) Implications
**OLD (Incorrect):** HSS calculated using streaks, momentum against scheduled days, completion percentages vs. set schedules.

**CURRENT (Correct):**
- HSS must be revised to reflect pattern-based model
- New potential components:
  - **Frequency trends** (increasing/stable/declining over time)
  - **Consistency score** (reliability relative to established patterns)
  - **Recency** (how recently user has logged)
  - **Volatility** (steady behavior vs. erratic patterns)
  - **Baseline comparison** (performance vs. user's own historical average)
- No schedule-based metrics (no "completed X of Y scheduled days")
- Algorithm becomes more sophisticated as more user data accumulates

---

## Technical Implications

### Data Model Changes
- Remove scheduling fields (specific days, weekdays, frequency targets)
- Habit creation simplified: just name and category
- Pattern detection requires:
  - Time-series log analysis
  - Rolling averages and trend calculations
  - Historical baseline establishment
  - Anomaly detection (unusual gaps/spikes)

### Money Calculation Changes
- Each log = earns transfer right, regardless of schedule
- No schedule to validate against for earnings
- Simpler earning logic: log completion → earn money
- Transfer amounts still need to be defined (per log? weekly total?)

### UI/UX Changes
- Habit creation flow drastically simplified (no scheduling UI)
- Home page shows habits as "available to log" not "scheduled for today"
- Calendar views show actual log history, not schedule adherence
- Insights focus on pattern detection: "You typically log this on Tuesdays"
- AI coaching references natural patterns: "You haven't logged meditation in 3 days—unusual for you"

---

## What This Means for Development

**Positioning:** Flux is a **behavioral intelligence platform** that learns user patterns, not a schedule enforcement tool.

**Core Value:** Real money accountability + pattern recognition creates genuine behavioral insights, not just tracking against arbitrary goals.

**Data Advantage:** Captures what users ACTUALLY do, not what they wish they'd do—making indices dataset infinitely more valuable.

**User Experience:** Eliminates form fatigue and schedule guilt. No broken streaks when life happens. More forgiving, more intelligent, more useful.

**Morningstar Analogy:** Like investment analysis, Flux analyzes actual performance trends over time, not daily compliance to rigid benchmarks.

---

## When These Corrections Apply

✅ **Always prioritize information in this document** over conflicting info in:
- FLUX-MVP-CHECKLIST-FINAL.md
- FLUX-COMPREHENSIVE-PHASE-ROADMAP-UPDATED.docx
- HHS-Technical-Specification.docx
- Any UI mockup files or design documents
- Any strategy documents mentioning BUILD/RESIST mechanics

✅ **These corrections represent current product direction** as of December 2024 and reflect recent strategic pivots.

✅ **Project files provide valuable context** about business model, competitive positioning, vision—just apply these corrections when conflicts arise.

---

## Questions to Resolve

1. **Transfer amount logic:** How much does each log earn? Fixed amount? Variable based on habit value?
2. **Pattern establishment threshold:** How many logs needed before Flux can reliably identify patterns? (2 weeks? 1 month?)
3. **HSS algorithm specifics:** Which pattern-based components should be weighted most heavily?
4. **UI for pattern display:** How do we visualize "your typical pattern" vs. current behavior?
5. **AI coaching triggers:** What pattern deviations should prompt AI insights?

---

*This document should be updated as product decisions evolve. When major changes occur, update this file rather than immediately updating all project documentation.*
