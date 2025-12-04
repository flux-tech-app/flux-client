# Flux Business Blueprint

**Business Model, Revenue Strategy & Market Positioning**

**Last Updated:** December 2, 2025

---

## Document Purpose

This document defines how Flux operates as a business: the value we create, how we monetize, who we compete with, and how we win. It consolidates business model, revenue projections, and competitive analysis into a single authoritative source.

For product specifications, see FLUX-PRODUCT-BLUEPRINT.md.
For terminology, see FLUX-GLOSSARY.md.

---

## Table of Contents

1. [Business Model Overview](#1-business-model-overview)
2. [Value Propositions](#2-value-propositions)
3. [Competitive Moats](#3-competitive-moats)
4. [Revenue Model](#4-revenue-model)
5. [Unit Economics](#5-unit-economics)
6. [Competitive Landscape](#6-competitive-landscape)
7. [Market Positioning](#7-market-positioning)
8. [Key Partnerships](#8-key-partnerships)
9. [Success Metrics](#9-success-metrics)
10. [Product-Market Fit](#10-product-market-fit)
11. [Risk Factors](#11-risk-factors)

---

## 1. Business Model Overview

### The Core Business

Flux is a behavioral intelligence platform that provides:

1. **Consumer App** - Habit tracking with real money accountability
2. **Behavioral Data Authority** - Aggregated indices for licensing

### How Money Works

**Critical Understanding:** Flux does NOT pay users. Users pay themselves with their own money.

```
User's Checking Account 
    ↓ (Friday transfer when habits completed)
User's Flux Account (Stripe Treasury, FDIC-insured)
    ↓ (anytime user wants)
User's External Account (withdrawal)
```

**What "Earn" Means:**
- ✅ Correct: "Earn the right to transfer YOUR OWN money to savings"
- ❌ Wrong: "Flux pays you money"

**Why This Model Works:**
- No payout liability (Flux doesn't pay from company funds)
- Infinitely scalable (not constrained by reward budget)
- Self-funded accountability (users create their own stakes)
- Banking facilitation (Flux provides transfer infrastructure)

### Banking Architecture

Flux uses **Stripe Treasury** (Banking-as-a-Service) to provide FDIC-insured accounts:

- **Custody:** Stripe Treasury holds and manages user funds
- **Linking:** Plaid connects external checking accounts
- **Transfers:** Stripe processes weekly transfers
- **Protection:** Full FDIC insurance on deposits
- **Control:** Users can withdraw anytime

---

## 2. Value Propositions

### For Individual Users

**Core Innovation:** "Invest in yourself, literally" - Real financial accountability for habit completion.

| Value | Description |
|-------|-------------|
| Real Money Transfers | Complete habits → transfer your money to FDIC-insured Flux savings |
| Pattern Recognition | No forced schedules - Flux learns your natural patterns |
| Flux Score | Proprietary algorithm measuring habit quality, not just completion |
| Savings Goals | Link habits directly to financial objectives (vacation, emergency fund) |
| Behavioral Indices | See how you compare to other users on specific behaviors |
| Investment Aesthetic | Professional portfolio design - "Morningstar for habits" |
| Opportunity Cost | See what you earned vs. what you could have earned |
| No Guilt UX | Compare to yourself, not arbitrary goals - forgiving when life happens |

### For Data Partners (Future)

| Value | Description |
|-------|-------------|
| Authoritative Data | Highest quality habit data (financial incentives = accurate logging) |
| Behavior-Level Indices | Aggregated performance metrics (Cardio Index, Meditation Index) |
| Real-Time Insights | Live behavioral performance data |
| Ethical Practices | Transparent, anonymized, opt-in data sharing |

---

## 3. Competitive Moats

### Moat 1: Financial Incentive Data Quality

Real money creates measurably higher quality data than free apps:
- Users care about accuracy when money is involved
- Impossible for competitors to replicate without significant capital
- Data quality compounds as user base grows
- Enables licensing revenue streams competitors can't access

### Moat 2: Proprietary Flux Score

Multi-factor algorithm measuring habit quality:
- 5 components: Frequency Trend, Consistency, Recency, Volume/Intensity, Data Maturity
- Requires longitudinal behavioral data to calculate
- Creates unique insights no competitor can match
- Foundation for predictive analytics
- Patent protection opportunity

### Moat 3: Behavioral Indices Infrastructure

Category-based data structure built from day one:
- Network effects: more users = more valuable comparative insights
- Licensing revenue creates multiple income streams
- Positions Flux as authoritative data source
- "Morningstar for habits" - clean analysis, long-term perspective

### Moat 4: Pattern Recognition Model

No competitor has moved away from schedule enforcement:
- Captures what users ACTUALLY do (not what they wish they'd do)
- More forgiving UX creates better retention
- Richer data for indices (real patterns, not arbitrary goals)
- Difficult to retrofit into existing apps

### Moat 5: Savings Goal Integration

Direct habit-to-financial-goal mapping:
- Creates sticky engagement (visible progress toward objectives)
- Requires sophisticated transfer allocation logic
- Financial motivation compounds behavioral motivation
- Unique in the market

---

## 4. Revenue Model

### Primary Revenue: Subscriptions

**Free Tier: "Flux Free"**
- Unlimited habits (from curated library)
- Virtual money simulation
- Basic Flux Score (overall, not detailed breakdown)
- Current week behavioral indices
- 7-day activity history
- Standard response times

**Premium Tier: "Flux Premium" - $3.99/month**

Everything in Free, plus:
- Real money transfers (Stripe Treasury)
- Bank account linking (Plaid)
- Detailed Flux Score breakdown
- Historical indices access
- Unlimited history
- Opportunity cost insights
- Savings goal allocation
- Monthly performance reports
- Export data
- Priority support

**Annual Option:** $38.39/year (20% discount)

### Pricing Rationale

**Why $3.99?**

1. **Competitive positioning** - Under Habitica ($5), Strides ($4.99), Way of Life ($5.99)
2. **Psychological pricing** - Under $5 = impulse purchase territory
3. **New player strategy** - Undercut to gain market share, raise later
4. **Conversion optimization** - Lower price = higher conversion (target 50%)
5. **Volume matters** - More users = better indices data

### Secondary Revenue: Data Licensing (Phase 7+)

**Tier 1 - Free (Community Edition)**
- Current week indices only
- Rate-limited API
- Attribution required ("Powered by Flux")
- Use case: Blogs, students, personal projects

**Tier 2 - Professional ($500/month)**
- Historical data access
- Subcategory breakdowns
- Commercial use rights
- Higher API limits
- Custom queries
- Monthly trend reports

**Tier 3 - Enterprise ($5K-50K/month)**
- Real-time data feeds
- Custom API integrations
- Dedicated support
- White-label options
- Research collaboration

### Revenue Projections

| Timeline | Active Users | Subscription MRR | Data Licensing | Total MRR |
|----------|--------------|------------------|----------------|-----------|
| Month 12 | 565 | $1,129 | $0 | $1,129 |
| Month 18 | 1,450 | $4,566 | $2,000 | $6,566 |
| Month 24 | 2,525 | $5,039 | $8,000 | $13,039 |
| Month 36 | 5,000+ | $10,000+ | $35,000+ | $45,000+ |

**Profitability Target:** Month 20-21

---

## 5. Unit Economics

### Customer Lifetime Value (LTV)

**Assumptions:**
- Monthly revenue: $3.99
- Average retention: 70%
- Expected lifetime: 16.8 months

**LTV Calculation:**
- Base: $3.99 × 16.8 = **$67.03**
- With 30% annual plans (improved retention): **$72.00**
- Conservative estimate: **$65-72**

### Customer Acquisition Cost (CAC)

| Phase | Channel | CAC |
|-------|---------|-----|
| Beta (M1-3) | Hand-recruited | $0 |
| Launch (M4-6) | Product Hunt, organic | $3.56 |
| Growth (M7-12) | Paid acquisition | $15.43 |
| Scale (M13-24) | Scaled marketing | $18.57 |
| **Blended** | All phases | **$12-15** |

### LTV/CAC Ratio

**Target:** 3:1 (industry standard for healthy SaaS)

| Scenario | LTV | CAC | Ratio | Status |
|----------|-----|-----|-------|--------|
| Base case | $67 | $15 | 4.47:1 | ✅ Excellent |
| Conservative | $55 | $15 | 3.67:1 | ✅ Good |
| Higher CAC | $67 | $22 | 3.05:1 | ✅ Acceptable |
| Worst case | $55 | $22 | 2.50:1 | ⚠️ Marginal |

**Payback Period:** $15 / $3.99 = 3.8 months ✅

### Operating Costs

| Cost Category | Month 12 | Month 18 | Month 24 |
|---------------|----------|----------|----------|
| Infrastructure | $200 | $400 | $800 |
| AI API (<3% revenue) | $34 | $137 | $391 |
| Banking fees | $311 | $707 | $1,389 |
| Marketing | $2,500 | $5,000 | $7,000 |
| **Total** | **$3,045** | **$6,244** | **$9,580** |

### Profitability Timeline

| Month | MRR | Costs | Net | Margin |
|-------|-----|-------|-----|--------|
| 12 | $1,129 | $3,045 | -$1,916 | -170% |
| 18 | $6,566 | $6,244 | +$322 | +5% |
| 21 | $9,842 | $7,912 | +$1,930 | +20% |
| 24 | $13,039 | $9,580 | +$3,459 | +27% |

---

## 6. Competitive Landscape

### Market Categories

**Category 1: Habit Trackers (No Real Money)**
| App | Model | Weakness vs Flux |
|-----|-------|------------------|
| Habitica | RPG gamification, virtual rewards | No real stakes |
| Streaks | Streak tracking, minimal UI | No financial incentive |
| Strides | Basic stats and tracking | No financial incentive |

**Category 2: Penalty Apps (Lose Money)**
| App | Model | Weakness vs Flux |
|-----|-------|------------------|
| Beeminder | Pledge money, lose if you fail | Punishment psychology, high stress, 40-60% quit |
| StickK | Commitment contracts | Same - loss aversion unsustainable |

**Category 3: Passive Savings (Spending Triggers)**
| App | Model | Weakness vs Flux |
|-----|-------|------------------|
| Acorns | Round-ups, passive transfers | No habit tracking, reactive not active |
| Qapital | Spending rules trigger saves | Rules-based, not habit-based |

**Category 4: Fitness Rewards (Company Pays)**
| App | Model | Weakness vs Flux |
|-----|-------|------------------|
| Evidation | Company pays for health data | Fitness only, not scalable business model |
| Sweatcoin | Pays for steps | Limited to walking, low payouts |

### Feature Comparison Matrix

| Feature | Flux | Habitica | Beeminder | Acorns | Qapital |
|---------|------|----------|-----------|--------|---------|
| Real Money Movement | ✅ Self-funded | ❌ Virtual | ⚠️ Lose stakes | ✅ Passive | ✅ Passive |
| Active Habit Triggers | ✅ Yes | ✅ Yes | ✅ Yes | ❌ Spending | ⚠️ Rules |
| Any Habit Type | ✅ Yes | ✅ Yes | ✅ Yes | ❌ N/A | ⚠️ Limited |
| Pattern Recognition | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |
| Quality Scoring | ✅ Flux Score | ⚠️ Basic XP | ❌ No | ❌ No | ❌ No |
| Behavioral Indices | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |
| Savings Goals | ✅ Habit→Goal | ❌ No | ❌ No | ⚠️ Generic | ✅ Yes |
| FDIC Account | ✅ Stripe Treasury | ❌ No | ❌ No | ✅ Yes | ✅ Yes |
| Positive Psychology | ✅ Earn | ⚠️ Gamified | ❌ Punish | ✅ Passive | ✅ Passive |

### The Market Gap

**No competitor occupies this intersection:**
- Active habit-triggered transfers (not passive spending rules)
- Positive psychology (earn not lose)
- Pattern recognition (not schedule enforcement)
- Sophisticated quality scoring (not just streaks)
- Behavioral indices (comparative data)
- Savings goal allocation (habit → financial objective)

---

## 7. Market Positioning

### Positioning Statement

"We're building Morningstar for habits - clean, thoughtful behavioral analysis with a long-term investment perspective. Not dense real-time data, but accessible insights that show you who you're becoming."

### What Flux IS

1. Premium habit tracker with real financial incentives
2. Investment portfolio interface for personal development
3. Authoritative behavioral indices showing performance benchmarks
4. Data infrastructure provider for behavioral science

### What Flux is NOT

1. A prediction market platform
2. A social network
3. A trading platform
4. Another gamified todo app
5. A punishment-based commitment device

### Target Users

**Primary:** Young professionals (25-40) who:
- Take personal development seriously
- Have disposable income for savings
- Prefer professional aesthetics over gamification
- Are data-driven decision makers
- Have tried and abandoned other habit apps

**Secondary:** Anyone seeking:
- Real accountability (not just tracking)
- Financial motivation for behavior change
- Understanding of their actual patterns
- Comparison to aggregate benchmarks

### Positioning Evolution

| Phase | Message |
|-------|---------|
| Phase 1-3 (Validation) | "Invest in yourself, literally" |
| Phase 4-6 (Indices) | "Track your habits vs behavioral indices" |
| Phase 7+ (Authority) | "The authoritative source for behavioral performance data" |

---

## 8. Key Partnerships

### Banking & Financial Infrastructure

| Partner | Role |
|---------|------|
| Stripe Treasury | Banking-as-a-Service, FDIC-insured accounts, fund custody |
| Plaid | Secure bank account connectivity for linking external accounts |
| Stripe | Transfer processing |

### Development & Technical

| Partner | Role |
|---------|------|
| Atomic Object | Development partner for discovery and build phases |
| Anthropic | AI integration (Claude API) |

### Platform & Infrastructure

| Partner | Role |
|---------|------|
| Supabase | Backend, database, API |
| Apple App Store | iOS distribution |
| Google Play Store | Android distribution |
| Vercel | Web hosting (current prototype) |

### Future Data Licensing Partners

- Insurance companies (behavioral risk assessment)
- Corporate wellness programs (employee engagement)
- Research institutions (behavioral science studies)
- Healthcare providers (preventive care metrics)

---

## 9. Success Metrics

### Phase 3: Validation (Week 16)

| Metric | Target |
|--------|--------|
| Active users | 50+ |
| Week 4 retention | 60%+ |
| Logs per user per week | 15+ |
| Clear category winners identified | Yes |

### Phase 5: Growth (Month 9-12)

| Metric | Target |
|--------|--------|
| Active users | 500+ |
| Retention | 75%+ |
| Premium conversion | 50%+ |
| Data partnership conversations | 3+ |

### Phase 7: Authority (Month 13-18)

| Metric | Target |
|--------|--------|
| Active users | 2,000+ |
| Academic/media citation | 1+ |
| Monthly data licensing revenue | $2,000+ |
| Third parties referencing Flux indices | Yes |

---

## 10. Product-Market Fit

### The Problem We're Solving

**Why habit trackers fail:**
- Virtual rewards feel hollow (no real stakes)
- Streak-based systems create anxiety and guilt
- Rigid schedules punish real life
- Form fatigue kills motivation
- No meaningful insight into actual patterns

**What users actually need:**
- Real consequences for behavior (positive, not punitive)
- Forgiveness when life happens
- Understanding of their actual patterns vs. aspirational goals
- Tangible progress toward meaningful objectives

### Core Hypotheses

**Hypothesis 1: Monetary Reinforcement**
> Users who transfer real money based on habit completion will maintain habits longer than users with virtual rewards or no rewards.

*Validation:* Compare Week 4 and Week 12 retention against industry benchmarks (typically 10-20% for habit apps). Target: 60%+ retention.

**Hypothesis 2: Pattern Recognition > Schedules**
> Users prefer an app that learns their natural patterns over one that enforces rigid schedules they set during optimistic moments.

*Validation:* User feedback, NPS scores, qualitative interviews. Do users mention "no guilt" or "forgiving" as value props?

**Hypothesis 3: Financial Goals Create Stickiness**
> Linking habits to specific savings goals (vacation fund, emergency savings) increases engagement vs. generic "earn money" framing.

*Validation:* Compare engagement metrics between users with linked goals vs. those without.

**Hypothesis 4: Behavioral Indices Provide Value**
> Users find comparative performance data ("Top 15% of runners on Flux") motivating rather than discouraging.

*Validation:* Opt-in rates for indices, engagement with indices screens, user feedback.

### Target Customer Profile

**Primary Persona: "The Intentional Optimizer"**

Demographics:
- Age 25-40
- Professional with disposable income
- Has tried 2+ habit apps before and abandoned them
- Values data and self-improvement
- Prefers clean, professional design over gamification

Psychographics:
- Believes in investing in themselves
- Frustrated by apps that feel childish or gimmicky
- Wants accountability without shame
- Interested in understanding their actual patterns
- Motivated by tangible progress toward real goals

**Job to Be Done:**
"Help me actually stick to habits I care about by creating real stakes and showing me honest data about my patterns - without making me feel guilty when life gets in the way."

### What Product-Market Fit Looks Like

**Leading Indicators (Weeks 4-16):**
- Week 4 retention > 60%
- Users logging 15+ times per week
- Organic word-of-mouth signups (users referring friends)
- Users asking for features (not just reporting bugs)
- Qualitative feedback: "This is different" or "Finally something that works"

**Lagging Indicators (Months 6-12):**
- Premium conversion > 40%
- Week 12 retention > 50%
- NPS score > 40
- Users mentioning Flux unprompted in surveys/interviews
- Data partnership interest from external parties

**The "Hair on Fire" Test:**
PMF exists when users would be genuinely disappointed if Flux disappeared - not just "that's too bad" but "how will I track this now?"

### Key Assumptions to Validate

| Assumption | How We Test | Kill Criteria |
|------------|-------------|---------------|
| Users want real money stakes | Beta feedback, conversion rates | <30% express interest in real transfers |
| Pattern recognition resonates | User interviews, feature usage | Users request schedule features back |
| Curated library is sufficient | Feature requests, drop-off | >50% request custom habits in Month 1 |
| $3.99 price point converts | A/B testing, conversion | <30% conversion at any price |
| Weekly transfers feel right | User feedback | Strong preference for different cadence |

### Decision Gates

**Gate 1: Week 8 (Early Signal)**
- Minimum: 30 active users, 50% Week 4 retention
- If miss: Diagnose and iterate, don't proceed to banking integration
- If hit: Continue to Gate 2

**Gate 2: Week 16 (Validation)**
- Minimum: 50 active users, 60% Week 4 retention, clear qualitative signal
- If miss: Major pivot or wind down
- If hit: Proceed to real money integration, raise additional capital

**Gate 3: Month 9 (Growth)**
- Minimum: 200 active users, 50% premium conversion
- If miss: Reassess pricing, features, or target market
- If hit: Scale marketing, pursue data partnerships

### What We're NOT Testing (Yet)

- Optimal Flux Score algorithm weights
- Best 15 habits for library (will iterate)
- Ideal AI coaching triggers
- Data licensing pricing
- Enterprise features

These are optimization problems. First prove the core value proposition works.

---

## 11. Risk Factors

### Business Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Users don't engage (validation fails) | Medium | Strong decision gates, pivot early if metrics miss |
| Conversion below 40% | Medium | A/B test pricing, strengthen onboarding |
| Retention below 55% at Week 4 | Medium | Focus on pattern recognition value, reduce friction |
| Data licensing delays | Medium | Focus on subscription revenue first |

### Technical Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Banking integration complexity | Medium | Stripe Treasury reduces complexity vs. building proprietary |
| Data quality gaming | Medium | Multi-layer prevention, reputation scoring, anomaly detection |
| AI API costs exceed projections | Low | Monitor closely, optimize prompts, cap usage if needed |

### Market Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Big tech enters market | Low | Speed to market, financial moat, data network effects |
| Competitor copies model | Medium | First-mover advantage, pattern recognition hard to retrofit |
| Regulatory issues with money transfers | Low | Legal consultation before Phase 6, proper compliance |

### Financial Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| CAC exceeds $25 | Low | Start organic, monitor paid channels closely |
| Profitability delayed past Month 24 | Medium | Control marketing spend, focus on retention over acquisition |

---

## Appendix: Key Business Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| $3.99/month pricing | Balance conversion volume with revenue; undercut competitors | Nov 2025 |
| Unlimited habits on free tier | Real differentiation is financial accountability, not limits | Nov 2025 |
| Stripe Treasury over proprietary banking | Lower complexity, faster launch, FDIC included | Nov 2025 |
| Pattern recognition over schedules | Better data quality, better UX, unique positioning | Dec 2025 |
| Behavior-level indices (not categories) | More meaningful comparisons, requires minimum users per behavior | Dec 2025 |
| Curated 15-habit library for MVT | Ensures index data quality, simplifies scope | Dec 2025 |

---

*Flux Technologies LLC | December 2025*
