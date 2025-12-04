# Flux MVT Habit Library Specification

**Version:** 1.0  
**Date:** December 2025  
**Purpose:** Define the complete 15-habit library for Minimum Viable Test

---

## Overview

**15 base habits across 4 categories**  
**5 habits have multiple tracking variants**  
**Total: ~25 habit configuration options**

### Category Distribution

- **FITNESS:** 5 habits (3 with variants) - Tests granular vs broad tracking
- **FINANCIAL:** 5 habits (no variants) - Tests positive vs negative framing
- **PRODUCTIVITY:** 3 habits (1 with variants) - Tests different measurement approaches
- **WELLNESS:** 2 habits (1 with variants) - Tests practice vs cessation

---

## Complete Habit Definitions

### FITNESS Category (5 habits)

#### 1. WALKING (3 variants)

**Base Properties:**
- **Ticker:** $WALK
- **Category:** FITNESS
- **Has Variants:** Yes

**Variant A: By Miles**
- **Name:** Walking (Miles)
- **Rate Type:** PER_UNIT
- **Unit:** miles
- **Default Rate:** $0.50/mile
- **Rate Options:** $0.25 | $0.50 | $1.00
- **Input Step:** 0.25
- **Input Placeholder:** "2.5"
- **Logging Prompt:** "How many miles did you walk?"
- **Example Earnings:** 3 miles = $1.50

**Variant B: By Steps**
- **Name:** Walking (Steps)
- **Rate Type:** PER_UNIT
- **Unit:** steps
- **Default Rate:** $0.0002/step ($2 per 10,000 steps)
- **Display Rate:** "$2 per 10,000 steps"
- **Rate Options:** $0.0001 | $0.0002 | $0.0003
- **Input Step:** 100
- **Input Placeholder:** "10000"
- **Logging Prompt:** "How many steps did you walk?"
- **Example Earnings:** 10,000 steps = $2.00

**Variant C: By Session**
- **Name:** Walking (Session)
- **Rate Type:** PER_DAY
- **Unit:** null
- **Default Rate:** $2.00/walk
- **Rate Options:** $1.00 | $2.00 | $3.00
- **Logging Prompt:** "Did you go for a walk today?"
- **Example Earnings:** 1 session = $2.00

**Testing Hypothesis:** Which measurement approach drives more consistent logging - precise distance/steps or simple yes/no?

**Schedule Default:** Daily

---

#### 2. RUNNING (2 variants)

**Base Properties:**
- **Ticker:** $RUN
- **Category:** FITNESS
- **Has Variants:** Yes

**Variant A: By Miles**
- **Name:** Running (Miles)
- **Rate Type:** PER_UNIT
- **Unit:** miles
- **Default Rate:** $1.00/mile
- **Rate Options:** $0.50 | $1.00 | $2.00
- **Input Step:** 0.25
- **Input Placeholder:** "3.5"
- **Logging Prompt:** "How many miles did you run?"
- **Example Earnings:** 3.5 miles = $3.50

**Variant B: By Minutes**
- **Name:** Running (Minutes)
- **Rate Type:** PER_UNIT
- **Unit:** minutes
- **Default Rate:** $0.15/minute
- **Display Rate:** "$0.15/minute ($4.50 for 30 min)"
- **Rate Options:** $0.10 | $0.15 | $0.20
- **Input Step:** 1
- **Input Placeholder:** "30"
- **Logging Prompt:** "How many minutes did you run?"
- **Example Earnings:** 30 minutes = $4.50

**Testing Hypothesis:** Do runners prefer tracking distance (traditional) or time (easier, no GPS needed)?

**Schedule Default:** Daily

---

#### 3. PUSH-UPS (no variants)

**Properties:**
- **Ticker:** $PUSH
- **Name:** Push-ups
- **Category:** FITNESS
- **Has Variants:** No
- **Rate Type:** PER_UNIT
- **Unit:** reps
- **Default Rate:** $0.05/rep
- **Rate Options:** $0.03 | $0.05 | $0.10
- **Input Step:** 5
- **Input Placeholder:** "50"
- **Logging Prompt:** "How many push-ups did you do?"
- **Example Earnings:** 50 reps = $2.50

**Testing Hypothesis:** Do micro-rates ($0.05/rep) feel rewarding for high-volume activities?

**Schedule Default:** Daily

---

#### 4. SQUATS (no variants)

**Properties:**
- **Ticker:** $SQUAT
- **Name:** Squats
- **Category:** FITNESS
- **Has Variants:** No
- **Rate Type:** PER_UNIT
- **Unit:** reps
- **Default Rate:** $0.05/rep
- **Rate Options:** $0.03 | $0.05 | $0.10
- **Input Step:** 5
- **Input Placeholder:** "50"
- **Logging Prompt:** "How many squats did you do?"
- **Example Earnings:** 100 reps = $5.00

**Testing Hypothesis:** Same as push-ups - validates micro-rate model with different exercise.

**Schedule Default:** Daily

---

#### 5. GYM SESSION (2 variants)

**Base Properties:**
- **Ticker:** $GYM
- **Category:** FITNESS
- **Has Variants:** Yes

**Variant A: By Session**
- **Name:** Gym Session
- **Rate Type:** PER_DAY
- **Unit:** null
- **Default Rate:** $5.00/session
- **Rate Options:** $3.00 | $5.00 | $10.00
- **Logging Prompt:** "Did you go to the gym today?"
- **Example Earnings:** 1 session = $5.00

**Variant B: By Minutes**
- **Name:** Gym (Minutes)
- **Rate Type:** PER_UNIT
- **Unit:** minutes
- **Default Rate:** $0.10/minute
- **Display Rate:** "$0.10/minute ($6 for 60 min)"
- **Rate Options:** $0.05 | $0.10 | $0.15
- **Input Step:** 5
- **Input Placeholder:** "60"
- **Logging Prompt:** "How many minutes did you spend at the gym?"
- **Example Earnings:** 60 minutes = $6.00

**Testing Hypothesis:** Which drives better adherence - simple session completion or time-based tracking?

**Schedule Default:** Custom days (user picks which days they plan to go)

---

### FINANCIAL Category (5 habits)

**Category Purpose:** Tests positive vs negative behavioral framing

#### 6. COOKED AT HOME (no variants)

**Properties:**
- **Ticker:** $COOK
- **Name:** Cooked at Home
- **Category:** FINANCIAL
- **Has Variants:** No
- **Rate Type:** PER_DAY
- **Unit:** null
- **Default Rate:** $5.00/meal
- **Rate Options:** $3.00 | $5.00 | $8.00
- **Logging Prompt:** "Did you cook a meal at home today?"
- **Example Earnings:** 1 meal = $5.00
- **Framing:** Positive (BUILD) - celebrates accomplishment

**Schedule Default:** Daily

---

#### 7. AVOID TAKEOUT (no variants)

**Properties:**
- **Ticker:** $NOTAKE
- **Name:** Avoid Takeout
- **Category:** FINANCIAL
- **Has Variants:** No
- **Rate Type:** PER_DAY
- **Unit:** null
- **Default Rate:** $8.00/day
- **Rate Options:** $5.00 | $8.00 | $10.00
- **Logging Prompt:** "Did you avoid ordering takeout today?"
- **Example Earnings:** 1 day = $8.00
- **Framing:** Negative (RESIST) - emphasizes restraint

**Testing Hypothesis:** Compare with "Cooked at Home" - same underlying behavior, different framing. Which drives more consistent logging and behavior change?

**Schedule Default:** Daily

---

#### 8. MADE COFFEE AT HOME (no variants)

**Properties:**
- **Ticker:** $BREW
- **Name:** Made Coffee at Home
- **Category:** FINANCIAL
- **Has Variants:** No
- **Rate Type:** PER_DAY
- **Unit:** null
- **Default Rate:** $3.00/day
- **Rate Options:** $2.00 | $3.00 | $5.00
- **Logging Prompt:** "Did you make coffee at home today?"
- **Example Earnings:** 1 day = $3.00
- **Framing:** Positive (BUILD) - celebrates doing something

**Schedule Default:** Daily (or Weekdays for commuters)

---

#### 9. SKIP COFFEE SHOP (no variants)

**Properties:**
- **Ticker:** $NOCAF
- **Name:** Skip Coffee Shop
- **Category:** FINANCIAL
- **Has Variants:** No
- **Rate Type:** PER_DAY
- **Unit:** null
- **Default Rate:** $3.00/day
- **Rate Options:** $2.00 | $3.00 | $5.00
- **Logging Prompt:** "Did you skip going to the coffee shop today?"
- **Example Earnings:** 1 day = $3.00
- **Framing:** Negative (RESIST) - emphasizes avoidance

**Testing Hypothesis:** Compare with "Made Coffee at Home" - tests positive vs negative framing for same behavior.

**Schedule Default:** Daily (or Weekdays for commuters)

---

#### 10. NO IMPULSE PURCHASES (no variants)

**Properties:**
- **Ticker:** $HOLD
- **Name:** No Impulse Purchases
- **Category:** FINANCIAL
- **Has Variants:** No
- **Rate Type:** PER_DAY
- **Unit:** null
- **Default Rate:** $5.00/day
- **Rate Options:** $3.00 | $5.00 | $10.00
- **Logging Prompt:** "Did you avoid making impulse purchases today?"
- **Example Earnings:** 1 day = $5.00
- **Framing:** Negative (RESIST) - pure avoidance habit

**Testing Hypothesis:** Can negative framing work for abstract spending behaviors?

**Schedule Default:** Daily

---

### PRODUCTIVITY Category (3 habits)

**Category Purpose:** Tests different measurement units and approaches

#### 11. READING (2 variants)

**Base Properties:**
- **Ticker:** $READ
- **Category:** PRODUCTIVITY
- **Has Variants:** Yes

**Variant A: By Pages**
- **Name:** Reading (Pages)
- **Rate Type:** PER_UNIT
- **Unit:** pages
- **Default Rate:** $0.10/page
- **Display Rate:** "$0.10/page ($2.50 for 25 pages)"
- **Rate Options:** $0.05 | $0.10 | $0.20
- **Input Step:** 1
- **Input Placeholder:** "25"
- **Logging Prompt:** "How many pages did you read?"
- **Example Earnings:** 25 pages = $2.50

**Variant B: By Minutes**
- **Name:** Reading (Minutes)
- **Rate Type:** PER_UNIT
- **Unit:** minutes
- **Default Rate:** $0.15/minute
- **Display Rate:** "$0.15/minute ($4.50 for 30 min)"
- **Rate Options:** $0.10 | $0.15 | $0.20
- **Input Step:** 5
- **Input Placeholder:** "30"
- **Logging Prompt:** "How many minutes did you read?"
- **Example Earnings:** 30 minutes = $4.50

**Testing Hypothesis:** Which feels more rewarding - tracking concrete progress (pages) or time investment (minutes)?

**Schedule Default:** Daily

---

#### 12. DEEP WORK (no variants)

**Properties:**
- **Ticker:** $WORK
- **Name:** Deep Work
- **Category:** PRODUCTIVITY
- **Has Variants:** No
- **Rate Type:** PER_UNIT
- **Unit:** hours
- **Default Rate:** $5.00/hour
- **Rate Options:** $3.00 | $5.00 | $8.00
- **Input Step:** 0.25
- **Input Placeholder:** "2"
- **Logging Prompt:** "How many hours of deep work did you complete?"
- **Example Earnings:** 2 hours = $10.00

**Testing Hypothesis:** Do higher dollar amounts per hour make focused work more valuable/appealing?

**Schedule Default:** Weekdays (Mon-Fri)

---

#### 13. JOURNALING (no variants)

**Properties:**
- **Ticker:** $JRNL
- **Name:** Journaling
- **Category:** PRODUCTIVITY
- **Has Variants:** No
- **Rate Type:** PER_DAY
- **Unit:** null
- **Default Rate:** $2.00/entry
- **Rate Options:** $1.00 | $2.00 | $3.00
- **Logging Prompt:** "Did you journal today?"
- **Example Earnings:** 1 entry = $2.00

**Testing Hypothesis:** Simple binary tracking for reflective practice.

**Schedule Default:** Daily

---

### WELLNESS Category (2 habits)

**Category Purpose:** Tests practice-based vs cessation-based habits

#### 14. MEDITATION (2 variants)

**Base Properties:**
- **Ticker:** $ZEN
- **Category:** WELLNESS
- **Has Variants:** Yes

**Variant A: By Minutes**
- **Name:** Meditation (Minutes)
- **Rate Type:** PER_UNIT
- **Unit:** minutes
- **Default Rate:** $0.20/minute
- **Display Rate:** "$0.20/minute ($4 for 20 min)"
- **Rate Options:** $0.10 | $0.20 | $0.30
- **Input Step:** 1
- **Input Placeholder:** "20"
- **Logging Prompt:** "How many minutes did you meditate?"
- **Example Earnings:** 20 minutes = $4.00

**Variant B: By Session**
- **Name:** Meditation (Session)
- **Rate Type:** PER_DAY
- **Unit:** null
- **Default Rate:** $3.00/session
- **Rate Options:** $2.00 | $3.00 | $5.00
- **Logging Prompt:** "Did you meditate today?"
- **Example Earnings:** 1 session = $3.00

**Testing Hypothesis:** Does time-based tracking encourage longer sessions, or does session-based lower friction?

**Schedule Default:** Daily

---

#### 15. GAMBLING-FREE DAY (no variants)

**Properties:**
- **Ticker:** $CLEAN
- **Name:** Gambling-Free Day
- **Category:** WELLNESS
- **Has Variants:** No
- **Rate Type:** PER_DAY
- **Unit:** null
- **Default Rate:** $15.00/day
- **Rate Options:** $10.00 | $15.00 | $20.00
- **Logging Prompt:** "Did you stay gambling-free today?"
- **Example Earnings:** 1 day = $15.00
- **Framing:** Cessation habit - daily commitment, high stakes

**Testing Hypothesis:** Does high-value rate (\$15/day) improve adherence for serious behavior change?

**Schedule Default:** Daily (locked, cannot be changed)

**Schedule Note:** Cessation habits MUST be daily - you can't quit gambling "3 times per week"

---

## Rate Structure Philosophy

### Micro-Rates ($0.01 - $0.10 per unit)

**Used for high-volume activities:**
- Push-ups: $0.05/rep
- Squats: $0.05/rep
- Reading: $0.10/page
- Walking: $0.0002/step
- Gym (minutes): $0.10/min
- Meditation (minutes): $0.20/min

**Purpose:** Gamifies repetition, rewards accumulation over time

**Example:** 
- 50 push-ups = $2.50 (feels rewarding)
- 100 push-ups = $5.00 (feels significant)

---

### Standard Rates ($1 - $5 per unit/session)

**Used for moderate activities:**
- Running: $1.00/mile
- Walking: $0.50/mile
- Gym Session: $5.00/session
- Deep Work: $5.00/hour
- Cardio: $4.00/session
- Cooked at Home: $5.00/meal
- Journaling: $2.00/entry
- Meditation Session: $3.00/session

**Purpose:** Meaningful per-instance reward, standard habit tracking

**Example:**
- 3-mile run = $3.00
- 2 hours deep work = $10.00

---

### High-Stake Rates ($8 - $20 per day)

**Used for challenging commitments:**
- Avoid Takeout: $8.00/day
- Gambling-Free: $15.00/day

**Purpose:** 
- Matches real cost savings (takeout)
- Reflects difficulty/importance (cessation)
- Creates serious financial stake

**Example:**
- 7-day streak avoiding takeout = $56/week
- 30-day gambling-free = $450/month

---

## Rate Customization Options

**Each habit offers 3 preset rates:**
- **Low:** ~50% of default (easier commitment)
- **Default:** Recommended rate (middle ground)
- **High:** ~2x default (serious commitment)

**Plus custom input:** User can set any amount

### Examples:

**Push-ups:**
- Low: $0.03/rep
- Default: $0.05/rep
- High: $0.10/rep
- Custom: User enters (e.g., $0.07/rep)

**Gym Session:**
- Low: $3.00/session
- Default: $5.00/session
- High: $10.00/session
- Custom: User enters (e.g., $7.50/session)

**Rationale:** Tests whether users prefer aggressive rates (higher motivation?) or conservative rates (easier to achieve?).

---

## Scheduling Rules

### All Habits Support These Options:

**1. Daily**
- Available every calendar day
- Can log once per day
- Used by: Most habits default to this

**2. Weekdays Only (Mon-Fri)**
- Available Monday through Friday only
- Weekend days: Habit card grayed out "Not scheduled today"
- Used by: Work-related habits (Deep Work, Made Coffee, Packed Lunch)

**3. Custom Days**
- User picks which days of week (any combination)
- Example: Gym on Mon/Wed/Fri, Running on Tue/Thu/Sat
- Available only on selected days
- Used by: Gym, Running, any habit with specific training schedule

### Exception: Cessation Habits

**Gambling-Free Day:**
- Schedule LOCKED to Daily
- Cannot be changed by user
- Rationale: Cessation is a daily commitment, not selective

---

## Data Structure Examples

### Simple Habit (No Variants)

```javascript
{
  id: "pushups",
  name: "Push-ups",
  ticker: "$PUSH",
  category: "FITNESS",
  hasVariants: false,
  rateType: "PER_UNIT",
  unit: "reps",
  defaultRate: 0.05,
  rateOptions: [0.03, 0.05, 0.10],
  inputConfig: {
    step: 5,
    placeholder: "50",
    prompt: "How many push-ups did you do?"
  },
  scheduleDefault: "DAILY",
  scheduleOptions: ["DAILY", "WEEKDAYS", "CUSTOM"],
  exampleEarnings: "50 reps = $2.50"
}
```

### Habit with Variants

```javascript
{
  id: "walking",
  name: "Walking",
  ticker: "$WALK",
  category: "FITNESS",
  hasVariants: true,
  variants: [
    {
      id: "miles",
      name: "Walking (Miles)",
      rateType: "PER_UNIT",
      unit: "miles",
      defaultRate: 0.50,
      rateOptions: [0.25, 0.50, 1.00],
      inputConfig: {
        step: 0.25,
        placeholder: "2.5",
        prompt: "How many miles did you walk?"
      },
      displayRate: "$0.50/mile",
      exampleEarnings: "3 miles = $1.50"
    },
    {
      id: "steps",
      name: "Walking (Steps)",
      rateType: "PER_UNIT",
      unit: "steps",
      defaultRate: 0.0002,
      displayRate: "$2 per 10,000 steps",
      rateOptions: [0.0001, 0.0002, 0.0003],
      inputConfig: {
        step: 100,
        placeholder: "10000",
        prompt: "How many steps did you walk?"
      },
      exampleEarnings: "10,000 steps = $2.00"
    },
    {
      id: "session",
      name: "Walking (Session)",
      rateType: "PER_DAY",
      unit: null,
      defaultRate: 2.00,
      rateOptions: [1.00, 2.00, 3.00],
      inputConfig: {
        prompt: "Did you go for a walk today?"
      },
      exampleEarnings: "1 session = $2.00"
    }
  ],
  scheduleDefault: "DAILY",
  scheduleOptions: ["DAILY", "WEEKDAYS", "CUSTOM"]
}
```

### Cessation Habit (Locked Schedule)

```javascript
{
  id: "gambling_free",
  name: "Gambling-Free Day",
  ticker: "$CLEAN",
  category: "WELLNESS",
  hasVariants: false,
  rateType: "PER_DAY",
  unit: null,
  defaultRate: 15.00,
  rateOptions: [10.00, 15.00, 20.00],
  inputConfig: {
    prompt: "Did you stay gambling-free today?"
  },
  scheduleDefault: "DAILY",
  scheduleOptions: ["DAILY"],  // ONLY daily - locked
  scheduleLocked: true,
  exampleEarnings: "1 day = $15.00"
}
```

---

## Testing Hypotheses by Category

### FITNESS - Measurement Preferences

**Questions to answer:**
1. Do users prefer granular (miles, reps, minutes) or broad (sessions) tracking?
2. Are micro-rates ($0.05/rep) motivating or trivializing?
3. Does time-based tracking (minutes) work as well as outcome-based (miles)?
4. Which habits get the highest completion rates?

**Comparison pairs:**
- Walking by miles vs steps vs session
- Running by miles vs minutes
- Gym by session vs minutes

---

### FINANCIAL - Behavioral Framing

**Questions to answer:**
1. Does positive framing (BUILD) drive more engagement than negative (RESIST)?
2. Are users more consistent with "I did something" vs "I avoided something"?
3. Do higher rates on avoidance habits compensate for less satisfying logging?
4. Which framing leads to better long-term adherence?

**Comparison pairs:**
- Cooked at Home ($5, positive) vs Avoid Takeout ($8, negative)
- Made Coffee ($3, positive) vs Skip Coffee Shop ($3, negative)

---

### PRODUCTIVITY - Unit Preferences

**Questions to answer:**
1. Do users prefer concrete progress (pages) or time investment (minutes)?
2. Does hourly rate (\$5/hour Deep Work) feel more valuable than per-page?
3. Are binary habits (Journaling) easier to maintain than measured ones?

**Comparison pairs:**
- Reading by pages vs minutes

---

### WELLNESS - Practice vs Cessation

**Questions to answer:**
1. Do cessation habits (high stakes, daily commitment) see better adherence?
2. Does time-based meditation tracking encourage longer sessions?
3. Are high rates (\$15/day) actually more motivating?

**Comparison pairs:**
- Meditation by minutes vs session
- Gambling-Free (cessation) vs other daily habits

---

## Implementation Notes

### Habit Creation Flow

**Step 1: Select Habit**
- Display all 15 habits in scrollable list
- Show: Ticker, Name, Category icon, Default rate
- Example: "🏃 $RUN Running - $1.00/mile"

**Step 2: Select Variant (if applicable)**
- Only shown for habits with hasVariants: true
- Display each variant with description and example
- Example for Walking:
  - "By Miles - $0.50/mile - Track: 'I walked 2.5 miles'"
  - "By Steps - $2 per 10k - Track: 'I walked 10,000 steps'"
  - "By Session - $2/walk - Track: 'I went for a walk'"

**Step 3: Set Rate**
- Show 3 preset options + custom input
- Display weekly/monthly projection based on typical completion
- Example: "At $1/mile, 3 miles 5x/week = $15/week · $65/month"

**Step 4: Set Schedule**
- Daily (every day)
- Weekdays (Mon-Fri only)
- Custom (pick specific days)
- Note: Cessation habits skip this step (locked to Daily)

**Step 5: Confirmation**
- Summary of created habit
- Shows on Today screen immediately if scheduled for today

---

### Logging Modal Logic

**For PER_UNIT habits:**
```javascript
<NumberInput 
  label={`How many ${habit.unit}?`}
  step={habit.inputConfig.step}
  placeholder={habit.inputConfig.placeholder}
  onChange={(value) => setAmount(value)}
/>
<div className="calculation">
  = ${(amount * habit.rateAmount).toFixed(2)}
</div>
<button onClick={() => logActivity(amount)}>
  Log {amount} {habit.unit}
</button>
```

**For PER_DAY habits:**
```javascript
<p>{habit.inputConfig.prompt}</p>
<button onClick={() => logActivity(1)}>
  Yes, I did → ${habit.rateAmount.toFixed(2)}
</button>
<button onClick={() => closeModal()}>
  No, I didn't → $0.00
</button>
```

---

### Earnings Calculation

**Universal formula:**
```javascript
const calculateEarnings = (habit, amount) => {
  if (habit.rateType === 'PER_UNIT') {
    return amount * habit.rateAmount;
  } else { // PER_DAY
    return amount === 1 ? habit.rateAmount : 0;
  }
};
```

**Examples:**
- Running 3.5 miles at $1/mile: 3.5 × 1.00 = $3.50
- 50 push-ups at $0.05/rep: 50 × 0.05 = $2.50
- Gym session (binary): 1 × 5.00 = $5.00
- Avoided takeout (binary): 1 × 8.00 = $8.00

---

### Display Rate Helper

**For readable rate display:**
```javascript
const displayRate = (habit) => {
  if (habit.displayRate) {
    // Use custom display if provided (e.g., "$2 per 10,000 steps")
    return habit.displayRate;
  }
  
  if (habit.rateType === 'PER_UNIT') {
    return `$${habit.rateAmount.toFixed(2)}/${habit.unit}`;
  } else {
    return `$${habit.rateAmount.toFixed(2)}/day`;
  }
};
```

**Output examples:**
- "$1.00/mile"
- "$0.05/rep"
- "$2 per 10,000 steps"
- "$5.00/session"
- "$8.00/day"

---

## Success Metrics to Track

### Per-Habit Metrics

1. **Adoption rate** - How many users create this habit?
2. **Completion rate** - % of scheduled days logged
3. **Retention** - How long do users keep this habit active?
4. **Rate customization** - Do users stick with defaults or customize?
5. **Variant preferences** - Which variants are most popular?

### Cross-Habit Comparisons

1. **Granular vs Broad** - Push-ups/Squats vs Gym Session completion
2. **Positive vs Negative** - Cooked at Home vs Avoid Takeout engagement
3. **Unit preferences** - Miles vs Minutes for running; Pages vs Minutes for reading
4. **Rate impact** - Does higher rate = better completion?

### Category Performance

1. **FITNESS** - Most logs per user?
2. **FINANCIAL** - Highest dollar earnings?
3. **PRODUCTIVITY** - Best completion rate?
4. **WELLNESS** - Longest streaks?

---

## Phase 2 Expansion Signals

**User feedback will indicate what to build next:**

### If Users Request:
- "More fitness habits" → Add Yoga, Swimming, Cycling, HIIT
- "More cessation options" → Add Smoke-Free, Alcohol-Free, Vaping-Free
- "Meal planning" → Add Meal Prep, No Fast Food, Track Macros
- "Work habits" → Add Email Inbox Zero, No Social Media, Meetings-Free Hours
- "Sleep habits" → Add Sleep 8 Hours, Bedtime Routine, No Screen Before Bed

### If Data Shows:
- High adoption of granular habits → Build more rep/page/minute tracking
- High adoption of session habits → Build more binary completion habits
- One variant dominates → Consider removing unused variants
- Custom rates cluster around certain values → Adjust default rates
- Certain categories underused → Rethink category or add more habits

---

## Summary

**15 base habits with 12 variants = 27 total configuration options**

**Rate types:** 
- PER_UNIT (miles, steps, reps, pages, minutes, hours)
- PER_DAY (binary yes/no completion)

**Rate range:** $0.0002/step to $15/day

**Categories tested:**
- FITNESS: Granular vs broad tracking
- FINANCIAL: Positive vs negative framing
- PRODUCTIVITY: Different measurement approaches
- WELLNESS: Practice vs cessation

**This library validates:**
1. Does real money change behavior?
2. Which tracking methods work best?
3. What rate structures feel motivating?
4. Which behavioral framings drive consistency?

**Everything uses the same core system - just different configurations of the same data model.**

---

*End of Specification*
