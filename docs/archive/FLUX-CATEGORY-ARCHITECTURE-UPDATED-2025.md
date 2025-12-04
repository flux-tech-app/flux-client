# Flux Category Architecture: Chat-First + BUILD/RESIST Mechanics
**Date:** November 16, 2025  
**Updated:** Including conversational AI interface and inverted earnings logic  
**Status:** Strategic planning - ready for implementation

---

## EXECUTIVE SUMMARY

### The Complete Evolution

**From:** Unstructured habit list with manual form-based creation  
**To:** AI-powered conversational interface with category-based organization and sophisticated earnings mechanics

### Triple Innovation

1. **Chat-First Interface:** Flux AI assistant handles habit creation/logging through natural conversation (no forms)
2. **Category Organization:** All habits categorized into life domains for indices and visual organization
3. **Smart Earnings Logic:** BUILD and RESIST habits have different mechanics matching psychological principles

### Core Principles

**Categories = Life Domains**
- Fitness, Nutrition, Mental Health, Productivity, Financial, Social, Wellness, Miscellaneous
- Universal classification system for behavioral indices

**Types = Behavior Direction**
- BUILD: Developing positive habits (log to earn)
- RESIST: Breaking negative behaviors (earn automatically, confess failures)

**Flux AI = Primary Interface**
- Natural conversation replaces forms
- Infers categories and types from user language
- Handles complexity behind the scenes
- Explains mechanics contextually

---

## BUILD VS RESIST: EARNINGS MECHANICS

### Critical Design Insight

**Psychological difference between building and breaking habits requires different earnings models.**

### BUILD Habits (Positive Development)

**Concept:** You're developing a NEW positive behavior.

**Earnings Logic:**
- User MUST log activity to earn money
- No log = assumed failure = $0 earned
- Positive reinforcement for taking action

**Example: "Morning Run" - $2/mile, Mon/Wed/Fri**

```
Monday:
- User logs "Ran 4 miles" → Earns $8
- No log → Earns $0 (assumed didn't run)

Success rate calculation:
- Days logged / Days scheduled = completion percentage
```

**User Experience:**
- **Habit creation:** Flux explains "Just tell me when you complete your run and I'll log your earnings"
- **Activity logging:** "Ran 4 miles this morning" → Flux confirms earnings and streak
- **Motivation:** Claim your victories, track your progress

---

### RESIST Habits (Breaking Unwanted Behaviors)

**Concept:** You're STOPPING an existing negative behavior.

**Earnings Logic:**
- User earns money AUTOMATICALLY on scheduled days
- Only logs FAILURES (when they give in to the behavior)
- Logging a failure = $0 for that day
- No log = assumed success = earnings accumulate
- Positive reinforcement for resistance (not punishment for failure)

**Example: "Skip DoorDash" - $10/day, Mon-Fri**

```
Monday:
- No log → Earns $10 automatically (assumed resisted)

Tuesday:
- No log → Earns $10 automatically (assumed resisted)

Wednesday:
- User logs "I ordered DoorDash" → Earns $0 (confessed failure)

Thursday:
- No log → Earns $10 automatically (assumed resisted)

Friday:
- No log → Earns $10 automatically (assumed resisted)

Week total: $40 earned (4/5 successful days = 80%)

Success rate calculation:
- (Days scheduled - Days logged as failures) / Days scheduled
- (5 - 1) / 5 = 80%
```

**User Experience:**
- **Habit creation:** Flux explains "You'll earn automatically each day you resist. If you slip up, just tell me - no judgment"
- **Failure logging:** "I ordered DoorDash tonight" → Flux confirms slip-up logged, shows remaining week earnings
- **Success checking:** "How am I doing on DoorDash?" → Flux shows auto-accumulated earnings
- **Motivation:** Rewarded for resistance, honest about failures

---

### Why This Design Works

**Reduces Friction:**
- RESIST habits: Don't log 7 times/week saying "I didn't do the bad thing"
- Only confess when you slip up (1-2 times instead of 5-7 times)

**Maintains Accountability:**
- BUILD habits: Must actively claim victories (prevents gaming)
- RESIST habits: Must actively confess failures (honesty mechanism)

**Psychological Alignment:**
- BUILD: Positive reinforcement for action
- RESIST: Positive reinforcement for inaction (opportunity cost, not loss aversion)

**Data Integrity:**
- Both types calculate success rates accurately
- Both contribute meaningfully to behavioral indices
- Clear distinction in analytics

---

## FLUX AI CONVERSATIONAL FLOWS

### Overview

Flux AI assistant is the **primary interface** for habit creation, logging, and management. Traditional UI forms are secondary or non-existent. Users simply talk to Flux naturally.

### Conversational Habit Creation

#### BUILD Habit Example: Running

**User:** "I want to start running"

**Flux:** "Nice! Running is a **Fitness** habit. How many days per week are you thinking?"

**User:** "3-4 times"

**Flux:** "Perfect. For running, you can earn per mile or per minute. Which sounds more motivating?"

**User:** "Per mile"

**Flux:** "How about $2 per mile? That's typically $6-10 per run. Does that work?"

**User:** "Yeah"

**Flux:** "Which days work best? I can do weekdays, weekends, or specific days."

**User:** "Monday, Wednesday, Friday"

**Flux:** "✅ **Created: Running**  
📊 Category: Fitness (BUILD)  
💰 $2/mile, Mon/Wed/Fri  
🎯 Log each run to earn!  

When you run, just tell me 'Ran 4 miles' and I'll track it. First run scheduled for Monday!"

**What Flux Did Behind the Scenes:**
- Inferred category: "running" → Fitness
- Inferred type: "start running" → BUILD
- Suggested appropriate rate type (per mile for distance activity)
- Suggested market-rate amount ($2/mile)
- Converted "Monday, Wednesday, Friday" → schedule object
- Created habit with proper data structure
- Explained logging mechanism (must log to earn)

---

#### RESIST Habit Example: DoorDash

**User:** "I want to stop ordering DoorDash"

**Flux:** "Smart move! That's a great way to save money. Should I categorize this under **Financial** (saving money) or **Nutrition** (healthier eating)?"

**User:** "Financial"

**Flux:** "Perfect. Since you're breaking this habit, here's how it works: you'll earn money automatically on days you resist ordering. If you do slip up, just tell me - no judgment, but you won't earn that day. How much would motivate you? I'd suggest $10 per day you don't order."

**User:** "Yeah $10 works"

**Flux:** "Great. How often do you typically order DoorDash?"

**User:** "Like 5-6 times a week, usually weeknights"

**Flux:** "Got it. Let's set this up for Monday-Friday. That means you'll automatically earn $10 each weekday you resist - up to $50/week! If you slip up any day, just tell me 'I ordered DoorDash' and I'll log it. Sound good?"

**User:** "Perfect"

**Flux:** "✅ **Created: Skip DoorDash**  
📊 Category: Financial (RESIST)  
💰 $10/day, Mon-Fri  
🎯 Potential: $50/week  
✨ Earn automatically unless you tell me otherwise!

Your first day starts Monday. You've got this!"

**What Flux Did Behind the Scenes:**
- Inferred type: "stop ordering" → RESIST
- Offered category choice (Financial vs Nutrition) since both valid
- **Explained RESIST mechanics** (critical for user understanding)
- Suggested appropriate flat rate ($10 ≈ typical DoorDash order)
- Converted "5-6 times a week, weeknights" → Mon-Fri schedule
- Created habit with RESIST-specific settings
- Emphasized auto-earnings to reinforce inverted logic

---

#### Ambiguous Category Example: Meditation

**User:** "I want to meditate every morning"

**Flux:** "Love it! Meditation could fit a couple categories:  
• **Mental Health** - if it's for stress/anxiety  
• **Wellness** - if it's for overall self-care  

What's your main goal?"

**User:** "Stress management"

**Flux:** "Got it - **Mental Health** it is. How long are you aiming for?"

**User:** "10 minutes"

**Flux:** "Should I track this as:  
1. Flat rate ($1 per session)  
2. Per minute ($0.10/min = $1 for 10min)?"

**User:** "Flat rate"

**Flux:** "How many days per week?"

**User:** "Every day"

**Flux:** "✅ **Created: Morning Meditation**  
📊 Category: Mental Health (BUILD)  
💰 $1/session, Daily  
🎯 Potential: $7/week  

Just tell me 'Meditated this morning' when you're done!"

---

### Activity Logging (Natural Language)

#### BUILD Habit Logging

**User:** "Ran 4 miles this morning"

**Flux:** "🎉 **Logged!** Running  
💰 Earned: $8 ($2/mile × 4)  
🔥 Streak: 3 days  
📈 This week: $24 from running  

Keep it up!"

**What Happened:**
- Parsed "Ran 4 miles" → matched Running habit, extracted value: 4
- Calculated earnings: 4 miles × $2/mile = $8
- Updated streak counter
- Aggregated weekly earnings for this habit
- Created log entry with earnings

---

#### RESIST Habit Logging (Failure Confession)

**User:** "I ordered DoorDash tonight"

**Flux:** "No worries, happens to everyone. **Logged slip-up** for Skip DoorDash.  
💰 Today: $0 (would have been $10)  
📊 This week: 3/4 days resisted = $30 earned  

You're still doing great - 75% success rate this week!"

**What Happened:**
- Parsed "ordered DoorDash" → matched Skip DoorDash habit
- Recognized as failure confession for RESIST habit
- Created failure log (earnings: $0, isFailure: true)
- Recalculated week total: 4 scheduled days - 1 failure = 3 successful days × $10 = $30
- Maintained encouraging tone (not punitive)

---

#### RESIST Habit Status Check (No Logging Needed)

**User:** "How did I do on DoorDash this week?"

**Flux:** "📊 **Skip DoorDash** (this week):  
✅ 4/5 days resisted  
💰 Earned: $40  
🔥 You saved $40 AND avoided ~1,600 calories!  

Only 1 slip-up on Wednesday. That's an 80% success rate - solid progress!"

**What Happened:**
- Queried Skip DoorDash habit logs for current week
- Counted scheduled days (5) minus logged failures (1) = 4 successful days
- Calculated auto-earnings: 4 days × $10 = $40
- Provided contextual insight (calories saved)
- Framed as success (80%) not failure (20%)

---

### Correction and Updates

**User:** "Actually it was 5 miles, not 4"

**Flux:** "✅ **Updated** your Running log to 5 miles.  
💰 New earnings: $10 (was $8)  
📈 Total today: $10"

---

**User:** "Wait, I didn't order DoorDash yesterday, can you remove that?"

**Flux:** "✅ **Removed** slip-up log for Skip DoorDash (yesterday).  
💰 Yesterday: $10 earned (restored)  
📈 This week: 5/5 days = $50 earned  

Perfect week! 🎉"

---

## CATEGORY STRUCTURE

### 7 Core Categories + Miscellaneous

#### 1. Fitness
**Icon:** Dumbbell or running figure  
**BUILD examples:** Running, gym, yoga, cycling, sports, walking  
**RESIST examples:** Skipping workouts, sedentary behavior, late-night TV instead of exercise

**Flux language cues:**
- "start running", "go to the gym", "do yoga", "work out", "exercise"
- "stop skipping", "quit being lazy about"

---

#### 2. Nutrition
**Icon:** Apple or fork/knife  
**BUILD examples:** Meal prep, hydration, vegetables, protein intake, cooking at home  
**RESIST examples:** Fast food, DoorDash orders, late-night snacking, excessive alcohol, soda

**Flux language cues:**
- "meal prep", "drink water", "eat vegetables", "cook at home"
- "stop ordering", "skip fast food", "quit soda", "avoid junk food"

---

#### 3. Mental Health
**Icon:** Brain or meditation pose  
**BUILD examples:** Meditation, therapy sessions, journaling, gratitude practice, breathing exercises  
**RESIST examples:** Doom scrolling, social media binges, rumination, anxiety spirals

**Flux language cues:**
- "meditate", "journal", "go to therapy", "practice gratitude", "breathe"
- "stop scrolling", "quit social media", "avoid ruminating"

---

#### 4. Productivity
**Icon:** Lightning bolt or checklist  
**BUILD examples:** Deep work sessions, learning, planning, focus time, reading  
**RESIST examples:** Procrastination, distractions, multitasking, busy work

**Flux language cues:**
- "deep work", "study", "learn", "read", "plan my day", "focus time"
- "stop procrastinating", "avoid distractions", "quit multitasking"

---

#### 5. Financial
**Icon:** Dollar sign or piggy bank  
**BUILD examples:** Saving, budgeting, investing, expense tracking  
**RESIST examples:** Impulse purchases, gambling, unnecessary subscriptions, luxury spending, online shopping

**Flux language cues:**
- "save money", "budget", "invest", "track expenses"
- "stop buying", "avoid impulse purchases", "quit gambling", "skip online shopping"

---

#### 6. Social
**Icon:** People or speech bubbles  
**BUILD examples:** Quality time, meaningful calls, networking, relationship maintenance, date nights  
**RESIST examples:** Toxic interactions, ghosting, social isolation, conflict avoidance

**Flux language cues:**
- "call friends", "date night", "spend time with family", "network", "connect"
- "stop ghosting", "avoid toxic people", "quit isolating"

---

#### 7. Wellness
**Icon:** Heart or lotus flower  
**BUILD examples:** Sleep hygiene, stretching, rest days, self-care, spa time  
**RESIST examples:** Substance overuse, nail biting, skin picking, smoking, excessive caffeine

**Flux language cues:**
- "sleep 8 hours", "stretch", "take rest days", "self-care"
- "quit smoking", "stop drinking", "avoid biting nails", "cut back on caffeine"

---

#### 8. Miscellaneous
**Icon:** Question mark or ellipsis  
**Special status:** Does not contribute to behavioral indices  
**Use case:** Habits that don't fit existing categories

**User notice (via Flux):**
"I'll put this in **Miscellaneous** since it doesn't fit our main categories. Just so you know, miscellaneous habits won't contribute to or compare against behavioral indices. If you think this should be its own category, you can suggest it in Settings!"

---

## HOW FLUX DETERMINES CATEGORIES & TYPES

### Language Pattern Recognition

Flux AI uses natural language processing to infer category and type from user input.

#### Category Inference Keywords

**Fitness:**
- Verbs: run, jog, workout, exercise, train, lift, bike, swim, walk, hike
- Nouns: gym, yoga, cardio, strength, sports

**Nutrition:**
- Verbs: eat, cook, meal prep, drink, hydrate
- Nouns: food, water, vegetables, protein, meals
- RESIST: fast food, DoorDash, junk, soda, candy, snacks

**Mental Health:**
- Verbs: meditate, journal, breathe, practice gratitude
- Nouns: therapy, mindfulness, meditation, journaling
- RESIST: scroll, social media, ruminate, worry

**Productivity:**
- Verbs: work, study, read, learn, plan, focus
- Nouns: deep work, books, planning, focus time
- RESIST: procrastinate, distract, multitask

**Financial:**
- Verbs: save, budget, invest, track
- Nouns: money, savings, expenses, investments
- RESIST: buy, shop, gamble, order, spend, impulse

**Social:**
- Verbs: call, visit, connect, network, spend time
- Nouns: friends, family, relationships, dates
- RESIST: ghost, isolate, avoid people

**Wellness:**
- Verbs: sleep, rest, stretch, recover, relax
- Nouns: sleep, rest, self-care, recovery
- RESIST: smoke, drink, bite (nails), pick (skin)

---

#### Type Inference Patterns

**BUILD indicators:**
- "I want to **start** [activity]"
- "I want to **do** [activity]"
- "I want to **build** a habit of [activity]"
- "I'm going to [activity]"
- Action verbs without negation

**RESIST indicators:**
- "I want to **stop** [behavior]"
- "I want to **quit** [behavior]"
- "I want to **break** the habit of [behavior]"
- "I need to **avoid** [behavior]"
- "I'm trying to **resist** [behavior]"
- "I want to **cut back on** [behavior]"

---

### When Flux Can't Infer (Asks for Clarification)

**Ambiguous input:**

**User:** "I want to practice guitar"

**Flux:** "Cool! Guitar practice could be:  
• **Productivity** (skill-building/learning)  
• **Wellness** (creative self-care)  
• **Miscellaneous** (just for fun, won't track in indices)  

Which feels right?"

**User chooses, Flux continues with type/schedule/rate**

---

**Multiple valid categories:**

**User:** "I want to stop ordering takeout"

**Flux:** "Smart! Stopping takeout could fit under:  
• **Financial** (saving money - typical savings: $10-15/meal)  
• **Nutrition** (healthier eating - avoiding processed food)  

What's your main goal?"

**User:** "Saving money"

**Flux:** "**Financial** it is! Since you're breaking this habit..."

---

## HOME PAGE ARCHITECTURE

### Visual Structure

**Layout:** Category cards (not individual habits)  
**Display:** Users only see categories where they have habits  
**Interaction:** Tap to expand/collapse, arrow to navigate to category detail

### Category Card States

#### Collapsed State

```
[Nutrition Icon] Nutrition ───────────────────> [→]
3/5 completed today
```

Shows:
- Category icon (left)
- Category name
- Quick stat (today's completion)
- Navigation arrow (right)

---

#### Expanded State (Inline Dropdown)

```
[Nutrition Icon] Nutrition ───────────────────> [→]

BUILD HABITS:
├─ ✓ Meal prep ─────────────── $5.00 earned
├─ ⏸ Drink 8 glasses ────────── [LOG] $2.00 potential

RESIST HABITS:
├─ ✓ Skip DoorDash ──────────── $10.00 earned (auto)
   └─ [CONFESS SLIP-UP] if you ordered
└─ ⏸ Skip late-night snacks ─── $5.00 potential (auto)
   └─ [CONFESS SLIP-UP] if you snacked
```

Shows:
- All of today's scheduled habits within category
- Separated by BUILD/RESIST type
- Completion status (✓ done, ⏸ pending)
- Earnings (earned or potential)
- Quick action buttons:
  - BUILD: [LOG] to record completion
  - RESIST: [CONFESS SLIP-UP] to record failure

---

#### Navigation to Category Detail Page

Tap arrow (→) on category card to navigate to full category detail page:
- ALL habits in category (not just today's)
- Category-level analytics
- Performance vs Category Index (future)
- Individual habit cards (tap to drill into habit detail)

---

### Chat Button (Primary Action)

**Floating chat button accessible from all screens**

User can tap chat button and say:
- "I want to create a new habit"
- "Log my morning run"
- "How am I doing this week?"
- "I ordered DoorDash tonight" (confess failure)

Chat is PRIMARY interface, visual cards are SECONDARY for viewing/quick actions.

---

## DATA STRUCTURE

### Habit Object (Complete Schema)

```javascript
{
  id: "unique-id",
  name: "Skip DoorDash",
  
  // CATEGORY & TYPE (Required)
  category: "financial", // One of 7 core categories or "miscellaneous"
  type: "resist", // "build" or "resist"
  
  // RATE CONFIGURATION
  rateType: "flat", // "flat", "perUnit", "perMinute", "perHour"
  amount: 10.00, // Dollar amount
  
  // SCHEDULE (Required for indices)
  schedule: {
    type: "weekdays", // "everyday", "weekdays", "weekends", "custom"
    days: [1, 2, 3, 4, 5], // 0 = Sunday, 6 = Saturday
  },
  
  // INDEX CONTRIBUTION
  contributesToIndices: true, // Auto-false for miscellaneous category
  
  // METADATA
  createdAt: "2025-11-16T10:00:00Z",
  updatedAt: "2025-11-16T10:00:00Z"
}
```

---

### Log Object (Complete Schema)

```javascript
{
  id: "log-123",
  habitId: "habit-456",
  
  // DENORMALIZED for fast aggregation
  category: "financial",
  type: "resist",
  
  // LOG DETAILS
  date: "2025-11-16", // Date only (for daily aggregation)
  timestamp: "2025-11-16T18:30:00Z", // Full timestamp
  
  // VALUE & EARNINGS
  value: null, // For BUILD: duration/units/etc. For RESIST failures: null
  totalEarnings: 0, // Calculated earnings for this log
  
  // RESIST-SPECIFIC
  isFailure: true, // Only relevant for RESIST type (true = user gave in)
  
  // SCHEDULING
  wasScheduled: true, // Was this habit scheduled for this date?
  isBonus: false, // Logged on non-scheduled day
  
  // OPTIONAL
  notes: "Couldn't resist after long day" // User can add context
}
```

**Critical distinction:**
- **BUILD logs:** Represent successes (completions), positive earnings
- **RESIST logs:** Represent failures (gave in), zero earnings
- **RESIST successes:** NO LOG CREATED (calculated as: scheduled days - failure logs)

---

## EARNINGS CALCULATIONS

### BUILD Habits: Sum of Logs

```javascript
// Calculate pending balance for BUILD habit
function getBuildHabitEarnings(habitId) {
  const logs = getHabitLogs(habitId)
  return logs.reduce((sum, log) => sum + log.totalEarnings, 0)
}
```

Simple: Sum all log earnings.

---

### RESIST Habits: Scheduled Days Minus Failures

```javascript
// Calculate pending balance for RESIST habit
function getResistHabitEarnings(habitId, startDate, endDate) {
  const habit = getHabit(habitId)
  const logs = getHabitLogs(habitId) // Only failure logs exist
  
  // Get all scheduled days in date range
  const scheduledDays = getScheduledDays(habit.schedule, startDate, endDate)
  
  // Get failure log dates
  const failureDates = logs
    .filter(log => log.isFailure)
    .map(log => log.date)
  
  // Success days = scheduled days without failure logs
  const successDays = scheduledDays.filter(day => !failureDates.includes(day))
  
  // Calculate earnings
  return successDays.length * habit.amount
}
```

Complex: Calculate scheduled days, subtract days with failure logs, multiply by rate.

---

### Weekly Balance Display

**For user dashboard:**

```javascript
function getWeeklyPendingBalance() {
  const habits = getAllHabits()
  const weekStart = getWeekStart()
  const weekEnd = getWeekEnd()
  
  let total = 0
  
  habits.forEach(habit => {
    if (habit.type === 'build') {
      // Sum logs for the week
      total += getBuildHabitEarnings(habit.id, weekStart, weekEnd)
    } else if (habit.type === 'resist') {
      // Calculate auto-earnings
      total += getResistHabitEarnings(habit.id, weekStart, weekEnd)
    }
  })
  
  return total
}
```

---

## SUCCESS RATE CALCULATIONS

### BUILD Habits

```javascript
function getBuildSuccessRate(habitId, startDate, endDate) {
  const logs = getHabitLogs(habitId, startDate, endDate)
  const scheduledDays = getScheduledDays(habitId, startDate, endDate)
  
  // Days logged / Days scheduled
  return (logs.length / scheduledDays.length) * 100
}
```

Example:
- 5 scheduled days
- 4 logs created
- Success rate: 4/5 = 80%

---

### RESIST Habits

```javascript
function getResistSuccessRate(habitId, startDate, endDate) {
  const failureLogs = getHabitLogs(habitId, startDate, endDate)
    .filter(log => log.isFailure)
  const scheduledDays = getScheduledDays(habitId, startDate, endDate)
  
  // (Scheduled days - Failure logs) / Scheduled days
  return ((scheduledDays.length - failureLogs.length) / scheduledDays.length) * 100
}
```

Example:
- 5 scheduled days
- 1 failure log
- Success rate: (5-1)/5 = 80%

---

## BEHAVIORAL INDICES INTEGRATION

### Both Types Contribute Equally

**Nutrition Index Calculation:**

```
User A (Nutrition habits this week):
- Meal prep (BUILD): 5/7 logged = 71%
- Hydration (BUILD): 7/7 logged = 100%
- Skip DoorDash (RESIST): 1/7 failures = 86%

User A Nutrition success: (5 + 7 + 6) / 21 = 85.7%

User B (Nutrition habits this week):
- Vegetables with dinner (BUILD): 4/4 logged = 100%
- Skip fast food (RESIST): 1/4 failures = 75%

User B Nutrition success: (4 + 3) / 8 = 87.5%

NUTRITION INDEX = (18 + 7) / (21 + 8) = 25/29 = 86.2%
```

**Key points:**
- BUILD contributions: Count logged days
- RESIST contributions: Count scheduled days minus failure logs
- Both types weighted equally in index calculations
- Category-level success rate includes both BUILD and RESIST performance

---

### Category Detail Page Shows Breakdown

**Nutrition Category Performance:**
- Overall: 85.7%
  - BUILD habits: 85.5% (meal prep + hydration)
  - RESIST habits: 86% (skip DoorDash)
- vs Nutrition Index: 86.2% (40th percentile)

This gives users insight into whether they're better at building positive habits or resisting negative ones.

---

## ACTIVITY FEED DISPLAY

### BUILD Habits: Show All Logs

```
[Running icon] Ran 4 miles
$8.00 earned • 3-day streak
Today at 7:30 AM
```

All BUILD completions appear in activity feed.

---

### RESIST Habits: Show Failures Only (Optional)

**Option A: Show only failures**
```
[DoorDash icon] Gave in to DoorDash
$0.00 • Would have been $10
Wednesday at 7:15 PM
```

**Option B: Show auto-earnings periodically**
```
[Calendar icon] Weekly Summary
Skip DoorDash: 4/5 days • $40 earned
```

**Recommendation:** Option B - Show weekly rollups for RESIST habits to reduce feed clutter. Only show individual failures if user wants detailed history.

---

## USER ONBOARDING

### Explaining BUILD vs RESIST

**During first RESIST habit creation:**

**Flux:** "Since you're breaking this habit, here's how it works: you'll earn money **automatically** on days you resist. If you slip up, just tell me - I won't count that day, but there's no penalty.

This way you're motivated by what you're **gaining** (opportunity to earn), not what you're losing. Sound good?"

**During first BUILD habit creation:**

**Flux:** "For habits you're building, just tell me when you complete them and I'll log your earnings. The more you do it, the more you earn!"

---

### First Week Tips (Via Flux Chat)

**Day 3 - RESIST habit check-in:**

**Flux:** "Quick tip: For your 'Skip DoorDash' habit, you're earning automatically each day you don't order. You don't need to log anything unless you slip up. Right now you're at $20 for 2 days - keep it going!"

**Day 5 - BUILD habit reminder:**

**Flux:** "Reminder: For 'Morning Run', make sure to log it each time! I can only count it if you tell me. Say something like 'Ran 3 miles this morning' and I'll track it."

---

## GAMING PREVENTION FOR RESIST HABITS

### The Challenge

RESIST habits are more susceptible to gaming:
- Users could never log failures and keep accumulating money
- No accountability mechanism without confession
- Relies on user honesty

### Mitigation Strategies

#### 1. Periodic Verification (Soft Approach)

After 30 days with zero failures on a RESIST habit:

**Flux:** "Wow, you haven't had any slip-ups on 'Skip DoorDash' in 30 days - that's $300 earned! 🎉

Quick question: Is this habit still challenging for you, or has it become automatic? If it's automatic, we could:
1. Increase the difficulty (more days/week)
2. Archive it as a solved behavior
3. Keep going as-is

What do you think?"

Non-accusatory, just checking progress.

---

#### 2. Device Integration (Hard Approach - Future Phase)

For certain RESIST habits, auto-detect via Plaid:
- "Skip DoorDash" → Detect DoorDash charges → Auto-log failure
- "Avoid impulse buys" → Detect non-grocery purchases over $X → Prompt user

Only works for financial behaviors, requires banking integration (Phase 6).

---

#### 3. Reputation Scoring (Indices Context)

From FLUX-INDICES-STRATEGY.md:
- Users with RESIST habits showing zero failures for extended periods get flagged
- Doesn't prevent earnings (user-facing)
- Reduces index contribution weight (backend)
- Part of overall anti-gaming strategy

---

#### 4. Weekly Attestation (Nuclear Option)

Once per week, Flux asks:

**Flux:** "Weekly check-in for your RESIST habits:
- Skip DoorDash: $50 this week (no slip-ups)
- Avoid impulse shopping: $30 this week (no slip-ups)

Confirm these are accurate? [Yes] [I need to correct something]"

Adds friction but maintains honesty. Only implement if gaming becomes widespread.

---

## IMPLEMENTATION ROADMAP

### Phase 1: Data Structure + Core Mechanics (Week 1)

**Tasks:**
- Update habit schema with `category` and `type` fields
- Add category taxonomy constants
- Implement BUILD earnings logic (sum logs)
- Implement RESIST earnings logic (scheduled days - failures)
- Update HabitContext with category-aware functions
- Create separate success rate calculations for each type

**Testing:**
- Verify BUILD habits earn only when logged
- Verify RESIST habits auto-earn unless failures logged
- Test weekly balance calculations for mixed habit types
- Validate success rate calculations

---

### Phase 2: Flux AI Integration (Week 2-3)

**Tasks:**
- Integrate OpenAI/Anthropic API
- Design system prompts for Flux personality
- Implement intent classification (create habit, log activity, query status)
- Build entity extraction (category, type, schedule, rate)
- Create conversational flows for habit creation
- Implement natural language logging
- Add correction/update handling

**Testing:**
- Test category inference accuracy
- Test type inference (BUILD vs RESIST)
- Verify Flux explains RESIST mechanics appropriately
- Test ambiguous input handling

---

### Phase 3: Chat UI Components (Week 3)

**Tasks:**
- Build floating chat button
- Create chat overlay (bottom sheet)
- Message history display
- Input field with streaming responses
- Quick action chips

**Design:**
- Match existing gradient blue theme
- Smooth animations
- Mobile-optimized

---

### Phase 4: Home Page Redesign (Week 4)

**Tasks:**
- Replace habit list with category cards
- Implement expandable card component
- Show BUILD/RESIST habits separately in expanded state
- Different action buttons (LOG vs CONFESS SLIP-UP)
- Navigation to category detail page

**Testing:**
- Empty states (no habits, no scheduled habits today)
- Multiple categories with mixed BUILD/RESIST habits
- Card expand/collapse animations
- Quick action button functionality

---

### Phase 5: Category Detail Page (Week 5)

**Tasks:**
- Build category detail page
- Show all habits in category (not just today's)
- Category-level analytics (BUILD vs RESIST breakdown)
- Individual habit cards
- Navigation to habit detail pages

**Analytics:**
- Total category earnings
- Category success rate (BUILD % + RESIST %)
- Trend charts

---

### Phase 6: Portfolio Page (Week 6)

**Tasks:**
- Create dedicated Portfolio page
- Pending balance calculation (includes RESIST auto-earnings)
- Transfer management UI
- Financial charts (earnings over time)
- Future: Savings goals section

**Calculations:**
- Properly sum BUILD logs + RESIST auto-earnings
- Subtract transferred amounts
- Show breakdowns by category

---

## SUCCESS METRICS

### Implementation Success (Week 6)

- Zero data loss during migration
- 100% of habits categorized
- BUILD/RESIST earnings calculations accurate to the penny
- Flux AI correctly infers category/type >85% of the time
- Chat interface loads <200ms
- Category cards expand/collapse smoothly

### User Adoption (Week 12)

- 60%+ of users try Flux chat in first session
- 40%+ of habits created via chat (not manual forms)
- 30%+ of activity logging via chat
- 90%+ of habits in core categories (not miscellaneous)
- Users create 3+ categories on average
- 80%+ opt-in rate for index contribution

### Data Quality (Month 3)

- <10% of habits in Miscellaneous
- Category distribution shows no single category >40%
- RESIST habit success rates show realistic variance (60-90%)
- No users with 100% success on all RESIST habits for >60 days
- Index calculations run successfully nightly

---

## OPEN QUESTIONS & DECISIONS NEEDED

### 1. Additional Categories

**Current proposal:** 7 core + Miscellaneous  
**User raised:** Learning/Self-Improvement category  
**Question:** Should we add an 8th core category or keep it tight?

**Options:**
- Add "Learning/Growth" as 8th category
- Keep it at 7, route learning to Productivity
- Start with 7, monitor Miscellaneous for patterns

**Decision needed by:** Before category taxonomy finalization

---

### 2. RESIST Habit Verification Frequency

**Question:** How aggressively should we verify RESIST habit honesty?

**Options:**
- Passive: Only flag in backend for indices, no user-facing checks
- Soft: 30-day check-in if zero failures (as documented above)
- Medium: Weekly attestation for all RESIST habits
- Hard: Require device integration (Plaid) for financial RESIST habits

**Recommendation:** Start passive, add soft check-ins after 30 days  
**Decision needed by:** Before Phase 5 (retention features)

---

### 3. Activity Feed for RESIST Habits

**Question:** How should we show RESIST habit activity in feed?

**Options:**
- A) Show only failures (confessions)
- B) Show weekly rollups (auto-earnings summaries)
- C) Show daily "Resisted [habit]" for every successful day
- D) Don't show in feed, only in category/habit detail pages

**Recommendation:** Option B (weekly rollups)  
**Decision needed by:** Before Activity Feed implementation

---

### 4. Flux Personality & Tone

**Question:** How should Flux talk to users?

**Options:**
- Professional coach (direct, motivating, minimal emoji)
- Supportive friend (casual, encouraging, moderate emoji)
- Financial advisor (numbers-focused, analytical, formal)
- Adaptive (learns user preference over time)

**Recommendation:** Start with supportive friend, add personas in Phase 9  
**Decision needed by:** Before system prompt design (Week 8)

---

### 5. Category Icon Style

**Question:** Icon design style?

**Options:**
- Line icons (minimalist, professional - matches Coinbase/Robinhood)
- Filled icons (bold, colorful)
- Illustrative icons (friendly, casual)

**Recommendation:** Line icons (aligns with Bloomberg Terminal aesthetic)  
**Decision needed by:** Before design asset creation

---

## APPENDIX: EXAMPLE USER SCENARIOS

### Scenario 1: Fitness-Focused User

**Habits created via Flux:**

**User:** "I want to start running"  
**User:** "I want to do yoga in the evenings"  
**User:** "I need to stop skipping my gym days"  
**User:** "I should drink more water after workouts"

**Result:**
- **Fitness (BUILD):** Morning Run ($2/mile, Mon/Wed/Fri)
- **Fitness (BUILD):** Evening Yoga ($1/session, Daily)
- **Fitness (RESIST):** Skip Gym Excuses ($5/day, Tue/Thu/Sat)
- **Nutrition (BUILD):** Post-Workout Hydration ($0.50/bottle, Mon/Wed/Fri)

**Home page shows:**
- Fitness card (3 habits)
- Nutrition card (1 habit)

**Week earnings:**
- Running: 3 runs × 4 miles × $2 = $24
- Yoga: 7 sessions × $1 = $7
- Skip Gym Excuses: 3 days resisted (0 failures) × $5 = $15
- Hydration: 3 bottles × $0.50 = $1.50
- **Total: $47.50**

**User experience:**
- Logs runs and yoga via chat: "Ran 4 miles", "Did yoga"
- Doesn't log gym resistance (earns automatically)
- If skips gym: "I skipped the gym today" → Flux logs failure

---

### Scenario 2: Financial Health User

**Habits created via Flux:**

**User:** "I want to stop ordering DoorDash so much"  
**User:** "I need to save $50 every week"  
**User:** "I keep buying stuff on Amazon impulsively"  
**User:** "I should review my budget weekly"

**Result:**
- **Financial (RESIST):** Skip DoorDash ($10/day, Mon-Fri)
- **Financial (BUILD):** Weekly Savings Transfer ($5 reward, Sundays)
- **Financial (RESIST):** Avoid Amazon Impulse ($7/day, Daily)
- **Productivity (BUILD):** Budget Review ($5/session, Sundays)

**Week earnings:**
- Skip DoorDash: 4/5 days (1 failure on Wednesday) = $40
- Savings Transfer: 1 completion = $5
- Amazon Resistance: 6/7 days (1 failure on Saturday) = $42
- Budget Review: 1 completion = $5
- **Total: $92**

**Insights:**
- Financial RESIST habits: 10/12 successful days = 83%
- Financial BUILD habits: 2/2 completed = 100%
- Overall Financial category: 92% success
- User is great at resisting spending but needs to build saving habits

---

### Scenario 3: Mental Health Recovery User

**Habits created via Flux:**

**User:** "I want to meditate every morning for my anxiety"  
**User:** "I need to stop doomscrolling before bed"  
**User:** "I should journal when I feel stressed"  
**User:** "I'm trying to quit smoking"

**Result:**
- **Mental Health (BUILD):** Morning Meditation ($1/session, Daily)
- **Mental Health (RESIST):** Skip Doomscrolling ($3/day, Daily)
- **Mental Health (BUILD):** Stress Journaling ($2/session, As needed)
- **Wellness (RESIST):** Avoid Cigarettes ($10/day, Daily)

**Week earnings:**
- Meditation: 6/7 days logged = $6
- Doomscrolling: 5/7 days resisted (2 failures) = $15
- Journaling: 4 sessions logged (bonus days) = $8
- Cigarettes: 6/7 days resisted (1 failure) = $60
- **Total: $89**

**Flux proactive support:**
- "Hey, I notice you usually doomscroll around 10pm. It's 9:45 now - want to journal instead? That's $5 combined earnings if you do both!"
- "You're on a 6-day cigarette-free streak! That's $60 saved and huge progress. Keep going!"

---

## FINAL NOTES

### The Vision

Transform Flux from a habit tracker into an **AI-powered behavioral portfolio manager** where:
- Users talk naturally to Flux instead of filling forms
- Habits are organized into life domain categories
- BUILD and RESIST habits have sophisticated, psychologically-aligned earnings
- Data structure enables powerful behavioral indices
- Bloomberg Terminal aesthetic extends to conversational interface

### The Strategy

**Phase 2-3:** Build chat-first MVP with category-based habits and BUILD/RESIST mechanics  
**Phase 4-5:** Add proactive Flux features (check-ins, insights, transaction triggers)  
**Phase 6+:** Real money integration, behavioral indices launch, data licensing

### The Moat

**Triple defensibility:**
1. **Chat-first architecture** - Hard to retrofit into existing habit apps
2. **Sophisticated earnings mechanics** - BUILD/RESIST logic requires complete redesign
3. **Category-based indices** - Structured data from day 1 enables unique analytics

### The Timeline

- **Weeks 1-6:** Core implementation (data structure, Flux AI, UI redesign)
- **Weeks 7-12:** Testing, refinement, family beta
- **Week 13+:** Production launch with chat-first interface

### The Risk

**Users might not adopt chat interface initially.** Mitigation:
- Traditional UI remains as fallback
- Onboarding tutorial showcases chat benefits
- Quick action chips for discovery
- Flux proactively offers to help ("Want me to create that habit for you?")

### The Reward

**Category-defining product** that combines:
- Conversational AI (like ChatGPT)
- Real financial accountability (unique)
- Behavioral indices (like Bloomberg)
- Professional mobile experience (like Coinbase)

This isn't just a better habit tracker - it's a new category.

---

**Document Status:** Complete and ready for implementation planning  
**Next Action:** Discuss additional categories (Learning/Growth, etc.), finalize category taxonomy, begin Sprint 1  
**Key Dependencies:** Flux AI agent specification (see FLUX-AI-AGENT-SPECIFICATION.docx), category icon assets, system prompt design

**Related Documents:**
- FLUX-INDICES-STRATEGY.md (strategic foundation)
- FLUX-AI-AGENT-SPECIFICATION.docx (chat interface details)
- FLUX-COMPREHENSIVE-PHASE-ROADMAP.docx (overall timeline)
- HabitContext.jsx (current data structure)
- src-structure.txt (codebase organization)
