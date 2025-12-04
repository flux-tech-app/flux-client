# Flux Decisions Log

**Key Product & Business Decisions**

**Last Updated:** December 2, 2025

---

## Document Purpose

This is a living document tracking significant decisions made during Flux development. Each entry includes the decision, rationale, date, and any relevant context. Use this to understand why things are the way they are.

For current product state, see FLUX-PRODUCT-BLUEPRINT.md.
For current business model, see FLUX-BUSINESS-BLUEPRINT.md.

---

## How to Use This Log

**When to add an entry:**
- Major product direction changes
- Feature inclusion/exclusion decisions
- Business model changes
- Technology choices
- Anything someone might later ask "why did we do it this way?"

**Entry format:**
```
### [Decision Title]
**Date:** [When decided]
**Decision:** [What was decided]
**Rationale:** [Why]
**Alternatives Considered:** [What else was on the table]
**Status:** [Active / Superseded / Under Review]
```

---

## 2025 Decisions

### Pattern Recognition Over Schedule Enforcement
**Date:** December 2025  
**Decision:** Flux learns user patterns from actual logs rather than enforcing user-defined schedules.  
**Rationale:** 
- Captures what users ACTUALLY do, not what they wish they'd do
- Eliminates "streak guilt" when life happens
- Creates more valuable data for indices (real patterns, not aspirational schedules)
- Differentiates from every other habit tracker
- More forgiving UX = better retention

**Alternatives Considered:**
- Traditional schedule model (user sets M/W/F, app measures adherence) - rejected as commoditized
- Hybrid model (optional schedules) - deferred to post-MVT as "Optional User Goals"

**Status:** Active

---

### All Habits Require Explicit Logging
**Date:** December 2025  
**Decision:** Remove BUILD/RESIST mechanics. All habits require manual logging to earn transfer rights.  
**Rationale:**
- Simpler, more consistent logic
- No confusion about which habits auto-earn vs. require logging
- Cleaner data (every log is an explicit action)
- Easier to explain to users

**Alternatives Considered:**
- BUILD (log to earn) + RESIST (auto-earn unless failure logged) - rejected as confusing and inconsistent

**Status:** Active

---

### Flux Score (Renamed from HSS)
**Date:** December 2025  
**Decision:** Rename "Habit Strength Score" (HSS) to "Flux Score" throughout product.  
**Rationale:**
- Consistent branding with app name
- Clearer identity
- "Flux Score" sounds more proprietary and unique
- Easier to say and remember

**Alternatives Considered:**
- Keep HSS - rejected for branding clarity
- "Behavior Score" - rejected as generic

**Status:** Active

---

### Behavior-Level Indices (Not Category Rollups)
**Date:** December 2025  
**Decision:** Indices measure specific behaviors (Cardio Index, Meditation Index) not category aggregates (Exercise Category Index).  
**Rationale:**
- More meaningful comparisons (comparing runners to runners)
- Requires minimum users per behavior for statistical validity
- Cleaner data quality
- Category rollups would mix incomparable behaviors

**Alternatives Considered:**
- Category-level indices - rejected as too broad, deferred to later phase
- Both behavior and category - complexity without clear value for MVT

**Status:** Active

---

### Curated 15-Habit Library for MVT
**Date:** December 2025  
**Decision:** Users select from pre-defined library of 15 habits rather than creating custom habits.  
**Rationale:**
- Ensures index data quality (consistent habit definitions)
- Simplifies MVP scope significantly
- Enables meaningful comparisons across users
- Reduces edge cases and complexity
- Faster onboarding (select vs. configure)

**Alternatives Considered:**
- Open custom creation - rejected for MVT (data quality concerns)
- Larger library (30+) - rejected as unnecessary complexity for MVT
- Smaller library (8-10) - rejected as too limiting

**Status:** Active (MVT only - custom habits may come later)

---

### AI as Intelligent Companion (Not Command Center)
**Date:** December 2025  
**Decision:** AI provides contextual insights throughout app. Traditional UI handles core interactions (habit creation, logging, navigation).  
**Rationale:**
- Chat-first approach created unnecessary friction in testing
- Users expect familiar UI patterns for core actions
- AI adds value through insights, not by replacing buttons
- Easier to build and maintain
- Removes "80% chat adoption" metric that was forcing unnatural UX

**Alternatives Considered:**
- Chat-first (all interactions via conversation) - rejected after strategic review
- No AI - rejected as losing key differentiator

**Status:** Active

---

### 8-Document Architecture
**Date:** December 2, 2025  
**Decision:** Replace 20+ scattered documents with 8 authoritative documents.  
**Rationale:**
- Single source of truth for each domain
- Reduces contradictions between documents
- Easier to maintain and update
- Clear ownership and purpose for each document

**Documents:**
1. FLUX-MANIFESTO.md (mission, vision, philosophy)
2. FLUX-GLOSSARY.md (terminology)
3. FLUX-PRODUCT-BLUEPRINT.md (features)
4. FLUX-BUSINESS-BLUEPRINT.md (business model)
5. FLUX-ROADMAP.md (timeline)
6. FLUX-DECISIONS-LOG.md (this document)
7. FLUX-MILESTONES-LOG.md (progress)
8. FLUX-TECHNICAL-BLUEPRINT.md (architecture - build phase)

**Status:** Active

---

### Savings Goals as Core Feature
**Date:** December 2025  
**Decision:** Users can link habits to specific financial objectives (vacation fund, emergency savings, etc.).  
**Rationale:**
- Creates direct behavior-to-wealth connection
- Transforms abstract habit completion into tangible progress
- Increases stickiness (habits = visible progress toward goals)
- Unique differentiator in market

**Alternatives Considered:**
- Generic "savings" without goals - rejected as less motivating
- Multiple habits per goal with splitting - deferred (complexity)

**Status:** Active (UX details to be designed)

---

### Negative Behavior Logging Without Earnings
**Date:** December 2025  
**Decision:** Users can track "quit" behaviors (smoking, gambling, etc.) by logging slips. These logs do NOT earn transfer rights.  
**Rationale:**
- Earning for resistance creates wrong incentive (just don't log slips)
- Honest data collection requires no penalty for logging
- Pattern recognition works best with complete data
- AI coaching more valuable when user is honest

**Alternatives Considered:**
- Earn for resistance (old RESIST model) - rejected
- Deductions for slips - flagged for future consideration, not MVT

**Status:** Active

---

### Optional User Goals (Alongside Pattern Recognition)
**Date:** December 2025  
**Decision:** Users can optionally set targets (4x/week, 20 min/day). These exist alongside pattern recognition - Flux still learns natural patterns regardless.  
**Rationale:**
- Some users are motivated by explicit goals
- Others find them stressful
- Accommodates both preferences
- Goals don't replace pattern recognition - they complement it

**Alternatives Considered:**
- No goals (pattern-only) - rejected as limiting for goal-oriented users
- Goals required - rejected as adding pressure

**Status:** Active (post-MVT implementation)

---

### $3.99/Month Premium Pricing
**Date:** November 2025  
**Decision:** Premium tier priced at $3.99/month ($38.39/year with 20% discount).  
**Rationale:**
- Under $5 = impulse purchase territory
- Undercuts competitors (Habitica $5, Strides $4.99)
- Optimizes for conversion volume (important for indices data)
- Can raise later after establishing market position

**Alternatives Considered:**
- $2.99 - rejected (lower LTV, minimal conversion improvement)
- $4.99-$5.99 - rejected (lower conversion, fewer users for indices)
- $9.99 - rejected (too high for new player)

**Status:** Active

---

### Stripe Treasury for Banking Infrastructure
**Date:** November 2025  
**Decision:** Use Stripe Treasury (Banking-as-a-Service) rather than building proprietary banking infrastructure.  
**Rationale:**
- Lower complexity and faster launch
- FDIC insurance included
- Trusted brand for users
- Well-documented API
- Reduces regulatory burden

**Alternatives Considered:**
- Proprietary banking (like Acorns) - rejected as too complex/expensive
- Different BaaS provider - Stripe preferred for ecosystem integration

**Status:** Active

---

### Morningstar Positioning (Not Bloomberg)
**Date:** December 2025  
**Decision:** Position Flux as "Morningstar for habits" - clean, thoughtful analysis with long-term perspective. Not "Bloomberg Terminal" with dense real-time data.  
**Rationale:**
- Morningstar = accessible insights, long-term perspective
- Bloomberg = information density, real-time trading
- Flux users want clarity, not overwhelm
- Aligns with "no guilt" UX philosophy
- Affects UI decisions: favor clarity over comprehensiveness

**Alternatives Considered:**
- Bloomberg positioning - rejected as implying density/complexity users don't want

**Status:** Active

---

### Four Categories (Not Eight)
**Date:** December 2025  
**Decision:** Simplify from 8 categories to 4: FITNESS, FINANCIAL, PRODUCTIVITY, WELLNESS.  
**Rationale:**
- Cleaner organization
- Easier to reach minimum users per behavior for indices
- Reduces cognitive load
- 15-habit library fits naturally into 4 categories

**Previous Categories (Removed):**
- Fitness, Nutrition, Mental Health, Productivity, Financial, Social, Wellness, Miscellaneous

**Status:** Active

---

### Atomic Object as Development Partner
**Date:** November 2025  
**Decision:** Pursue Atomic Object for discovery and build phases over other vendors.  
**Rationale:**
- Methodical validation approach aligns with staged development
- Fintech experience relevant to banking integration
- Discovery-first model reduces risk
- Higher cost justified by reduced iteration cycles

**Alternatives Considered:**
- Grand Apps - rejected ("let's build" approach less methodical)
- Solo development - rejected (speed and expertise needs)

**Status:** Active (discovery engagement pending)

---

## Decision Backlog (To Be Decided)

| Question | Context | Target Date |
|----------|---------|-------------|
| What are the specific 15 habits for MVT? | Need to define curated library | Before Phase 1 |
| Minimum users per behavior for valid index? | Statistical validity threshold | Phase 6 |
| Negative behavior deductions? | Deduct from pending for slips | Post-MVT review |
| App integration priority? | Strava, Apple Health, etc. | Phase 5+ |
| Founding member community platform? | Discord vs. in-app vs. email | Before beta |

---

## Superseded Decisions

| Decision | Date | Superseded By | Date |
|----------|------|---------------|------|
| BUILD/RESIST mechanics | Pre-Dec 2025 | All habits require logging | Dec 2025 |
| Chat-first interface | Pre-Dec 2025 | AI as companion | Dec 2025 |
| 8 category structure | Pre-Dec 2025 | 4 categories | Dec 2025 |
| HSS terminology | Pre-Dec 2025 | Flux Score | Dec 2025 |
| Schedule enforcement | Pre-Dec 2025 | Pattern recognition | Dec 2025 |
| Bloomberg positioning | Pre-Dec 2025 | Morningstar positioning | Dec 2025 |

---

*Flux Technologies LLC | December 2025*
