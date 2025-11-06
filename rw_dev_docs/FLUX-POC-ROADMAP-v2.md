# Flux - POC Roadmap v2.0
**Goal:** Validate core engagement with family testing in 4-6 weeks

---

## PHASE 1: POC POLISH (Weeks 1-4)

### Objective
Polish current app and add foundational habit health tracking for family testing.

### 1A: Core UI/UX Polish (Week 1-2)
**High Priority:**
- [ ] Audit and fix responsive design issues
- [ ] Improve mobile navigation flow
- [ ] Polish habit card layouts
- [ ] Improve chart readability
- [ ] Add loading states and error handling
- [ ] Fix any existing bugs

**Medium Priority:**
- [ ] Improve color consistency
- [ ] Better empty states ("No habits yet" screens)
- [ ] Smoother transitions and animations
- [ ] Accessibility improvements (contrast, font sizes)

### 1B: Habit Health System (Week 2-3)
**NEW: Scheduling System**
- [ ] Add schedule selector to AddHabitModal
  - Daily (7 days/week)
  - Weekdays (Mon-Fri)
  - Custom days (select specific days)
  - X times per week (flexible)
- [ ] Add schedule editor to habit settings
- [ ] Update AppContext to store schedule
- [ ] Default existing habits to "daily" on migration

**NEW: Performance Metrics**
- [ ] Calculate scheduled days for last 30 days
- [ ] Calculate completion rate (completed/scheduled)
- [ ] Add trend arrow logic (↑ improving, → stable, ↓ declining)
- [ ] Update Savings page habit cards with new metrics
- [ ] Add portfolio summary section (overall health)

**Display Updates:**
```
Habit Card Shows:
- Total money earned
- 30-day sparkline
- "17/20 days (85%) ↑" (completion rate + trend)
- Current streak

Portfolio Summary Shows:
- Total saved
- Overall health (Excellent/Good/Fair/Needs Attention)
- Count of habits trending up/stable/down
```

### 1C: Documentation & Prep (Week 3-4)
- [ ] Write user guide for family testers
- [ ] Create onboarding flow
- [ ] Set up feedback collection method
- [ ] Prepare testing instructions
- [ ] Define success metrics
- [ ] Test on multiple devices/browsers

---

## PHASE 2: BACKEND + AUTHENTICATION (Weeks 5-7)

### Objective
Move from localStorage to cloud storage. Enable multi-device access.

**Only start if Phase 1 validation is positive**

### Backend Setup
- [ ] Choose platform (Supabase recommended)
- [ ] Set up PostgreSQL database
- [ ] Design database schema
  - Users table
  - Habits table (with schedule data)
  - Logs table
  - User settings table
- [ ] Build REST API or use Supabase client
- [ ] Deploy backend

### Authentication
- [ ] Email/password signup
- [ ] Social login (Google, Apple)
- [ ] Password reset flow
- [ ] Session management
- [ ] Protected routes

### Data Migration
- [ ] Build migration tool (localStorage → cloud)
- [ ] Sync engine (real-time or periodic)
- [ ] Conflict resolution (if needed)
- [ ] Offline mode support

**Timeline:** 2-3 weeks  
**Cost:** $5-20/month

---

## PHASE 3: FAMILY TESTING (Weeks 8-14)

### Objective
Get real usage data from 10 family members over 4-6 weeks.

### Setup
- [ ] Deploy to production URL
- [ ] Send invitation emails with instructions
- [ ] Create private group chat for questions
- [ ] Set up analytics (optional: Plausible, Mixpanel)

### During Testing (Weekly)
- [ ] Monitor usage metrics
- [ ] Collect feedback (weekly check-ins)
- [ ] Fix critical bugs immediately
- [ ] Note feature requests (don't build yet)
- [ ] Watch for engagement patterns

### Success Metrics
**Quantitative:**
- 70%+ retention after 4 weeks
- 5+ logs per user per week
- 3+ habits per user
- Growing virtual balance trend

**Qualitative:**
- "This is actually helping me"
- "When can I make this real money?"
- "I told my friend about this"
- Specific feature requests (shows engagement)
- Stories of behavior change

### End of Testing
- [ ] Conduct exit interviews
- [ ] Analyze usage data
- [ ] Identify top feature requests
- [ ] Decide: iterate, expand, or pivot

---

## DECISION TREE AFTER POC

**If validation is STRONG:**
→ Build Phase 4: Advanced Habit Intelligence
→ Add comprehensive HSS (Habit Strength Score)
→ Build smart insights and recommendations
→ Then Phase 5: Plaid integration

**If validation is MODERATE:**
→ Iterate on POC based on feedback
→ Add missing features family requested
→ Polish UX pain points
→ Test again for 4-6 more weeks

**If validation is WEAK:**
→ Interview family deeply about why they didn't engage
→ Consider pivot (different habits? different reward structure?)
→ Or shelve project and try different idea

---

## PHASE 4: ADVANCED HABIT INTELLIGENCE (Post-Validation)

**Only build if POC shows strong engagement**

### Full HSS (Habit Strength Score) System
- [ ] Implement comprehensive scoring algorithm
  - Scheduled completion (50%)
  - Momentum (25%)
  - Legacy bonus (15%)
  - Consistency (5%)
  - Active streak (5%)
- [ ] Build HSS calculation engine
- [ ] Add decimal precision (0-100.00)
- [ ] Handle all rate types with thresholds
- [ ] Create recalculation triggers

### Intelligence Layer
- [ ] Auto-generated insights
  - Declining momentum alerts
  - Milestone notifications
  - Pattern recognition
- [ ] Personalized recommendations
- [ ] Habit health breakdown (component view)
- [ ] Historical HSS tracking and charts

### Enhanced Portfolio View
- [ ] HSS-based habit rankings
- [ ] Category performance analysis
- [ ] "Needs attention" section
- [ ] Performance vs. time charts
- [ ] Export reports

**Timeline:** 4-6 weeks  
**Rationale:** Users proven they want sophisticated analytics. Now worth the investment.

---

## PHASE 5: SMART ASSISTANCE (Plaid Integration)

**Requires Phase 2 (Backend) + Phase 4 validation**

### Bank Connection
- [ ] Integrate Plaid API (read-only)
- [ ] Build transaction ingestion
- [ ] Pattern detection engine
- [ ] Historical spending analysis

### Smart Check-Ins
- [ ] Context-aware prompts
- [ ] Transaction alerts
- [ ] Weekly recap system
- [ ] Non-judgmental framing

**Timeline:** 6-8 weeks  
**Cost:** $10-30/month (Plaid fees)

---

## PHASE 6: REAL MONEY (Stripe Integration)

**Requires regulatory research and compliance**

### In-App Savings Account
- [ ] Integrate Stripe or similar
- [ ] Build transfer system
- [ ] Real money tracking
- [ ] Withdrawal flow
- [ ] Transaction history
- [ ] Security and compliance

**Timeline:** 4-6 weeks  
**Cost:** Stripe fees + legal consultation

---

## PHASE 7: HEALTH DEVICE INTEGRATION

**Optional: If users request automatic tracking**

### Device APIs
- [ ] Oura Ring integration
- [ ] Whoop integration
- [ ] Apple Health / Google Fit
- [ ] Fitbit API

### Auto-Detection
- [ ] Exercise detection from heart rate
- [ ] Sleep tracking
- [ ] Activity recognition
- [ ] Manual override system

**Timeline:** 3-4 weeks per integration

---

## PHASE 8: BEHAVIOR MARKETS

**Long-term vision - 12-18 months out**

### Individual to Collective
- [ ] Category ticker system (EXRC, VICE, DIET, etc.)
- [ ] Two-tier rate system (personal vs market)
- [ ] Price calculation engine
- [ ] Market metrics (volume, volatility, trends)

### Markets Interface
- [ ] Live ticker display
- [ ] Category performance charts
- [ ] User position vs market
- [ ] Trending behaviors
- [ ] Market insights

**Timeline:** 8-12 weeks  
**Dependencies:** All previous phases working well

---

## IMMEDIATE NEXT STEPS (This Week)

**Priority Order:**
1. Fix any critical bugs in current app
2. Start scheduling system UI (AddHabitModal)
3. Update data structure for schedule storage
4. Begin completion rate calculations
5. Design portfolio summary component

**Next Week:**
1. Finish scheduling system
2. Add trend arrow logic
3. Update Savings page cards
4. Build portfolio summary
5. Test on mobile

**Week 3:**
1. Handle edge cases
2. Polish UI
3. Write user guide
4. Prepare testing materials
5. Deploy to production URL

**Week 4:**
1. Final testing and bug fixes
2. Onboarding flow
3. Invite family testers
4. Begin monitoring usage

---

## RESOURCES NEEDED

**Time:**
- Phase 1: 20-30 hours (polish + habit health)
- Phase 2: 30-40 hours (backend)
- Phase 3: 2-4 hours/week (monitoring)
- **Total for POC: 60-80 hours over 8-10 weeks**

**Money:**
- Hosting: $0 (can use free tiers initially)
- Domain: $12/year (optional)
- Analytics: $0-10/month (optional)
- **Total: ~$20 for testing period**

**Family Commitment:**
- 10 family members
- 5-10 minutes per day for logging
- Weekly feedback (5 minutes)
- Their honest opinions

---

## ANTI-PATTERNS TO AVOID

**Don't:**
- Build full HSS before validating basic engagement
- Add features family didn't ask for
- Over-engineer the backend
- Build Plaid integration yet (too early)
- Worry about scale (10 users is fine)
- Make it perfect (good enough to test is perfect)
- Add complex features if core engagement is weak

**Do:**
- Keep it simple and focused
- Validate assumptions with real users
- Get feedback early and often
- Be ready to pivot based on learnings
- Focus on core value: track habits → see progress
- Make logging frictionless
- Listen to user pain points

---

## MEASURING SUCCESS

### Phase 1 Success
- [ ] App works smoothly on all devices
- [ ] Scheduling system is intuitive
- [ ] Performance metrics are clear
- [ ] Ready to deploy for testing

### Phase 3 Success (POC Validation)
**Quantitative:**
- 70%+ retention after 4 weeks
- 5+ logs per user per week
- 3+ habits per user
- Growing virtual balance trend

**Qualitative:**
- Positive feedback on habit health metrics
- Users checking completion rates and trends
- Questions about "when can I get real money?"
- Feature requests that show deep engagement
- Stories of actual behavior change

**If these metrics hit:**
→ Proceed to Phase 4 (Advanced Intelligence)
→ Full HSS becomes valuable
→ Continue toward full vision

**If metrics are weak:**
→ Core loop isn't working yet
→ Adding complexity won't fix it
→ Need fundamental changes or pivot

---

## SUMMARY

**POC Strategy:** Validate engagement first, add intelligence second.

**New Approach:**
1. **Weeks 1-4:** Add basic habit health (scheduling + simple metrics)
2. **Weeks 5-7:** Backend + auth (if needed)
3. **Weeks 8-14:** Family testing with clear success metrics
4. **Post-validation:** Build sophisticated HSS and intelligence layer

**Why This Works:**
- Tests core value proposition quickly
- Adds meaningful depth without overwhelming complexity
- Positions advanced features as "earned" based on validation
- Reduces risk of over-engineering pre-PMF
- Keeps timeline realistic (4-6 weeks to testing)

**The Big Bet:**
If users engage with simple habit health metrics and say "I want more insight into my habits," you'll know HSS is worth building. If they don't engage, HSS wouldn't have helped anyway.

---

**Ready to start Phase 1?**
