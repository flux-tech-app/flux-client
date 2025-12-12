# Flux Roadmap

**Phases, Scope & Timeline**

**Last Updated:** December 11, 2025

---

## Document Purpose

This document defines what we're building, when, and what gates must be passed before proceeding. It replaces scattered phase documents with a single authoritative timeline.

For product specifications, see FLUX-PRODUCT-BLUEPRINT.md.
For business context, see FLUX-BUSINESS-BLUEPRINT.md.

---

## Table of Contents

1. [Current State](#1-current-state)
2. [MVT Scope](#2-mvt-scope)
3. [Phase Overview](#3-phase-overview)
4. [Phase Details](#4-phase-details)
5. [Decision Gates](#5-decision-gates)
6. [What's In / What's Out](#6-whats-in--whats-out)
7. [Dependencies & Risks](#7-dependencies--risks)

---

## 1. Current State

### What's Built (70% Functional Prototype)

**Deployed on Vercel, React/Vite stack:**

- Portfolio dashboard with habit cards and balance display
- Habit detail pages with calendar heatmaps and progress charts
- Activity logging functionality
- Money system simulation (pending balance, Friday transfers)
- Transfer history tracking
- Mobile-responsive UI with professional polish
- HabitContext state management
- GitHub version control

### What's Not Yet Aligned with Current Vision

The existing prototype was built with the old model (BUILD/RESIST, schedules, chat-first). Significant rework needed:

- Remove schedule-based logic â†’ Implement pattern recognition
- Remove BUILD/RESIST mechanics â†’ All habits require explicit logging
- Reduce AI from "command center" â†’ AI as intelligent companion
- Update 8 categories â†’ 4 categories (FITNESS, FINANCIAL, PRODUCTIVITY, WELLNESS)
- Add curated habit library â†’ 15 pre-defined habits for MVT
- Rename HHS â†’ Flux Score with updated algorithm

### Business Infrastructure (Complete)

- Flux Technologies LLC formed (Michigan)
- Mercury business banking configured
- Microsoft 365 Business Basic (ryan@fluxtechnologies.io)
- Anthropic Console account with API key
- $16K initial investment secured

---

## 2. MVT Scope

### What MVT Must Prove

**Core Hypothesis:** Real financial accountability (even simulated) combined with pattern recognition creates sustained behavior change that users value.

### MVT Requirements

**1. Habit Library Selection**
- User selects from 15 curated habits across 4 categories
- No custom habit creation in MVT (ensures index data quality)
- Clear onboarding explaining the library approach

**2. Explicit Logging for All Habits**
- Every habit requires manual logging to earn
- No auto-earning mechanics
- Clean, fast logging flow (< 5 seconds)

**3. Pattern Recognition Foundation**
- Track timestamps, frequency, gaps between logs
- Calculate baseline after 10+ logs
- Show "Building baseline..." messaging for new habits
- No schedule enforcement

**4. Accurate Money Calculations**
- Pending balance tracks weekly earnings correctly
- Friday transfer simulation works (pending â†’ portfolio)
- Transfer history maintains integrity
- Zero calculation errors

**5. Flux Score (Simplified for MVT)**
- Calculate 5 components after 10+ logs
- Show "Building baseline..." before sufficient data
- Display score on habit detail pages
- Color coding: Green (80+), Yellow (60-79), Orange (40-59), Red (<40)

**6. Portfolio Dashboard**
- All positions (habits) displayed with tickers
- Total portfolio balance
- Pending vs. transferred breakdown
- Basic earnings visualization

**7. AI Companion (Contextual)**
- Insights embedded on relevant screens
- Pattern-based observations ("You typically log this 4x/week")
- NOT primary interface for logging/creation
- Chat available for questions/exploration (optional)

**8. Data Consistency**
- HabitContext as single source of truth
- All screens reflect current state
- localStorage persistence (no backend yet)

### Success Criteria for MVT

| Metric | Target | Rationale |
|--------|--------|-----------|
| Week 4 retention | 60%+ | Users continue after novelty wears off |
| Logs per user per week | 15+ | Sufficient engagement for accountability |
| Money calculation accuracy | 100% | Zero errors in financial logic |
| Users requesting real money | Qualitative | Validates desire for real stakes |
| Pattern recognition valued | Qualitative | Users mention "no guilt" or "forgiving" |

---

## 3. Phase Overview

| Phase | Timeline | Focus | Gate |
|-------|----------|-------|------|
| **Phase 1: MVT Build** | Weeks 1-8 | Core app aligned with current vision | Functional prototype |
| **Phase 2: Validation** | Weeks 9-16 | Beta testing with 50+ users | Retention & engagement metrics |
| **Phase 3: Polish & Iterate** | Weeks 17-20 | Refinement based on feedback | Ready for banking decision |
| **DECISION GATE** | Week 20 | Proceed to banking or iterate | â€” |
| **Phase 4: Banking Infrastructure** | Weeks 21-32 | BaaS provider, Plaid, real money | Real transfers working |
| **Phase 5: Beta Launch** | Weeks 33-42 | 100-500 users, real money flowing | Stable, scalable |
| **Phase 6: Indices & Scale** | Weeks 43-52 | Behavior-level indices, growth | Public launch ready |

**Total Timeline:** ~52 weeks to public launch (conditional on validation)

---

## 4. Phase Details

### Phase 1: MVT Build (Weeks 1-8)

**Goal:** Rebuild prototype to align with current product vision.

**Week 1-2: Foundation Reset**
- Remove BUILD/RESIST logic from codebase
- Remove schedule-based calculations
- Update category structure (8 â†’ 4)
- Implement curated 15-habit library
- Update terminology throughout (HHS â†’ Flux Score)

**Week 3-4: Pattern Recognition Core**
- Implement log-based pattern tracking
- Calculate baseline metrics (typical gap, frequency)
- Build "Building baseline..." states
- Update calendar/charts to show actual logs (not schedule adherence)

**Week 5-6: Flux Score & Money System**
- Implement 5-component Flux Score algorithm
- Ensure money calculations are bulletproof
- Friday transfer simulation
- Transfer history accuracy

**Week 7-8: AI Companion & Polish**
- Contextual AI insights on key screens
- Optional chat interface for exploration
- Onboarding flow updates
- Testing and edge case handling

**Deliverable:** Functional MVT prototype ready for beta users.

---

### Phase 2: Validation (Weeks 9-16)

**Goal:** Prove core hypotheses with real users.

**Week 9-10: Beta Recruitment**
- Recruit 50+ beta testers (friends, family, early community)
- Onboarding and setup support
- Establish feedback channels

**Week 11-14: Active Testing**
- Users engage with app for 4+ weeks
- Track retention, engagement, and logging patterns
- Collect qualitative feedback (interviews, surveys)
- Monitor for bugs and edge cases

**Week 15-16: Analysis**
- Calculate retention metrics
- Analyze engagement patterns
- Synthesize qualitative feedback
- Prepare validation report

**Deliverable:** Clear data on whether core hypotheses hold.

---

### Phase 3: Polish & Iterate (Weeks 17-20)

**Goal:** Refine based on validation feedback before banking decision.

- Address top user pain points
- Improve Flux Score visualization
- Enhance AI companion messaging
- Performance optimization
- UX polish based on feedback

**Deliverable:** Refined prototype ready for banking decision.

---

### DECISION GATE (Week 20)

**Validation Criteria:**

| Metric | Proceed | Iterate | Pivot |
|--------|---------|---------|-------|
| Week 4 retention | 60%+ | 40-60% | <40% |
| Logs per user/week | 15+ | 10-15 | <10 |
| User sentiment | "Want real money" | "Interesting" | "Don't get it" |
| Pattern recognition | Valued | Neutral | Confusing |

**If PROCEED:** Move to Phase 4 (Banking Infrastructure)
**If ITERATE:** 4-8 weeks additional refinement, re-validate
**If PIVOT:** Fundamental rethink required

---

### Phase 4: Banking Infrastructure (Weeks 21-32)

**Goal:** Enable real money transfers.

**Conditional on successful validation.**

**Week 21-24: Backend Infrastructure**
- Supabase setup (PostgreSQL + auth)
- User authentication (email, Google, Apple)
- Migration from localStorage to cloud
- API development
- Security consultation

**Week 25-28: Plaid Integration**
- Plaid Link implementation
- Bank account connection flow
- Account verification
- Balance checking

**Week 29-31: BaaS Provider Integration**

> **Note:** BaaS provider selection in progress. Unit, Treasury Prime, and Synctera under evaluation. Stripe Treasury B2B-only.

- BaaS provider account setup
- Transfer API integration
- Friday automated transfers
- Transfer status tracking
- Failure handling

**Week 32: Testing & Compliance**
- End-to-end transfer testing
- Security audit
- Legal compliance review
- Terms of service updates

**Deliverable:** Real money transfers working.

**Estimated Cost:** $30-50K additional investment

---

### Phase 5: Beta Launch (Weeks 33-42)

**Goal:** Scale to 100-500 users with real money.

- Expanded beta (100-500 users)
- Real money flowing through system
- Monitor for issues at scale
- Iterate on AI companion based on real usage
- Email infrastructure (transfer notifications)
- Customer support processes

**Deliverable:** Stable system ready for public launch.

---

### Phase 6: Indices & Scale (Weeks 43-52)

**Goal:** Launch behavior-level indices and prepare for public launch.

**Week 43-46: Indices Backend**
- Behavior-level index calculations
- Anonymous data aggregation
- Percentile algorithms
- Minimum user thresholds per behavior

**Week 47-49: Indices UI**
- Index detail pages (per mockup 17-behavior-index-cardio.html)
- User percentile display
- Population distribution visualization
- Pattern insights

**Week 50-52: Launch Prep**
- App store preparation (React Native if needed)
- Marketing materials
- Public launch infrastructure
- Subscription tier implementation

**Deliverable:** Public launch ready.

---

## 5. Decision Gates

### Gate 1: MVT Complete (Week 8)

**Criteria:**
- [ ] All MVT requirements functional
- [ ] 15-habit library implemented
- [ ] Pattern recognition working
- [ ] Flux Score calculating correctly
- [ ] Money system accurate
- [ ] AI companion providing insights

**If not met:** Extend Phase 1 until criteria satisfied.

---

### Gate 2: Validation (Week 16)

**Criteria:**
- [ ] 50+ users completed 4+ weeks
- [ ] Retention data collected
- [ ] Engagement metrics analyzed
- [ ] Qualitative feedback synthesized

**If not met:** Extend testing period.

---

### Gate 3: Banking Decision (Week 20)

**Proceed Criteria:**
- [ ] 60%+ Week 4 retention
- [ ] 15+ logs per user per week
- [ ] Positive sentiment on real money
- [ ] Pattern recognition valued (not confusing)

**If not met:** Iterate or pivot per decision matrix.

---

### Gate 4: Real Money Launch (Week 32)

**Criteria:**
- [ ] Real transfers executing correctly
- [ ] Security audit passed
- [ ] Legal compliance confirmed
- [ ] 10+ internal users testing with real money

**If not met:** Extend Phase 4 until stable.

---

## 6. What's In / What's Out

### MVT (Phase 1-2) - IN

| Feature | Status |
|---------|--------|
| 15-habit curated library | Required |
| 4 categories (FITNESS, FINANCIAL, PRODUCTIVITY, WELLNESS) | Required |
| Explicit logging for all habits | Required |
| Pattern recognition (baseline after 10 logs) | Required |
| Flux Score (5 components) | Required |
| Money simulation (pending, Friday transfers) | Required |
| Portfolio dashboard | Required |
| Habit detail pages | Required |
| Activity feed | Required |
| AI contextual insights | Required |
| AI chat (optional exploration) | Required |
| Onboarding flow | Required |
| localStorage persistence | Required |

### MVT (Phase 1-2) - OUT

| Feature | Deferred To |
|---------|-------------|
| Custom habit creation | Post-MVT |
| Real money transfers | Phase 4 |
| User authentication | Phase 4 |
| Cloud sync / multi-device | Phase 4 |
| Behavior-level indices | Phase 6 |
| Savings goals allocation | Phase 5 |
| Achievement badges | Phase 5 |
| Proactive AI notifications | Phase 5 |
| Advanced AI coaching personas | Phase 6+ |
| App store deployment | Phase 6 |
| Subscription tiers | Phase 6 |

### Explicitly Removed (Not Coming Back)

| Feature | Reason |
|---------|--------|
| BUILD/RESIST mechanics | All habits now require explicit logging |
| Schedule enforcement | Pattern recognition replaces schedules |
| Chat as primary interface | AI is companion, not command center |
| 80% chat adoption metric | No longer relevant to validation |
| 8 category structure | Simplified to 4 categories |
| HHS terminology | Now called Flux Score |

---

## 7. Dependencies & Risks

### External Dependencies

| Dependency | Phase | Risk Level | Mitigation |
|------------|-------|------------|------------|
| Anthropic API | Phase 1+ | Low | OpenAI as fallback |
| BaaS provider approval | Phase 4 | Medium | Early evaluation of Unit/Treasury Prime/Synctera |
| Plaid partnership | Phase 4 | Low | Standard integration |
| App Store approval | Phase 6 | Medium | Follow guidelines, early submission |

### Technical Risks

| Risk | Phase | Impact | Mitigation |
|------|-------|--------|------------|
| Pattern recognition complexity | Phase 1 | Medium | Start simple, iterate |
| Flux Score accuracy | Phase 1 | High | Extensive testing with sample data |
| Money calculation errors | Phase 1-4 | Critical | Automated tests, manual verification |
| localStorage limits | Phase 2 | Low | Monitor, plan migration |
| Banking integration delays | Phase 4 | High | Buffer time, phased rollout |

### Business Risks

| Risk | Phase | Impact | Mitigation |
|------|-------|--------|------------|
| Validation fails | Phase 2 | High | Decision gates, pivot options |
| Insufficient funding for Phase 4 | Phase 3 | High | Fundraising based on validation data |
| User acquisition challenges | Phase 5-6 | Medium | Organic growth focus, community building |

---

## Appendix: Timeline Summary

```
PHASE 1: MVT BUILD (Weeks 1-8)
â”œâ”€â”€ Week 1-2: Foundation reset
â”œâ”€â”€ Week 3-4: Pattern recognition
â”œâ”€â”€ Week 5-6: Flux Score & money
â””â”€â”€ Week 7-8: AI companion & polish
    â†“
[Gate 1: MVT Complete]
    â†“
PHASE 2: VALIDATION (Weeks 9-16)
â”œâ”€â”€ Week 9-10: Beta recruitment
â”œâ”€â”€ Week 11-14: Active testing
â””â”€â”€ Week 15-16: Analysis
    â†“
[Gate 2: Validation Complete]
    â†“
PHASE 3: POLISH (Weeks 17-20)
â””â”€â”€ Refinement based on feedback
    â†“
[Gate 3: BANKING DECISION - Week 20]
    â†“
PHASE 4: BANKING (Weeks 21-32) [Conditional]
â”œâ”€â”€ Week 21-24: Backend infrastructure
â”œâ”€â”€ Week 25-28: Plaid integration
â”œâ”€â”€ Week 29-31: BaaS integration
â””â”€â”€ Week 32: Testing & compliance
    â†“
[Gate 4: Real Money Launch]
    â†“
PHASE 5: BETA LAUNCH (Weeks 33-42)
â””â”€â”€ 100-500 users, real money
    â†“
PHASE 6: INDICES & SCALE (Weeks 43-52)
â”œâ”€â”€ Behavior-level indices
â””â”€â”€ Public launch prep
    â†“
PUBLIC LAUNCH (~Week 52)
```

---

*Flux Technologies LLC | December 2025*
