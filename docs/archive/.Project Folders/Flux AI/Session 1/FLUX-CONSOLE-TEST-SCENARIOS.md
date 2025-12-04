# Flux AI Console Test Scenarios
**Test these in Claude Console Workbench before building the integration**
**Date:** November 26, 2025

---

## HOW TO TEST

1. **Copy the full system prompt** from `FLUX-SYSTEM-PROMPT-V1.md`
2. **Paste into "System Prompt" field** in Console Workbench
3. **Run each test scenario** one at a time
4. **Verify the response** contains both conversational text AND action JSON
5. **Check that JSON follows the correct structure** for each action type

---

## TEST SCENARIO 1: Multi-Turn BUILD Habit Creation

### Goal: Test complete conversation flow for creating a BUILD habit

**Test Messages (run sequentially, simulating conversation):**

**Message 1:**
```
I want to add a habit
```

**Expected Response:**
- Conversational: Asks if building or breaking
- JSON: `action: "collect_field"`, `field: "habitType"`, `nextQuestion` present

---

**Message 2:**
```
Building
```

**Expected Response:**
- Conversational: Asks what to call it
- JSON: `action: "collect_field"`, `field: "habitName"`, stores `habitType: "BUILD"`

---

**Message 3:**
```
Cardio
```

**Expected Response:**
- Conversational: Infers category is Fitness, asks about rate structure
- JSON: `action: "collect_field"`, stores `habitName: "Cardio"`, `category: "Fitness"`

---

**Message 4:**
```
$.03 per minute
```

**Expected Response:**
- Conversational: Confirms per-minute tracking, asks about schedule
- JSON: `action: "collect_field"`, stores `rateStructure: "per_unit"`, `transferAmount: 0.03`, `measurementType: "duration"`, `measurementUnit: "minutes"`

---

**Message 5:**
```
Weekdays
```

**Expected Response:**
- Conversational: Creates habit, shows summary with category, explains BUILD mechanics
- JSON: `action: "create_habit"` with complete habit object including `schedule: {type: "specific_days", value: ["Mon","Tue","Wed","Thu","Fri"]}`

---

## TEST SCENARIO 2: Natural Language BUILD Habit (Single Inference)

### Goal: Test inferring multiple fields from natural language

**Message:**
```
I want to start running 3 times per week and save $2 per mile
```

**Expected Response:**
- Conversational: Confirms understanding, maybe asks for schedule clarification or creates immediately
- JSON: Should extract `habitType: "BUILD"`, `habitName: "running"`, `category: "Fitness"`, `transferAmount: 2`, `measurementType: "distance"`, `measurementUnit: "miles"`, `schedule: {type: "times_per_week", value: 3}`
- Should either create immediately or ask for confirmation

---

## TEST SCENARIO 3: Multi-Turn RESIST Habit Creation

### Goal: Test RESIST habit flow with category ambiguity

**Message 1:**
```
I want to stop ordering takeout
```

**Expected Response:**
- Conversational: Presents category options (Financial vs Nutrition)
- JSON: `action: "clarify"`, `reason: "multiple_valid_categories"`, `options: ["Financial", "Nutrition"]`

---

**Message 2:**
```
Saving money
```

**Expected Response:**
- Conversational: Assigns to Financial, asks about amount or schedule
- JSON: `action: "collect_field"`, stores `category: "Financial"`

---

**Message 3:**
```
$12 per day
```

**Expected Response:**
- Conversational: Asks about schedule
- JSON: `action: "collect_field"`, stores `transferAmount: 12`, `rateStructure: "flat"`

---

**Message 4:**
```
Every weeknight
```

**Expected Response:**
- Conversational: Creates habit, explains RESIST auto-earning mechanics, mentions Financial category
- JSON: `action: "create_habit"` with `habitType: "RESIST"`, `schedule: {type: "specific_days", value: ["Mon","Tue","Wed","Thu","Fri"]}`
- Must include explanation that user earns automatically unless they confess

---

## TEST SCENARIO 4: Logging BUILD Activity

### Goal: Test activity logging with value extraction

**Context Setup (include in System Prompt for this test):**
```
User has an existing habit:
- Name: "Running"
- Type: BUILD
- Rate: $2 per mile
- Category: Fitness
```

**Message:**
```
I ran 4 miles this morning
```

**Expected Response:**
- Conversational: Confirms log, calculates $8 earned, mentions streak (can be mock data)
- JSON: `action: "log_activity"`, `habitName: "Running"`, `isFailure: false`, `value: 4`, `unit: "miles"`, `timestamp: "today"`

---

## TEST SCENARIO 5: Logging RESIST Failure (Confession)

### Goal: Test RESIST failure logging with positive framing

**Context Setup:**
```
User has an existing habit:
- Name: "Skip DoorDash"
- Type: RESIST
- Rate: $10 per day
- Category: Financial
- Schedule: Mon-Fri
```

**Message:**
```
I ordered DoorDash tonight
```

**Expected Response:**
- Conversational: Non-judgmental acknowledgment, logs failure, shows weekly stats (can be mock), emphasizes success rate not failure
- JSON: `action: "log_activity"`, `habitName: "Skip DoorDash"`, `isFailure: true`, `timestamp: "today"`
- Tone must be "No worries" NOT "That's disappointing"

---

## TEST SCENARIO 6: Query Weekly Status

### Goal: Test data retrieval and summary generation

**Context Setup:**
```
User has these habits:
1. Running (BUILD): 3/4 logged this week, $24 earned
2. Meditation (BUILD): 5/7 logged, $25 earned
3. Skip DoorDash (RESIST): 6/7 days (1 failure), $42 earned
```

**Message:**
```
How am I doing this week?
```

**Expected Response:**
- Conversational: Summary with per-habit breakdown, total earnings, encouraging tone
- JSON: `action: "query_data"`, `queryType: "weekly_summary"`, `timeRange: "this_week"`

---

## TEST SCENARIO 7: Correction Request

### Goal: Test updating previous log

**Context Setup:**
```
User just logged: "Running, 4 miles, $8 earned"
```

**Message:**
```
Actually it was 5 miles, not 4
```

**Expected Response:**
- Conversational: Confirms update, shows new earnings ($10), updates total
- JSON: `action: "update_log"`, identifies most recent log, updates value to 5

---

## TEST SCENARIO 8: Ambiguous Activity Log

### Goal: Test disambiguation when multiple habits match

**Context Setup:**
```
User has these habits:
1. "Running" (last logged yesterday)
2. "Gym Workout" (last logged 3 days ago)
```

**Message:**
```
I worked out today
```

**Expected Response:**
- Conversational: Asks which habit they meant, presents numbered options
- JSON: `action: "clarify"`, `reason: "multiple_matches"`, `options: ["Running", "Gym Workout"]`

---

## TEST SCENARIO 9: Edge Case - Miscellaneous Category

### Goal: Test warning when habit doesn't fit core categories

**Message:**
```
I want to practice guitar 30 minutes daily and earn $1 per session
```

**Expected Response:**
- Conversational: Suggests category options (Productivity for skill-building, Wellness for creative self-care, Miscellaneous)
- OR: Places in Miscellaneous with warning that it won't count toward indices
- JSON: Should either `action: "clarify"` for category or `action: "create_habit"` with warning

---

## TEST SCENARIO 10: Category Inference Test

### Goal: Test automatic category assignment from keywords

**Test each of these separately:**

**Fitness (should auto-assign):**
```
I want to do yoga every morning for 20 minutes at $0.05 per minute
```

**Nutrition (should auto-assign):**
```
I want to meal prep on Sundays and earn $10 per session
```

**Mental Health (should auto-assign):**
```
I want to meditate daily for 10 minutes, flat $1 per session
```

**Productivity (should auto-assign):**
```
I want to read for 30 minutes daily at $0.10 per minute
```

**Financial (should auto-assign):**
```
I want to stop impulse buying on Amazon, save $15 every day I resist
```

**Social (should auto-assign):**
```
I want to call my parents weekly and earn $5 per call
```

**Wellness (should auto-assign):**
```
I want to quit smoking, save $8 per day
```

**Expected for all:** Should correctly infer category without asking, include it in habit creation

---

## TEST SCENARIO 11: Type Inference Test

### Goal: Test BUILD vs RESIST detection from language patterns

**BUILD patterns (all should infer BUILD):**
- "I want to start running"
- "I want to do yoga"
- "I'm going to meditate"
- "I want to build a habit of reading"

**RESIST patterns (all should infer RESIST):**
- "I want to stop buying coffee"
- "I want to quit smoking"
- "I need to avoid fast food"
- "I'm trying to resist DoorDash"
- "I want to cut back on alcohol"

---

## VALIDATION CHECKLIST

For each test, verify:

- [ ] Response contains conversational text AND JSON
- [ ] JSON structure matches specification
- [ ] Required fields are present in JSON
- [ ] Conversational tone is positive and encouraging
- [ ] RESIST failures use non-judgmental language
- [ ] Multi-turn conversations maintain state
- [ ] Category inference works correctly
- [ ] Type inference (BUILD/RESIST) works correctly
- [ ] Educational explanations appear for first habit of each type
- [ ] Schedule conversions work ("weekdays" → Mon-Fri, "every day" → daily)

---

## KNOWN ISSUES TO WATCH FOR

1. **JSON not separated from text** - Should be clearly parseable
2. **Missing required fields** - Every create_habit must have category
3. **Judgmental tone on RESIST failures** - Must be encouraging
4. **Forgetting conversation state** - Should remember what was collected
5. **Over-explaining** - Responses should be concise unless teaching mechanics
6. **Not inferring obvious categories** - "Running" should auto-assign to Fitness

---

## NEXT STEPS AFTER TESTING

Once all scenarios pass:
1. Note any prompt refinements needed
2. Copy finalized system prompt to project files
3. Begin building API service integration
4. Implement action parser in React app
5. Connect FluxChat component to API

---

**Pro Tip:** Test these scenarios in order—start with simple single-field questions, then progress to complex multi-turn flows. This validates the conversation state management works correctly.
