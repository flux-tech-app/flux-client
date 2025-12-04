# Flux POC Roadmap v3.1 - Indices Strategy
**Goal:** Build the Bloomberg Terminal for personal behavior  
**Timeline:** 12 months to data authority status  
**Approach:** Habit tracking excellence → Behavioral indices → Data licensing

**KEY CHANGE in v3.1:**  
Indices launched with "building it together" narrative - founding members build the dataset, unlock happens at flexible threshold (50-100 users based on engagement).

---

## STRATEGIC POSITIONING

**What Flux Is:**
- Premium habit tracking with real financial incentives
- Investment portfolio aesthetic for personal development
- Authoritative source for behavioral performance data

**What Flux Is NOT:**
- A prediction market platform (others can build that)
- A social network (comparative data, not social features)
- A trading platform (we provide indices, not trading)

**The Moat:**
Financial incentives → Higher data quality → Authoritative indices → Data licensing revenue

---

## PHASE 1: CORE EXCELLENCE (Weeks 1-4) ✅

**Status:** Complete  
**Goal:** Production-ready habit tracking with portfolio aesthetic

### Completed Features
- ✅ Manual habit tracking (build/resist mechanics)
- ✅ Variable rate system (flat, per-minute, per-rep, etc.)
- ✅ Virtual balance tracking with portfolio view
- ✅ Activity logging with duration tracking
- ✅ Mobile-first responsive design
- ✅ Clean investment-grade UI
- ✅ Pending transfer system (weekly Friday transfers)
- ✅ Inline habit editing
- ✅ Habit detail pages with Chart.js visualizations

### Current State
- Working prototype deployed on Vercel
- LocalStorage-based (sufficient for POC)
- iPhone 12 Pro optimized (390x844)
- GitHub version controlled

### NEW: Indices Placeholder (Add Before Phase 3 Testing)

**Add to main navigation:** "Indices" tab (or section)

**Placeholder screen shows:**
```
╔═══════════════════════════════════╗
║    BEHAVIORAL INDICES             ║
║      Coming Soon                  ║
╠═══════════════════════════════════╣
║                                   ║
║  The world's first real-time      ║
║  behavioral performance indices.  ║
║                                   ║
║  Track your habits against        ║
║  aggregated category data.        ║
║  See your percentile rankings.    ║
║                                   ║
║  ┌─────────────────────────────┐ ║
║  │ FOUNDING MEMBERS             │ ║
║  │                              │ ║
║  │        23 / 100              │ ║
║  │  [████████░░░░░░░░░░] 23%   │ ║
║  │                              │ ║
║  │ Unlock when we reach         │ ║
║  │ 100 founding members         │ ║
║  └─────────────────────────────┘ ║
║                                   ║
║  Categories launching:            ║
║  • BODY - Exercise, nutrition     ║
║  • MIND - Focus, meditation       ║
║  • MONEY - Saving, discipline     ║
║  • RELATIONS - Social connection  ║
║  • RECOVERY - Sleep, rest         ║
║  • PRODUCTIVITY - Deep work       ║
║                                   ║
║  You're an early member building  ║
║  something unprecedented.         ║
║                                   ║
╚═══════════════════════════════════╝
```

**Visual mockup below:**
```
[Screenshot/wireframe of what indices will look like]

EXERCISE INDEX
71.3%  ↑ +2.1%
[7-day trend sparkline]
You: 84th percentile
423 participants
```

**Implementation:**
- Simple static component for now
- User count can be hardcoded (update manually during testing)
- Links to this screen from portfolio page: "Coming Soon: See How You Rank →"
- During onboarding, show: "You're founding member #23"

---

## PHASE 2: BACKEND + AUTH (Weeks 5-8)

**Trigger:** 50+ users requesting multi-device access  
**Goal:** Cloud storage, user accounts, data persistence

### Technical Stack
**Recommended:** Supabase
- PostgreSQL database
- Built-in auth (email, Google, Apple)
- Real-time sync
- Row-level security
- Free tier: 500MB storage

### Database Schema (Indices-Ready)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  timezone VARCHAR(50),
  settings JSONB,
  data_sharing_consent BOOLEAN DEFAULT FALSE, -- for indices
  founding_member_number INTEGER -- assigned sequentially
);

-- Habits (with taxonomy for aggregation)
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(10) NOT NULL, -- 'build' or 'resist'
  
  -- Rate configuration
  rate_type VARCHAR(20) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  threshold INTEGER, -- for threshold-based rates
  
  -- CRITICAL: Standardized taxonomy for indices
  category VARCHAR(50) NOT NULL, -- 'exercise', 'nutrition', 'productivity', 'recovery', 'financial', 'social'
  subcategory VARCHAR(50), -- 'cardio', 'strength', 'meditation', etc.
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5), -- 1=easy, 5=hard
  
  schedule JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE,
  
  -- HSS tracking fields
  current_hss DECIMAL(5,2) CHECK (current_hss BETWEEN 0 AND 100),
  highest_hss DECIMAL(5,2),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  
  -- Indices metadata
  contributes_to_indices BOOLEAN DEFAULT TRUE
);

-- Logs (anonymization-ready)
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  date DATE NOT NULL,
  time TIME,
  
  -- Core data
  value DECIMAL(10,2), -- duration/reps/amount
  success BOOLEAN NOT NULL,
  
  -- HSS impact tracking
  hss_before DECIMAL(5,2),
  hss_after DECIMAL(5,2),
  hss_impact DECIMAL(5,2), -- change caused by this log
  
  -- Indices metadata (stored for aggregation)
  category VARCHAR(50) NOT NULL, -- denormalized for fast aggregation
  subcategory VARCHAR(50),
  difficulty INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Privacy: user_id encrypted at rest, never exposed in aggregations
  CONSTRAINT logs_date_habit_unique UNIQUE (habit_id, date)
);

-- Indices aggregations (calculated nightly)
CREATE TABLE category_indices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(50) NOT NULL,
  
  week_start DATE NOT NULL, -- ISO week
  
  total_attempts INTEGER NOT NULL,
  successful_completions INTEGER NOT NULL,
  success_rate DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
  
  participant_count INTEGER NOT NULL,
  avg_difficulty DECIMAL(3,2),
  
  trend_vs_last_week DECIMAL(5,4), -- +0.0321 = +3.21%
  
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT category_week_unique UNIQUE (category, week_start)
);

-- User percentiles (updated nightly)
CREATE TABLE user_category_percentiles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  
  week_start DATE NOT NULL,
  
  success_rate DECIMAL(5,4),
  percentile INTEGER CHECK (percentile BETWEEN 0 AND 100),
  
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, category, week_start)
);

-- Indexes for performance
CREATE INDEX idx_logs_category_date ON logs(category, date DESC);
CREATE INDEX idx_logs_user_date ON logs(user_id, date DESC);
CREATE INDEX idx_habits_category ON habits(category, subcategory);
CREATE INDEX idx_habits_hss ON habits(current_hss DESC);
CREATE INDEX idx_indices_category_week ON category_indices(category, week_start DESC);
```

### Migration Strategy
- Build localStorage → cloud migration tool
- Maintain offline-first architecture
- Sync on app launch
- Conflict resolution (last write wins)

### Privacy & Consent
- GDPR-compliant from day 1
- Clear data sharing consent on signup: "Help us build behavioral indices by contributing your anonymized data"
- User can opt-out of indices contribution anytime
- All aggregations anonymized
- Founding member status displayed if opted in

**Timeline:** 3-4 weeks  
**Cost:** $0-25/month (Supabase free → Pro)

---

## PHASE 3: VALIDATION (Weeks 9-16)

**Goal:** 50 real users, 60%+ retention, validate indices appeal  
**Gating:** Must pass validation gates to proceed

**KEY MESSAGING THROUGHOUT:**
- "You're a founding member" (numbered sequentially)
- "Help us build the world's first behavioral indices"
- "Unlock happens when we reach 100 members"
- Progress updates at milestones (25, 50, 75, 90, 95, 99)

### Testing Cohorts

**Cohort 1: Family/Friends (10 users, Week 9)**
- Close circle for initial feedback
- High-touch support
- Daily check-ins first week
- Explicitly frame as "founding member access"

**Cohort 2: Beta Expansion (20 users, Week 11)**
- Twitter/Reddit small launch
- Self-service onboarding
- Weekly surveys
- Messaging: "Limited founding member slots available"

**Cohort 3: Product Hunt Soft Launch (50+ users, Week 14)**
- Public launch
- Press kit ready
- Support systems in place
- Messaging: "Join the first 100 to build behavioral indices"

### Critical Metrics (Updated Weekly)

**MUST HIT to proceed:**
- ✅ 60%+ weekly retention (Week 4)
- ✅ 15+ habit logs per user per week
- ✅ 3+ active habits per user
- ✅ Growing virtual balance trend
- ✅ Clear category emergence (which habits stick?)

**NICE TO HAVE:**
- Users asking "when real money?"
- Organic referrals ("I want my friend to be a founding member too")
- Social media mentions
- Feature requests indicating deep engagement

### Data Collection

**Quantitative:**
- Daily active users (DAU)
- Weekly active users (WAU)
- Retention curve (D1, D7, D14, D30)
- Logs per user per day
- Habit creation vs abandonment
- Category distribution (which habits are most popular?)
- Session length
- Time to first log

**Qualitative:**
- Weekly user interviews (3-5 per week)
- In-app feedback form
- Exit surveys for churned users
- Feature request tracking
- Reddit/Twitter sentiment

### NEW: Indices Anticipation Testing

**Critical questions to validate:**

1. **Does the "coming soon" indices section feel like missing functionality or early access to something bigger?**
   - Expected: "I can't wait to see how I rank"
   - Red flag: "Why isn't this available yet?"

2. **Does seeing the founding member count make you want to invite others?**
   - Expected: "I told my friend to join so we can unlock it faster"
   - Red flag: "I don't care about the count"

3. **Would you stay engaged for 4-8 weeks waiting for indices to unlock?**
   - Expected: "Yes, I'm tracking my HSS in the meantime"
   - Red flag: "I'd probably stop using it"

4. **Does HSS + money alone keep you logging habits daily?**
   - Expected: "Yes, watching my scores improve is addictive"
   - Red flag: "Not really, I need more motivation"

5. **Does the founding member narrative resonate?**
   - Expected: "I feel like I'm part of building something"
   - Red flag: "Seems like a marketing gimmick"

### Category Analysis (Critical for Indices)

Track which habits show strongest:
- Creation rates (most added)
- Completion rates (most successful)
- Retention (least abandoned)
- Engagement (most frequent logs)

**Expected categories:**
- Exercise (cardio, strength, flexibility)
- Nutrition (meal prep, water, vegetables)
- Productivity (focus, deep work, planning)
- Recovery (sleep, meditation, rest)
- Financial (saving, budgeting, debt reduction)
- Social (relationships, networking, community)

### Decision Gates

**Gate 1 (Week 12): Continue or Pivot?**
- ✅ PASS: 30+ users, 50%+ retention, indices anticipation positive → Continue to Phase 4
- ⚠️ MODERATE: 30+ users, 30-50% retention → Iterate 4 weeks
- ❌ FAIL: <30 users or <30% retention → Deep analysis, consider pivot

**Gate 2 (Week 16): Launch Indices Now or Wait?**
- ✅ PASS: 50+ users, 60%+ retention → **Flexible threshold strategy activates**
- ⚠️ MODERATE: Iterate another 4 weeks
- ❌ FAIL: Reassess vision

**Flexible Threshold Strategy:**
- **If 50+ users with 60%+ retention and strong engagement:** Launch indices at 50 users
  - Rationale: Quality over quantity, momentum is strong
  - Messaging: "Founding members unlocked indices early through exceptional engagement"
  
- **If 50+ users but slower growth:** Wait for 100 users
  - Better data quality
  - Larger unlock event impact
  - Supplement with research benchmarks in the meantime

- **If growth is slow by Week 20:** Launch at 50 with research-based comparative data
  - Show "Research shows X%, you're at Y%"
  - Build real Flux indices as users join

**Timeline:** 8 weeks active testing  
**Cost:** $25/month (Supabase Pro)

---

## PHASE 4: HABIT INTELLIGENCE + INDICES (Weeks 17-24)

**Prerequisites:** ✅ Gate 2 passed, 50-100 engaged users  
**Goal:** Deep insights per user + comparative behavioral indices

### Part A: Enhanced Habit Strength Score (HSS) - Weeks 17-18

**Full HSS Implementation:**

HSS is a comprehensive score (0-100.00) that measures habit strength across five components:

**1. Scheduled Completion (50%)** - Most Important
```javascript
// Did you hit your scheduled days?
scheduledCompletion = completedDays / scheduledDays

// For 30-day period
// Scheduled 20 days, completed 17 = 85%
// Contributes: 0.85 * 50 = 42.5 points
```

**2. Momentum (25%)** - Are You Improving?
```javascript
// Compare recent 14 days vs previous 14 days
recentRate = completions_last_14_days / scheduled_last_14_days
previousRate = completions_prev_14_days / scheduled_prev_14_days

momentum = (recentRate - previousRate) * 100
// Capped at ±25 points

// Example: 85% recent vs 75% previous = +10% momentum
// Contributes: +2.5 points (10% of 25 max)
```

**3. Legacy Bonus (15%)** - Long-term Achievement
```javascript
// Rewards sustained excellence over months
daysOver80HSS = days where HSS >= 80
legacyBonus = min(15, daysOver80HSS / 30)

// 90 days over 80 HSS = 3 months
// Contributes: 15 points (maxed out)
```

**4. Consistency (5%)** - Reliable Patterns
```javascript
// Low standard deviation = consistent
standardDev = stdDev(last30CompletionRates)
consistency = max(0, 5 - standardDev)

// Very consistent = 5 points
// Erratic = 0-2 points
```

**5. Active Streak (5%)** - Current Run
```javascript
streakBonus = min(5, currentStreak / 10)

// 50 day streak = 5 points
// 10 day streak = 1 point
// 0 day streak = 0 points
```

**HSS Calculation:**
```javascript
HSS = scheduledCompletion(50) + 
      momentum(25) + 
      legacyBonus(15) + 
      consistency(5) + 
      activeStreak(5)

// Range: 0.00 to 100.00
```

**HSS Distribution Philosophy:**
- 90-100: Elite (top 5%) - 6+ months of excellence
- 80-89: Excellent (top 20%) - very strong habit
- 70-79: Good (top 40%) - solid and reliable
- 60-69: Developing (middle 30%) - making progress
- 50-59: Struggling (bottom 20%) - inconsistent
- <50: Crisis (bottom 10%) - needs intervention

**Recovery Mechanics:**
- Streak break = -15% hit to HSS (not catastrophic)
- Grace periods: 2 per month (scheduled days can be moved)
- Momentum component allows recovery within 14 days
- Long-term legacy protects from short-term setbacks

**UI Updates:**
- Show HSS prominently on habit cards
- Breakdown view shows component scores
- Historical HSS chart (30/60/90 day view)
- "HSS Impact: +2.3" shown on log confirmation
- All-time high HSS tracked and displayed

**Timeline:** 2 weeks for full HSS system

### Part B: Enhanced Habit Details - Weeks 19-20

**Individual Habit Page Enhancements:**
- HSS over time (line chart)
- Component breakdown (stacked bar or pie)
- Completion history (calendar heatmap)
- Earnings over time (existing, enhanced)
- Streak tracking with milestones
- Success rate by day of week
- Best/worst periods analysis
- Detailed statistics dashboard

**Chart.js Enhancements:**
- HSS trend line with annotations
- Component contribution over time
- Comparison: Your HSS vs Category Average (once indices live)

**Timeline:** 2 weeks

### Part C: Behavioral Indices Launch - Weeks 21-24

**THE BIG UNLOCK EVENT**

When threshold is reached (50 or 100 users):

**1. Email Announcement (Day of unlock):**
```
Subject: 🎉 You Did It - Behavioral Indices Are LIVE

Founding Member #23,

You helped build something unprecedented. Today, Flux becomes 
the world's first app with real-time behavioral indices.

See how you rank: [Link to Indices]

Your day-one snapshot:
- Exercise: 84th percentile
- Productivity: 62nd percentile  
- Financial: 91st percentile

You're not just tracking habits anymore. You're contributing 
to the authoritative source for behavioral performance data.

Thank you for being part of the first 100.

- Ryan
```

**2. In-App Celebration:**
- Confetti animation on first indices view
- "Founding Member - Unlocked Indices" badge
- Screenshot of day-one rankings ("Save your founding day rankings")

**3. Social Media Push:**
- Tweet: "🚨 Flux just launched the world's first behavioral indices with 100 founding members. Live data on exercise, productivity, financial discipline, and more."
- Product Hunt: "Flux - The Bloomberg Terminal for Personal Behavior"
- Press angle: Building it WITH the community, not just FOR them

**New "Indices" Tab Shows:**

```
╔═══════════════════════════════════╗
║    BEHAVIORAL INDICES             ║
║   "The Bloomberg of Habits"       ║
╠═══════════════════════════════════╣
║                                   ║
║  EXERCISE INDEX                   ║
║  71.3%  ↑ +2.1%                   ║
║  [7-day trend line]               ║
║  You: 84th percentile             ║
║  423 participants                 ║
║                                   ║
║  PRODUCTIVITY INDEX               ║
║  68.7%  ↑ +0.3%                   ║
║  [7-day trend line]               ║
║  You: 62nd percentile             ║
║  347 participants                 ║
║                                   ║
║  FINANCIAL INDEX                  ║
║  65.2%  ↓ -1.8%                   ║
║  [7-day trend line]               ║
║  You: 91st percentile             ║
║  289 participants                 ║
║                                   ║
║  [5-7 total indices]              ║
║                                   ║
║  📊 Week of Nov 8, 2025           ║
║  Updates every Friday 11pm ET     ║
║                                   ║
╚═══════════════════════════════════╝
```

**Index Calculation (Nightly Cron Job):**

```javascript
// Pseudocode for nightly aggregation
async function calculateWeeklyIndices() {
  const weekStart = getISOWeekStart();
  const categories = [
    'exercise', 
    'nutrition', 
    'productivity', 
    'recovery', 
    'financial', 
    'social'
  ];
  
  for (const category of categories) {
    // Get all logs for this category this week
    // Only from users who consented to data sharing
    const logs = await db.logs
      .where('category', category)
      .where('date', '>=', weekStart)
      .where('contributes_to_indices', true)
      .select();
    
    const totalAttempts = logs.length;
    const successfulCompletions = logs.filter(l => l.success).length;
    const successRate = successfulCompletions / totalAttempts;
    
    const participantCount = new Set(logs.map(l => l.user_id)).size;
    const avgDifficulty = average(logs.map(l => l.difficulty));
    
    // Get last week's success rate for trend
    const lastWeek = await db.category_indices
      .where('category', category)
      .where('week_start', weekStart - 7)
      .first();
    
    const trend = lastWeek 
      ? successRate - lastWeek.success_rate 
      : 0;
    
    // Store index
    await db.category_indices.insert({
      category,
      week_start: weekStart,
      total_attempts: totalAttempts,
      successful_completions: successfulCompletions,
      success_rate: successRate,
      participant_count: participantCount,
      avg_difficulty: avgDifficulty,
      trend_vs_last_week: trend
    });
    
    // Calculate user percentiles
    await calculateUserPercentiles(category, weekStart);
  }
}
```

**User Percentile Calculation:**

```javascript
async function calculateUserPercentiles(category, weekStart) {
  // Get all users' success rates for this category
  const userRates = await db.query(`
    SELECT 
      user_id,
      COUNT(*) FILTER (WHERE success = true) as successes,
      COUNT(*) as attempts,
      (COUNT(*) FILTER (WHERE success = true))::float / COUNT(*) as success_rate
    FROM logs
    WHERE category = $1
      AND date >= $2
      AND date < $3
      AND contributes_to_indices = true
    GROUP BY user_id
    HAVING COUNT(*) >= 3  -- minimum 3 logs to rank
  `, [category, weekStart, weekStart + 7]);
  
  // Sort and calculate percentiles
  const sorted = userRates.sort((a, b) => a.success_rate - b.success_rate);
  
  for (let i = 0; i < sorted.length; i++) {
    const percentile = Math.round((i / (sorted.length - 1)) * 100);
    
    await db.user_category_percentiles.upsert({
      user_id: sorted[i].user_id,
      category: category,
      week_start: weekStart,
      success_rate: sorted[i].success_rate,
      percentile: percentile
    });
  }
}
```

**UI Components:**

1. **IndicesPage.jsx** - Main dashboard
2. **IndexCard.jsx** - Individual index display
3. **IndexChart.jsx** - 7-day trend visualization
4. **PercentileBadge.jsx** - User ranking display
5. **CategoryComparison.jsx** - Your rate vs index rate

**On Habit Cards (Portfolio View):**
```
Morning Run
$247 earned | HSS: 87.3
↑ 78th percentile (Exercise)
45-day streak
```

**Marketing Evolution:**
- Phase 1-3: "Progress Pays"
- Phase 4 onwards: "Track habits vs. behavioral indices"
- Social proof: "Built by 100 founding members"

**Timeline:** 4 weeks total for Part A+B+C  
**Output:** Live HSS system + behavioral indices with user percentiles

---

## PHASE 5: GROWTH + DATA QUALITY (Weeks 25-36)

**Goal:** 500+ users, establish data authority, prepare for licensing

### Growth Strategy

**Month 7-8: Content Marketing**
- Write about "building behavioral indices"
- Tweet development progress weekly
- Share anonymized insights from indices
- Example: "Exercise Index surges 12% in January"
- Founding member testimonials

**Month 9: Strategic Launch**
- Product Hunt launch with indices angle
- HackerNews: "Show HN: I built behavioral market indices with 100 founding members"
- Reddit: r/productivity, r/getdisciplined, r/dataisbeautiful
- Press outreach: "The Bloomberg of habits"

**Month 10-12: Retention Focus**
- Weekly email with personalized indices insights
- Push notifications for percentile changes
- In-app prompts comparing to indices
- Gamification: "Beat your percentile this week"
- Monthly "State of Behavioral Health" reports

### Data Quality Initiatives

**Taxonomy Refinement:**
- User feedback on category accuracy
- Subcategory expansion based on usage
- Difficulty calibration (are ratings accurate?)
- Edge case handling (unusual habits)

**Fraud Prevention:**
- Rate limiting on log creation
- Pattern detection (obvious gaming)
- Manual review of outliers
- User reputation scoring

**Data Validation:**
- Spot checks on index calculations
- A/B test different aggregation methods
- Ensure statistical significance (min participants)
- Handle seasonal variations

### First Data Partnership Conversations

**Target partners (informational only):**
- Corporate wellness platforms (Calm, Headspace)
- Insurance companies (behavior-based premiums)
- Academic researchers (behavioral science)
- Health tech companies (Whoop, Oura)

**Pitch:** 
"We have the highest-quality behavioral habit data because users earn money for completions. Our indices track X categories across Y users with Z% daily engagement."

**Ask:**
- What behavioral data would be valuable to you?
- What granularity do you need?
- What would you pay for monthly aggregate reports?

**Don't:** Sell data yet. Just validate interest.

### Milestones

**Week 28:** 200 users, indices stable
**Week 32:** 350 users, first press mention
**Week 36:** 500 users, 5+ companies interested in data

**Timeline:** 12 weeks  
**Cost:** $50-100/month (infrastructure scaling)

---

## PHASE 6: REAL MONEY (Weeks 37-48)

**Prerequisites:** 500+ users, validated data interest  
**Goal:** Convert virtual earnings to real payouts

**NOT BUILDING YET - Just planning:**
- Stripe integration for payouts
- Monthly redemption windows
- Minimum threshold ($10-25)
- Tax compliance (1099s if needed)
- Legal consultation required

**This phase is separate from indices.**  
Indices work with virtual OR real money.

---

## PHASE 7: DATA INFRASTRUCTURE (Months 13-18)

**Goal:** Position as authoritative data source

### API Layer (Public)

```
GET /api/v1/indices
Returns: Current week all category indices

GET /api/v1/indices/{category}
Returns: Historical data for specific category

GET /api/v1/indices/{category}/trends
Returns: Monthly/quarterly trends
```

**Authentication:** API keys for partners  
**Rate Limits:** 1000 calls/day free, paid tiers available  
**Documentation:** Full OpenAPI spec

### Data Licensing Model

**Tier 1: Free Public Indices**
- Current week data
- 6 major categories
- Basic trend information
- Attribution required

**Tier 2: Professional ($500/month)**
- Historical data (12 months)
- Subcategory breakdown
- Weekly reports
- Commercial use allowed

**Tier 3: Enterprise (Custom)**
- Real-time API access
- Custom queries
- Geographic breakdowns
- White-label options

### Academic Partnerships

**Offer free data access to universities for:**
- Behavioral science research
- Public health studies
- Psychology papers

**Benefit:** Establishes Flux as authoritative source  
Citations in papers = credibility

### Marketing Evolution

**Positioning shift:**
- Phase 1-3: "Progress Pays"
- Phase 4-6: "Track habits vs. behavioral indices"
- Phase 7+: "The authoritative source for behavioral performance data"

**Content strategy:**
- Monthly "State of Behavioral Health" reports
- Quarterly trend analysis
- Annual "Behavioral Markets Report"
- Media becomes primary customer acquisition

---

## DECISION GATES SUMMARY

**Gate 1 (Week 12):**
- ✅ PASS: 30+ users, 50%+ retention, indices anticipation positive → Continue
- ❌ FAIL: Iterate or pivot

**Gate 2 (Week 16):**
- ✅ PASS: 50+ users, 60%+ retention → **Flexible threshold decision**
  - Strong engagement → Launch at 50
  - Moderate → Wait for 100
- ❌ FAIL: Iterate or reassess

**Gate 3 (Week 24):**
- ✅ PASS: Indices stable, 100+ users → Phase 5
- ❌ FAIL: Focus on retention over growth

**Gate 4 (Week 36):**
- ✅ PASS: 500+ users, data interest validated → Phase 6-7
- ❌ FAIL: Maintain current course, reassess in 12 weeks

---

## COST PROJECTIONS

| Phase | Timeline | Monthly Cost | Notes |
|-------|----------|--------------|-------|
| 1-2 | Weeks 1-8 | $0-25 | Free tiers + Supabase |
| 3 | Weeks 9-16 | $25-50 | Supabase Pro + analytics |
| 4 | Weeks 17-24 | $50-75 | Increased compute for indices |
| 5 | Weeks 25-36 | $100-150 | Scaling infrastructure |
| 6-7 | Months 13-18 | $200-500 | Real money + API infrastructure |

**At 5,000 users:** ~$1,000/month  
**At 25,000 users:** ~$3,000/month

---

## REVENUE PROJECTIONS (Conservative)

**Month 12 (500 users):**
- Premium subscriptions: $2,500/month ($5/month, 50% conversion)
- Data licensing: $0 (building relationships)
- **Total: $2,500/month**

**Month 18 (2,000 users):**
- Premium subscriptions: $10,000/month
- Data licensing: $2,000/month (4 partners @ $500)
- **Total: $12,000/month**

**Month 24 (5,000 users):**
- Premium subscriptions: $25,000/month
- Data licensing: $10,000/month (enterprise deals)
- **Total: $35,000/month**

**Profitability:** Month 15-18

---

## SUCCESS METRICS BY PHASE

**Phase 3 (Validation):**
- 50+ active users
- 60%+ retention (Week 4)
- 15+ logs per user per week
- Positive indices anticipation feedback

**Phase 4 (HSS + Indices):**
- 100+ users contributing to indices
- Indices cited in social media
- First "How do I improve my percentile?" question
- HSS checking becomes daily habit

**Phase 5 (Growth):**
- 500+ users
- 75%+ retention
- 3+ data partnership conversations

**Phase 7 (Authority):**
- 2,000+ users
- Cited in academic paper or news article
- $10k+ monthly data revenue

---

## ANTI-PATTERNS TO AVOID

**Don't:**
- Build trading/prediction markets yourself
- Add social features (focus on data, not social)
- Over-engineer indices before 50+ engaged users
- Sell user data without explicit consent
- Build features users didn't request
- Ignore retention to chase growth
- Rush indices launch if engagement is weak

**Do:**
- Focus on habit tracking excellence first
- Build indices when statistically meaningful
- Be transparent about data usage
- Listen to churned user feedback
- Iterate based on real usage data
- Build in public for marketing
- Make founding members feel special

---

## THE "EXTRAORDINARY" PATH

**This roadmap gives you 3 shots at extraordinary:**

1. **12 months:** Authoritative behavioral indices
   - Media coverage, academic citations
   - "The Bloomberg of habits"
   
2. **18 months:** Data licensing revenue
   - Multiple enterprise customers
   - Profitable without VC

3. **24-36 months:** Acquisition or scale
   - Wellness company acquires for dataset
   - OR: 25k+ users, $50k+ MRR
   - OR: Third parties building on your indices

**Each level is defensible. Each creates real value.**

---

## IMMEDIATE NEXT STEPS (This Week)

1. ✅ Review updated roadmap v3.1
2. [ ] Commit to GitHub
3. [ ] Add "Indices Coming Soon" placeholder to app
4. [ ] Test founding member messaging with first users
5. [ ] Prepare validation survey with indices questions

**Next Week:**
1. [ ] 10 total users testing
2. [ ] First retention data
3. [ ] Monitor indices anticipation feedback
4. [ ] Begin HSS enhancement planning

**Next Month:**
1. [ ] 30+ users (Gate 1 approaching)
2. [ ] Clear category winners identified
3. [ ] Decide: Continue to Phase 4 or iterate
4. [ ] Refine flexible threshold strategy based on data

---

## SUMMARY

**The Strategy:**
Build the best habit tracker → Add HSS + authoritative indices → License the data

**The Key Insight:**
Turn the bootstrapping problem into a feature - founding members BUILD the indices together, creating community investment and anticipation.

**The Timeline:**
12 months to data authority status

**The Moat:**
Financial incentives create data quality no free app can match

**The Retention Loop:**
HSS (personal optimization) + Indices (social comparison) + Money (extrinsic motivation) = Never-ending engagement

**The Exit:**
Multiple paths - acquisition, profitable scale, or platform play

**Next Milestone:**
50 users with 60%+ retention + positive indices anticipation → Flexible launch decision

---

**Ready to build the behavioral indices together?**
