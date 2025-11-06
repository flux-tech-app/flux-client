# Flux - Long-Term Roadmap v3.1
**Timeline:** 12-18 months to full vision
**Approach:** Validate core, then scale intelligently

---

## OVERVIEW

**Mission:** "Invest in yourself, literally"
- Behavior change platform with real financial rewards
- Smart assistance, not autonomous automation
- Build wealth through better habits

**Phases:**
1. ✅ POC Polish + Basic Habit Health (Weeks 1-4)
2. Backend + Authentication (Weeks 5-7)
3. Family Testing & Validation (Weeks 8-14)
4. Advanced Habit Intelligence - HSS System (Months 4-5)
5. Smart Assistance - Plaid Integration (Months 5-7)
6. Real Money - Stripe Integration (Months 7-9)
7. Health Devices - Auto-Tracking (Months 9-11)
8. Behavior Markets - Collective Intelligence (Months 12-18)

---

## PHASE 1: POC POLISH + BASIC HABIT HEALTH ✓

**Status:** In Progress  
**Timeline:** Weeks 1-4  
**Goal:** Family-test ready with foundational habit health tracking

### Features
- Manual habit tracking (existing)
- Variable rate system (existing)
- Virtual balance tracking (existing)
- **NEW: Basic scheduling system**
  - Daily, weekdays, custom days, X times per week
- **NEW: Performance metrics**
  - Completion rate (completed/scheduled)
  - Trend arrows (↑ improving, → stable, ↓ declining)
  - Current streak
  - Portfolio health summary
- Responsive mobile design
- Savings page with charts

### Success Criteria
- [ ] Works smoothly on all devices
- [ ] Scheduling is intuitive
- [ ] Performance metrics are clear
- [ ] Ready for family testing

---

## PHASE 2: BACKEND + AUTHENTICATION

**Timeline:** Weeks 5-7  
**Goal:** Cloud storage, multi-device access, user accounts

### Technical Stack
**Recommended:** Supabase (PostgreSQL + Auth + Real-time)
- Built-in authentication
- PostgreSQL database
- Real-time subscriptions
- Row-level security
- Free tier: 500MB storage, 50k monthly active users

**Alternative:** Railway (if more control needed)

### Database Schema

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  settings JSONB
);

-- Habits
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(10) NOT NULL, -- 'building' or 'breaking'
  rate_type VARCHAR(20) NOT NULL, -- 'flat', 'per-minute', etc.
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(50),
  schedule JSONB NOT NULL, -- {type: 'daily', days: [1,2,3], frequency: 4}
  created_at TIMESTAMP DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

-- Logs
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME,
  value DECIMAL(10,2),
  type VARCHAR(20) NOT NULL, -- 'completed', 'failed', 'skipped'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_logs_habit_date ON logs(habit_id, date DESC);
CREATE INDEX idx_logs_user_date ON logs(user_id, date DESC);
CREATE INDEX idx_habits_user ON habits(user_id);
```

### Authentication Features
- Email/password signup
- Social login (Google, Apple)
- Password reset
- Email verification
- Session management
- Protected routes

### Migration Strategy
- Build localStorage → cloud migration tool
- One-time export/import
- Keep offline mode as fallback
- Sync on app load

### Timeline
- Week 1: Database setup, schema design
- Week 2: Authentication implementation
- Week 3: API routes, migration tool, testing

**Cost:** $5-10/month (Supabase Pro if needed)

---

## PHASE 3: FAMILY TESTING & VALIDATION

**Timeline:** Weeks 8-14 (4-6 weeks of active testing)  
**Goal:** Validate core engagement with real users

### Testing Plan
- 10 family members
- Mix of ages and tech comfort levels
- Real daily usage
- Weekly feedback sessions

### What We're Testing
1. **Core engagement:** Do people log habits consistently?
2. **Value proposition:** Does the money metaphor resonate?
3. **Performance metrics:** Do people check completion rates and trends?
4. **Scheduling:** Is it flexible enough? Too rigid?
5. **Portfolio view:** Does the investment aesthetic work?

### Success Metrics

**Must Hit (70%+ retention after 4 weeks):**
- 5+ logs per user per week
- 3+ active habits per user
- Growing virtual balance (not declining)
- Positive feedback on habit health metrics

**Nice to Have:**
- Users asking "when can I make this real?"
- Feature requests that show deep engagement
- Stories of actual behavior change
- Users inviting friends

### Data Collection
- Usage analytics (logs per day, retention curve)
- Weekly surveys
- Bi-weekly interviews
- App usage patterns
- Feature request tracking

### Decision Points

**If Strong Validation:**
→ Proceed to Phase 4 (Advanced Intelligence - HSS)
→ Users want deeper insights
→ Investment metaphor working

**If Moderate Validation:**
→ Iterate based on feedback
→ Fix UX pain points
→ Test again

**If Weak Validation:**
→ Deep dive: Why didn't it work?
→ Pivot or shelve

---

## PHASE 4: ADVANCED HABIT INTELLIGENCE - HSS

**Timeline:** Months 4-5 (4-6 weeks)  
**Goal:** Sophisticated behavior measurement system  
**Prerequisites:** Phase 3 validation shows users want deeper insights

### Full HSS (Habit Strength Score) System

**Comprehensive scoring algorithm:**
- Scheduled Completion (50%) - are you hitting your commitments?
- Momentum (25%) - improving or declining?
- Legacy Bonus (15%) - long-term achievement
- Consistency (5%) - reliable patterns
- Active Streak (5%) - current run

**Range:** 0.00 - 100.00 (decimal precision)

### Score Distribution Philosophy
- 90-100: Elite (top 5%) - 6+ months of excellence
- 80-89: Excellent (top 20%) - very strong habit
- 70-79: Good (top 40%) - solid and reliable
- 60-69: Developing (middle 30%) - making progress
- 50-59: Struggling (bottom 20%) - inconsistent
- <50: Crisis (bottom 10%) - needs intervention

### Technical Implementation

**New Data Fields:**
```javascript
habit: {
  // existing fields...
  stats: {
    currentStreak: 45,
    longestStreak: 120,
    totalCompletions: 347,
    allTimeHighHSS: 94.3,
    daysAbove80HSS: 67
  }
}

log: {
  // existing fields...
  status: "completed" | "partial" | "failed",
  target: 30, // for threshold-based habits
  achieved: 25,
  hssImpact: -3.2, // how this log affected HSS
  hssAfter: 72.5 // HSS after this log
}
```

### Features

**HSS Calculation Engine:**
- Real-time recalculation on new logs
- Historical recalculation for schedule changes
- Threshold system for non-flat habits
- Grace period handling (2 per month)
- Streak break recovery system (15% hit, not catastrophic)

**Intelligence Layer:**
- Auto-generated insights
  - "Your 'Resist DoorDash' HSS dropped 8 points this week"
  - "Strong week! Your cardio HSS is up 12%"
  - "3 days away from maxing your streak bonus"
- Decline detection and alerts
- Milestone notifications
- Pattern recognition

**Enhanced Portfolio View:**
- HSS-based habit rankings
- Top performers section
- "Needs attention" habits (declining)
- Category performance analysis
- HSS history charts per habit
- Detailed breakdown (tap card → see all 5 components)

**Display Updates:**
```
Habit Card:
┌─────────────────────────────────┐
│ Morning Run                     │
│                                 │
│ HSS: 78.45         +2.13 ▲      │
│ (+2.8%)                         │
│                                 │
│ Total Earned: $1,247            │
│ [30-day sparkline]              │
│                                 │
│ 45-day streak                   │
└─────────────────────────────────┘

Expanded View:
- Scheduled Completion: 27/30 ★★★★☆
- Momentum: 18/20 ★★★★★
- Legacy Bonus: 8/15 ★★★★☆
- Consistency: 4/5 ★★★★☆
- Streak: 4/5 ★★★★☆
```

### Why Phase 4 (Not Phase 1)

**Requires validation first:**
- Users must prove they'll use basic metrics
- Need usage data to tune the algorithm
- Complex system only valuable if core engagement exists
- 4-6 weeks of development - can't risk pre-validation

**Post-validation benefits:**
- Know users want depth
- Have real data to inform scoring
- Can A/B test components
- Users trust the system more

### Timeline
- Week 1-2: Build calculation engine, test all edge cases
- Week 3-4: UI updates, charts, breakdowns
- Week 5: Intelligence layer (insights, alerts)
- Week 6: Polish, beta test with family

**Cost:** Development time only (no new services)

---

## PHASE 5: SMART ASSISTANCE - PLAID INTEGRATION

**Timeline:** Months 5-7 (6-8 weeks)  
**Goal:** Pattern learning + contextual check-ins  
**Prerequisites:** Backend (Phase 2) + HSS (Phase 4)

### Bank Connection (Read-Only)

**Plaid Integration:**
- Connect bank accounts securely
- Read transaction history (read-only, no money movement)
- Pattern detection engine
- Historical spending analysis

**What It Learns:**
- "You order DoorDash 3x/week on Tue/Thu/Sat around 7pm"
- "You spend $150/week on food delivery"
- "FanDuel deposits are every Friday night"
- "Starbucks twice daily, weekday mornings"

### Smart Check-Ins

**Context-Aware Prompts:**
- Time-based: "It's Thursday 7pm - your usual DoorDash time. Resisted today?"
- Transaction-triggered: "$35 DoorDash detected - log this spend?"
- Pattern-based: "You haven't ordered delivery in 5 days - nice streak!"

**Weekly Recap:**
- "You resisted DoorDash 4x this week - log these?"
- "Detected 2 Starbucks purchases - want to track?"
- "Your resistance pattern is stronger this month!"

**Non-Judgmental Framing:**
- Never: "You failed by ordering DoorDash"
- Always: "Want to log this so we can track progress?"
- Focus on awareness, not shame

### Technical Implementation

**Pattern Detection Engine:**
```javascript
patterns: {
  vendor: "DoorDash",
  frequency: "3x per week",
  days: ["Tuesday", "Thursday", "Saturday"],
  timeWindow: "6:00 PM - 8:00 PM",
  averageAmount: 35,
  confidence: 0.87
}
```

**Smart Prompt Logic:**
- Check patterns against current time
- Send notification at high-probability moment
- User can confirm/dismiss
- Learns from responses

**Privacy & Control:**
- User controls which accounts to monitor
- Can disable specific vendors
- Can pause notifications
- Full transaction history never stored permanently (just patterns)

### Compliance & Security
- Plaid handles bank connection (PCI compliant)
- We only read transactions, never move money
- No storage of sensitive financial data
- User can disconnect anytime

### Timeline
- Week 1-2: Plaid integration, authentication flow
- Week 3-4: Transaction ingestion, pattern detection
- Week 5-6: Notification system, smart prompts
- Week 7-8: Testing, refinement, privacy controls

**Cost:** $10-30/month (Plaid fees based on usage)

---

## PHASE 6: REAL MONEY - STRIPE INTEGRATION

**Timeline:** Months 7-9 (4-6 weeks)  
**Goal:** Convert virtual savings to real money  
**Prerequisites:** All previous phases + regulatory research

### In-App Savings Account

**Stripe Treasury or Similar:**
- FDIC-insured savings account
- Real money transfers
- User balance grows with habits
- Withdrawal system

### Money Movement

**Funding:**
- User deposits initial "stake" ($50-200)
- Or sets up auto-funding from checking

**Earning:**
- Virtual balance converts to real balance
- User sees actual dollars accumulate
- Can withdraw anytime

**Withdrawal:**
- Transfer to external bank account
- Minimum withdrawal: $25
- 1-3 day processing
- Transaction history

### Compliance & Legal

**Required:**
- Terms of service (lawyer review)
- Privacy policy
- Financial disclosures
- State-by-state compliance check
- Anti-money laundering (AML) basics

**Stripe Requirements:**
- Business verification
- Tax documentation (1099s if needed)
- Customer identity verification (KYC)

### Psychological Shift

**Virtual → Real Changes Everything:**
- Higher stakes = more motivation
- But also: more anxiety about failure
- Need to balance reward with pressure
- May need to cap daily losses

**Example Caps:**
- Max loss per day: $10
- Weekly loss cap: $30
- Prevents catastrophic weeks

### Timeline
- Week 1-2: Legal consultation, compliance research
- Week 3-4: Stripe integration, account setup
- Week 5: Transfer system, withdrawal flow
- Week 6: Testing, security audit

**Cost:** 
- Stripe fees (2.9% + 30¢ per transaction)
- Legal consultation ($500-1500 one-time)
- Ongoing compliance monitoring

---

## PHASE 7: HEALTH DEVICE INTEGRATION

**Timeline:** Months 9-11 (3-4 weeks per device)  
**Goal:** Automatic habit tracking via wearables  
**Prerequisites:** Strong engagement, user requests

### Supported Devices

**Priority 1:**
- Apple Health (iOS) - Free
- Google Fit (Android) - Free
- Oura Ring - Premium market
- Whoop - Fitness enthusiasts

**Priority 2:**
- Fitbit
- Garmin
- Apple Watch native

### Auto-Detection

**What Can Be Detected:**
- Exercise (heart rate elevated 30+ min)
- Sleep (quality score meets threshold)
- Steps (daily goal reached)
- Calories burned
- Active minutes

**What Can't Be Detected:**
- Resistance behaviors (can't detect what didn't happen)
- Meditation (unless app-tracked)
- Diet (requires manual log)
- Spending resistance (still needs Plaid)

### User Experience

**Detection Flow:**
1. Device detects workout (heart rate data)
2. App sends notification: "Workout detected - 35 min cardio. Log this?"
3. User confirms or dismisses
4. If confirmed: Log created, money earned, HSS updated

**Manual Override:**
- User can always edit or delete auto-logs
- Can disable auto-detection per habit
- Prevents incorrect detections

### Technical Implementation

**API Integrations:**
- Apple HealthKit (iOS native)
- Google Fit API
- Oura Cloud API
- Whoop API

**Data Sync:**
- Background sync every hour
- Push notifications when detection occurs
- Battery-efficient polling

### Timeline (Per Device)
- Week 1: API integration, authentication
- Week 2: Data parsing, detection logic
- Week 3: Notification system, user controls
- Week 4: Testing, refinement

**Cost:** 
- Apple Health / Google Fit: Free
- Oura Ring: Free API access (user must own ring ~$300)
- Whoop: Free API access (user must have subscription ~$30/month)

---

## PHASE 8: BEHAVIOR MARKETS

**Timeline:** Months 12-18 (8-12 weeks)  
**Goal:** Collective behavior intelligence, social proof  
**Prerequisites:** Large user base (500+ users), HSS proven

### Concept

**Individual habits aggregate into category tickers:**
- EXRC (Exercise) - all workout habits
- VICE (Vice Resistance) - resisting bad habits
- DIET (Nutrition) - healthy eating
- SAVE (Financial Discipline) - resisting spending
- MIND (Mental Health) - meditation, therapy
- SLEP (Sleep) - sleep improvement
- PROD (Productivity) - focus, deep work
- SOCI (Social) - relationships, connection

### Two-Tier System

**Personal Tier (Custom Rates):**
- User sets own reward rates
- $5-100 per completion
- Affects only personal balance
- Maximum motivation flexibility

**Market Tier (Standard Rates):**
- Fixed rates for market calculation
- Standardized across all users
- Fair comparison and aggregation
- User's custom rate doesn't affect market

**Example:**
```
User logs: "Resisted DoorDash"
→ Personal balance: +$50 (their custom rate)
→ VICE market: +1 completion at $35 (standard rate)
→ Market volume: +1
→ Market price recalculates
```

### Market Metrics

**Category Price Calculation:**
```
Price = Total standard earnings (30 days) / Active users in category
Active user = Logged that category ≥1x in last 30 days

Example:
EXRC category: 10,000 active users
Collectively earned $500,000 (standard rates)
EXRC Price: $50.00
```

**Additional Metrics:**
- **Market Cap:** Total $ earned all-time in category
- **Volume:** Total completions in last 24hr
- **Trend:** % change daily/weekly/monthly
- **Volatility:** Price fluctuation magnitude
- **52-Week High/Low:** Historical context

### Personal Performance Metrics

**Portfolio Analytics:**
- Your Returns: Total earned in this category
- Your Position: Percentile rank ("Top 10% of EXRC investors")
- Your Average: Your $/completion vs market price
- Your Exposure: % of portfolio in each category
- Your Performance: "Outperforming EXRC market by 12%"

### In-App Experience

**New "Markets" Tab:**
```
┌─────────────────────────────────┐
│ BEHAVIOR MARKETS                │
│                                 │
│ EXRC   $52.43  +2.1% ↑  Vol: 847│
│ VICE   $48.20  -1.3% ↓  Vol: 423│
│ SAVE   $45.18  +0.8% ↑  Vol: 612│
│ DIET   $38.90  +3.2% ↑  Vol: 534│
│ MIND   $31.45  -0.4% ↓  Vol: 289│
│                                 │
│ Your Portfolio:                 │
│ 40% EXRC | 30% SAVE | 20% DIET  │
│ Outperforming market: +8.4%     │
└─────────────────────────────────┘
```

**Category Detail View:**
- Price history chart (30/90/365 days)
- Volume trends
- Top performers (anonymous leaderboard)
- Your rank and performance
- Insights: "SAVE is trending - consider adding savings habit"

### Valuable Insights

**Societal Behavior Data:**
- Which behaviors are thriving collectively?
- What time of year do people exercise most?
- Economic indicators (SAVE category during recessions)
- Public health insights (MIND category trends)

**Potential Value:**
- Bloomberg Terminal for behavior
- Research data (anonymized, aggregated)
- Public health monitoring
- Trend forecasting

### Technical Implementation

**Data Aggregation:**
- Nightly calculation of category prices
- Real-time volume tracking
- Historical price storage
- Percentile ranking calculations

**Privacy:**
- All data aggregated and anonymized
- Individual logs never visible
- Only category-level statistics
- User can opt-out of market contribution

**Scalability:**
- Requires database optimization
- Caching for market prices
- Background jobs for calculations
- CDN for chart data

### Timeline
- Week 1-3: Two-tier system implementation
- Week 4-6: Market calculation engine
- Week 7-9: Markets tab UI, charts
- Week 10-12: Testing, optimization, polish

**Prerequisites:**
- 500+ active users (for meaningful market data)
- HSS proven and trusted
- Strong engagement with portfolio view

---

## ADDITIONAL FUTURE PHASES

### Phase 9: Change Partner Personas (Months 15-18)

**Concept:** Personalized advisor systems with different tones

**Personas:**
- Tough Love Coach - direct, achievement-focused
- Supportive Friend - warm, empathetic
- Financial Advisor - data-driven, ROI-focused
- Wellness Guide - health-first, gentle

**Implementation:**
- Onboarding questionnaire
- Adaptive language in notifications
- Visual theme per persona
- Tailored insights and recommendations

**Timeline:** 4-6 weeks

### Phase 10: External Routing (Months 18-24)

**Concept:** Route earnings to real investment/savings accounts

**Integrations:**
- Coinbase (crypto)
- Schwab (stocks)
- Marcus (high-yield savings)
- Charity: Water (donations)

**User Sets Rules:**
- "Send 'Skip Starbucks' → Coinbase automatically"
- "Route 'Resisted FanDuel' → Charity"
- "Morning Cardio → Schwab investment account"

**Partnerships:**
- Revenue share with platforms
- Affiliate commissions
- Earn $25-100 per referral

**Timeline:** 6-8 weeks per integration

---

## TECHNICAL ARCHITECTURE (Full System)

```
┌─────────────────────────────────┐
│   React App (Web + Mobile)     │
│   - TodayPage (habit tracking)  │
│   - SavingsPage (portfolio)     │
│   - MarketsPage (behavior data) │
│   - CalendarPage, History       │
└─────────────────────────────────┘
         ↓ ↑ (REST API / Supabase)
┌─────────────────────────────────┐
│   Node.js Backend (Express)     │
│   - Authentication (JWT)        │
│   - Habit CRUD APIs             │
│   - HSS calculation engine      │
│   - Pattern detection           │
│   - Market aggregation          │
└─────────────────────────────────┘
         ↓ ↑
┌─────────────────────────────────┐
│   PostgreSQL Database           │
│   - Users, habits, logs         │
│   - HSS stats, market data      │
│   - Patterns, notifications     │
└─────────────────────────────────┘
         ↓ ↑
┌─────────────────────────────────┐
│   External Services             │
│   - Plaid (bank connections)    │
│   - Stripe (real money)         │
│   - Oura, Whoop (health data)   │
│   - Push notifications          │
└─────────────────────────────────┘
```

---

## COST BREAKDOWN (Monthly)

**Phase 1-3 (POC):**
- Hosting: $0-5 (free tiers)
- Domain: $1/month
- **Total: ~$5/month**

**Phase 4-5 (Backend + HSS):**
- Supabase: $25/month (Pro tier)
- Plaid: $10-30/month (based on users)
- **Total: ~$50/month**

**Phase 6-7 (Real Money + Devices):**
- Stripe fees: 2.9% of transactions
- Supabase: $25/month
- Plaid: $30/month
- Push notifications: $10/month
- **Total: ~$100/month + transaction fees**

**Phase 8 (Markets):**
- Database scaling: $50-100/month
- CDN: $10/month
- Analytics: $20/month
- **Total: ~$200/month**

**At Scale (10,000 users):**
- Infrastructure: $500-1000/month
- Plaid: $500/month
- Support tools: $100/month
- **Total: ~$1500/month**

---

## REVENUE MODEL (Future)

**Not needed for POC, but thinking ahead:**

**Option 1: Freemium**
- Free: 3 habits, basic features
- Premium: $5-10/month
  - Unlimited habits
  - HSS insights
  - Priority support
  - Advanced analytics

**Option 2: Real Money Commission**
- Free app
- Take 5-10% of real money earned
- Only pay when you succeed

**Option 3: Affiliate Revenue**
- Free app
- Revenue from routing partnerships
- Coinbase, Schwab, etc. pay per referral

**Option 4: Hybrid**
- Free basic app
- Premium features $5/month
- Affiliate revenue on top

---

## RISKS & MITIGATION

### Technical Risks
- **Risk:** HSS algorithm is too complex, has bugs
- **Mitigation:** Extensive testing, beta users, manual review
- **Risk:** Plaid API unreliable
- **Mitigation:** Retry logic, fallback to manual, clear error messages
- **Risk:** Security vulnerability
- **Mitigation:** Security audit, penetration testing, insurance

### Business Risks
- **Risk:** Users don't engage after initial excitement
- **Mitigation:** POC validation before heavy investment
- **Risk:** Real money creates liability issues
- **Mitigation:** Legal consultation, proper terms of service, insurance
- **Risk:** Competition from big tech
- **Mitigation:** Build defensible features (HSS, markets), community

### User Experience Risks
- **Risk:** HSS feels judgmental or punishing
- **Mitigation:** Positive framing, focus on improvement, recovery mechanics
- **Risk:** Notifications become annoying
- **Mitigation:** User controls, smart frequency, value-add only
- **Risk:** Too complex, users bounce
- **Mitigation:** Simple onboarding, progressive disclosure, help system

---

## SUCCESS METRICS (Long-Term)

**6 Months:**
- 100+ active users
- 75% monthly retention
- Avg 15 logs per user per week
- 5+ habits per user
- HSS trusted and used

**12 Months:**
- 500+ active users
- Real money movement: $10k+ per month
- Behavior markets live
- User stories: "Flux changed my life"
- Viral coefficient >0.5

**18 Months:**
- 2000+ active users
- Revenue: $5-10k/month
- Partnership with health/finance brand
- Media coverage
- Becoming a movement

---

## SUMMARY

**The Vision:**
Transform behavior change from abstract willpower into tangible financial investment. Make good habits profitable, bad habits costly. Create a Bloomberg Terminal for behavior intelligence.

**The Strategy:**
1. Validate core engagement (POC)
2. Add intelligence layer (HSS)
3. Enable smart assistance (Plaid)
4. Introduce real stakes (money)
5. Expand data sources (devices)
6. Create collective intelligence (markets)
7. Build ecosystem (personas, routing)

**The Timeline:**
- **Months 0-3:** POC validation
- **Months 4-6:** Intelligence + assistance
- **Months 7-9:** Real money
- **Months 10-12:** Health devices
- **Months 13-18:** Markets + ecosystem

**The Moat:**
- Sophisticated HSS algorithm (hard to replicate)
- Behavior market infrastructure (novel)
- Integrated financial/health/habit data (complex)
- Strong community and network effects

**The Risk:**
Only build sophisticated features AFTER validating core engagement. Otherwise you have an impressive system nobody uses.

**Next Step:**
Phase 1. Polish POC. Add basic habit health. Test with family. Validate before scaling.
