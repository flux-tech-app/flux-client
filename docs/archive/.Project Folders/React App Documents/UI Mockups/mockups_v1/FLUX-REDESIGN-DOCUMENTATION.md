# Flux Redesign - Design Documentation

**Date:** November 2025  
**Project:** Flux - "Invest in yourself, literally"  
**Redesign Focus:** Portfolio-first UI, professional investment aesthetic

---

## Table of Contents
1. [Core Mission & Vision](#core-mission--vision)
2. [Key Design Decisions](#key-design-decisions)
3. [UI Component Specifications](#ui-component-specifications)
4. [User Flows](#user-flows)
5. [Money Mechanics](#money-mechanics)
6. [Habit Types & Language](#habit-types--language)
7. [Onboarding Flow](#onboarding-flow)
8. [Additional Pages](#additional-pages)
9. [Implementation Guide](#implementation-guide)
10. [File Structure](#file-structure)
11. [Complete Mockup Reference](#complete-mockup-reference)

---

## Core Mission & Vision

### Mission Statement
"Invest in yourself, literally"

### Core Positioning
- **What it is:** Behavior change platform using financial incentives
- **What it's NOT:** Gamified habit tracker with rewards
- **Key differentiator:** Real money, investment portfolio metaphor, professional aesthetic

### Target Aesthetic
- Coinbase-inspired portfolio design
- Professional investment app, not productivity app
- Apple-level polish and attention to detail
- Data as the hero, minimal decoration

### Key Insight
The UI was showing money everywhere but still *feeling* like "a habit tracker with money" rather than "an investment portfolio for behavior." This redesign shifts the entire mental model and interface language to match the mission.

---

## Key Design Decisions

### 1. Portfolio-First Home Page

**Before:**
- "Today's Focus" card with habit checklist
- Weekly summary card with redundant math
- Money scattered across multiple surfaces
- Felt like a gamified todo list

**After:**
- **Portfolio header** front and center:
  - Total Portfolio Value: $127.50 (large, prominent)
  - Today's change: +$6.00 (context, smaller)
  - Lifetime earnings visible immediately
- Simplified habit cards (no rates on card face)
- "Your Positions" language (not "Your Habits")
- Removed weekly summary (redundant data)
- Removed "Today's Focus" (redundant interface)

**Rationale:**
Investment apps (Coinbase, Robinhood) show total value first, then individual positions. Mirror that pattern.

---

### 2. Navigation Structure

**Bottom Nav - 3 Tabs (not 5):**
1. **Portfolio** - Main view (current Home)
2. **Activity** - All logs across all habits
3. **Account** - Settings, profile, preferences

**Removed:**
- Savings (integrated into Portfolio as toggle - placeholder for now)
- Markets (Phase 8 feature, 12+ months away)

**Rationale:**
Pre-POC, keep it tight. Add tabs as you add real features. Professional investment apps have 4-5 tabs because they have massive feature sets. You don't yet.

---

### 3. FAB Interaction Pattern

**Single FAB for all habit actions:**

**Tap FAB →** Bottom sheet slides up (70% height) showing:
- **Sheet header:** "Log Activity" (center) + "Add" button (top right)
- **Sheet content:** List of all active habits for quick logging

**Two paths from bottom sheet:**

**Path 1: Quick Log**
- Tap a habit → Opens logging interface for that habit
- Log details → Submit → Back to Portfolio

**Path 2: Add New Position**
- Tap "Add" button → Sheet expands to full screen
- Shows add habit form
- Create → Back to Portfolio

**Why this works:**
- Single entry point reduces cognitive load
- "Add" discoverable but not dominant (logging is more frequent)
- Pattern users understand (Instagram, Messages, etc.)
- FAB always accessible, never intrusive

---

### 4. Habit Card Design

**Portfolio View - Simplified Cards:**

**Card Structure:**
```
┌────────────────────────────────────┐
│ Habit Name              [•••]      │
│ Daily goal: 1x                     │
│                                    │
│ [✓] Done          ✓ Complete       │
│ ────────────────────────────────   │
│ [Mini sparkline chart]             │
└────────────────────────────────────┘
```

**What's shown:**
- Habit name
- Goal info (frequency + amount)
- Progress status (Done, 0/5, 30 min)
- Mini 30-day sparkline

**What's NOT shown:**
- Rates (moved to detail view)
- Today's earnings (too much clutter)
- Multiple stats (keep it clean)

**Visual Treatment:**
- White cards with subtle border
- No gradients
- Generous padding
- Tap to expand to detail view

**Breaking Habits:**
- Use 🛡️ shield icon instead of ✓
- Language: "Resisted" not "Done"
- Different color accent (amber/yellow)

---

### 5. Habit Detail Page

**Full page accessed by tapping habit card in portfolio:**

**Structure (top to bottom):**

1. **Header Bar**
   - Back button
   - "Position Details" title
   - Menu (•••)

2. **Hero Section** (light blue gradient background)
   - Habit name (large)
   - Lifetime earnings: $45.50
   - Today's status badge: "Completed today" (green)

3. **Activity Chart Section**
   - Section title: "Activity"
   - Time toggle buttons: 30D | 90D | 1Y | All
   - Large bar chart (prominent, takes vertical space)

4. **Streaks Section** (gray background)
   - Section title: "Streaks"
   - 3-column grid:
     - Current: 7 days
     - Longest: 14 days
     - This week: 5/7 days

5. **Recent Activity Section**
   - Section title: "Recent Activity"
   - Scrollable list of last 10-20 logs
   - Each item: Icon, "30 minutes", "Today at 7:15 AM", "+$1.50"
   - Tap to edit/delete

6. **Position Details** (collapsible)
   - Chevron toggle to expand/collapse
   - Rate type, rate amount, goal frequency, goal amount, status
   - "Edit Position" button at bottom

**Rationale:**
This is where users go deep. Give them everything: history, trends, streaks, recent activity, and settings. The portfolio view is for scanning, this is for analysis.

---

### 6. Add Habit Form

**Full screen form (accessed via FAB → Add):**

**Header:**
- Cancel (left) | "Add Position" (center) | Create (right, blue)

**Form Sections:**

1. **Position Type** (required)
   - Toggle: Build (💪) vs Break (🛡️)
   - Build: "Earn when you do it"
   - Break: "Earn when you resist"

2. **Habit Name** (required)
   - Text input
   - Placeholder: "e.g., Morning Cardio"

3. **Rate Structure** (required)
   - Grid of 4 options:
     - Completion (flat)
     - Per Minute (duration)
     - Per Calorie (workout tracking)
     - Custom Unit (pages, reps, etc.)

4. **Base Rate** (required)
   - Dollar input: $ [0.00] per [unit]
   - Helper text: "This is the amount you'll earn for each [unit]"

5. **Goal Settings** (required)
   - Frequency dropdown: Daily | Weekly
   - Amount input: numeric
   - Helper text: "Complete this habit X times per [frequency]"

6. **Optional Top-up** (only for Break habits)
   - Toggle switch
   - Description: "Allow manual entry of actual money saved"

7. **Preview Card** (live updates)
   - Shows how it will appear in portfolio
   - Estimated weekly earnings calculation
   - Example: "Estimated weekly earning at 30 min/day: $10.50"

8. **Info Card** (guidance)
   - Blue info box
   - "Keep rates sustainable"
   - "Start small. You can always adjust rates later. The goal is consistency, not big payouts."

**Validation:**
- Create button disabled until all required fields filled
- Real-time preview updates as user types

---

### 7. Logging Interfaces

**Two variants: Build vs Break**

#### Build Habit Logging

**Structure:**
- Header: Cancel | "Log Activity" | [empty]
- Habit badge: Icon + Name (large, centered)
- **Amount input:**
  - Large number input (center, prominent)
  - Unit label (min/cal/pages)
- **Quick amount buttons:**
  - 3x2 grid of common amounts
  - Examples: 15 min, 30 min, 45 min, 60 min, 90 min, 120 min
- **Date/Time selection:**
  - 2-column grid: Date picker | Time picker
- **Earnings preview:**
  - Green card: "You'll earn: +$1.50"
- **Submit button:**
  - Full width, gradient blue
  - Text: "Log Activity"

#### Break Habit Logging

**Structure:**
- Header: Cancel | "Log Resistance" | [empty]
- Habit badge: Shield icon + Name (large, centered)
- **Resistance badge:**
  - Yellow card with shield emoji
  - "I resisted this temptation"
- **Date/Time selection:**
  - 2-column grid
- **Base earnings display:**
  - Small card: "Base rate: +$1.00"
- **Optional top-up section:**
  - Toggle: "Add Money Saved"
  - Description: "Optional: Transfer the actual amount you didn't spend"
  - When enabled:
    - Yellow input card
    - "How much would you have spent?"
    - $ [28.50] input
- **Total earnings preview:**
  - Large green card
  - "Total you'll earn: +$29.50"
  - Breakdown: "$1.00 base + $28.50 saved"
- **Submit button:**
  - Text: "Log Resistance"

**Key difference:**
Build focuses on amount/duration. Break focuses on resistance confirmation with optional savings tracking.

---

## Money Mechanics

### Core Principles

**Money is required** (not optional):
- Aligns with mission: "invest in yourself, literally"
- Clear differentiation from other habit trackers
- Base rates kept tiny to reduce barrier ($5-10/week typical)

**Trial mode consideration:**
- Track money but don't require bank connection for first 2 weeks
- User sees accumulated savings ($47.50 earned!)
- No transfer until convinced and ready

### Rate Structures

**Build Habits:**
- **Fixed rates only**
- Per minute: $0.01 - $0.10/min
- Per completion: $0.25 - $2.00/completion
- Per calorie: $0.001 - $0.01/cal
- Per unit: Custom, user-defined

**Break Habits:**
- **Base rate:** $1.00 - $2.00 per resistance logged
- **Optional top-up:** User manually enters actual savings
- Example: Resist Doordash = $1 base + $28.50 they didn't spend = $29.50 total

### Transfer Timing

**Weekly transfers** (not daily/per-log):
- Accumulate throughout week
- Single transfer on Sunday (or user-defined day)
- Avoids micro-transaction fees
- Feels like a paycheck

### What We Track

**One number: Flux balance**
- What's actually in the app
- Weekly running total
- Lifetime total

**What we DON'T track (for POC):**
- "Could've saved" vs "actually saved"
- Comprehensive financial tracking
- What users do with money after it leaves Flux

**Future consideration:**
- "Estimated resistance value" as motivational metric
- Keep separate from actual savings to avoid confusion

---

## Habit Types & Language

### Build Habits (💪)

**Examples:**
- Cardio, Journaling, Reading, Meditation, Meal prep

**Language:**
- Position type: "Build"
- Action: "Complete"
- Status: "Done", "Completed", ✓ checkmark
- Card badge: Green checkmark circle

**Goal structure:**
- Daily: "Complete 1x per day"
- Weekly: "Complete 5x per week"

**Logging flow:**
- Amount/duration input
- Confirmation
- Earnings preview

---

### Break Habits (🛡️)

**Examples:**
- Doordash, Vaping, Doomscrolling, Social media, Shopping

**Language:**
- Position type: "Break"
- Action: "Resist"
- Status: "Resisted", "Clean", 🛡️ shield
- Card badge: Amber/yellow shield circle

**Goal structure:**
- Same as build (daily/weekly targets)
- BUT: Goal is to resist X times, not to "complete"

**Logging flow:**
- Resistance confirmation
- Optional savings input
- Base + top-up calculation
- Total earnings preview

**The challenge:**
- Can't automate resistance detection
- Requires manual logging: "I was tempted but didn't"
- Base rate rewards the behavior
- Top-up captures actual financial impact

---

## Onboarding Flow

### Overview
The onboarding experience introduces new users to Flux's unique "invest in yourself" concept and sets them up for success. It should take 2-3 minutes to complete.

### Onboarding Screens

**Screen 1: Welcome**
- Large "Flux" logo
- Tagline: "Invest in yourself, literally"
- Hero visual showing potential portfolio value
- Three key features: Build habits, Break habits, Earn real money
- "Get Started" button
- Progress dots (1 of 3)

**Screen 2: How It Works**
- Title: "How Flux Works"
- Three-step explanation:
  1. **Create Your Positions** - Set up habits with custom rates
  2. **Track Your Behavior** - Log completions/resistances (5 seconds)
  3. **Grow Your Portfolio** - Weekly transfers to savings
- Visual examples for each step
- Key message: "Keep it sustainable - start with $5-10/week"
- "Continue" button + "Skip Tutorial" option
- Progress dots (2 of 3)

**Screen 3: Profile Setup**
- Title: "Create Your Profile"
- Avatar placeholder (optional upload)
- Name input (required)
- Email input (optional - for recovery)
- Privacy notice: "Your data stays on your device"
- "Continue" button + "Back" option
- Progress dots (3 of 3)

**Post-Onboarding:**
After profile setup, users can either:
- Be prompted to connect bank (optional, can skip)
- Be prompted to create first habit (optional, can skip)
- Go directly to empty portfolio with "Add Your First Position" CTA

### Design Principles for Onboarding

**Progressive disclosure:**
- Don't overwhelm with all features at once
- Focus on core value prop: behavior change + financial incentives
- Let users explore advanced features organically

**Skip-friendly:**
- Every step except name entry should be skippable
- Users can complete setup later from Account page
- Don't gate the app experience behind lengthy onboarding

**Trust-building:**
- Emphasize privacy and security
- Show "Powered by Plaid" for bank connections
- Clear language about what data is collected

---

## Additional Pages

### Activity Feed Page

**Purpose:** Central view of all logged behavior across all habits

**Layout:**
- Header: "Activity" title + filter button
- Filter chips: All | Build 💪 | Break 🛡️ | This Week | This Month
- Summary stats (3-column grid): This Week count | Total earned | Current streak
- Activity feed grouped by date:
  - Today
  - Yesterday  
  - Earlier dates
- Each log item shows:
  - Icon (green checkmark for build, amber shield for break)
  - Habit name
  - Details (amount/duration/resistance)
  - Time logged
  - Earnings amount

**Interactions:**
- Tap log item → Edit/delete options
- Tap filter chips → Filter view
- Pull to refresh
- Infinite scroll for older logs

**Empty state:**
- Icon + "No activity yet"
- "Start logging your habits to see your progress here"

---

### Account Page

**Purpose:** User profile, stats overview, and access to settings

**Layout:**
- Profile header (gradient background):
  - Avatar (initial or photo)
  - Name
  - Email
  - "Edit Profile" button
- Stats grid (3 columns):
  - Active positions count
  - Total earned
  - Current streak
- Menu sections:
  - **Account**: Bank connection, Transfer schedule, Transaction history
  - **App**: Settings, Help & Support, About Flux
- Version info at bottom

**Interactions:**
- Tap avatar → Edit profile
- Tap menu items → Navigate to detail pages
- Clean, organized information architecture

---

### Settings Page

**Purpose:** App preferences and configurations

**Sections:**

**1. Notifications**
- Daily Reminders (toggle)
- Streak Alerts (toggle)
- Transfer Updates (toggle)

**2. Transfer Schedule**
- Transfer Day (dropdown: Sunday, Monday, Friday, etc.)
- Transfer Time (dropdown: 11:59 PM, 12:00 AM, 9:00 AM, etc.)
- Minimum Transfer Amount (dropdown: $0, $5, $10, $20)

**3. Appearance**
- Dark Mode (toggle)

**4. Data & Privacy**
- Export Data → Download CSV/JSON
- Privacy Policy → External link

**5. Danger Zone**
- Clear All Data → Confirmation dialog
- Sign Out → Confirmation

**Design:**
- Grouped sections with labels
- Consistent item layout: Icon + Title/Subtitle + Control
- Toggle switches for binary options
- Dropdowns for selection options
- Red accent for destructive actions

---

### Bank Connection Setup

**Purpose:** Simulated Plaid-style bank connection flow (for POC)

**Layout:**
- Header icon (bank/card symbol)
- Title: "Connect Your Bank"
- Subtitle: Clear value prop
- Benefits list:
  - Automatic Transfers
  - Bank-Level Security  
  - No Account Access (send-only)
- Security notice (blue info card)
- Bank search input
- Popular banks grid (2 columns)
- "Continue" button + "I'll do this later" option
- "Powered by Plaid" badge

**POC Implementation:**
- For POC, this is a mock flow
- Selecting any bank → Success screen: "✓ Connected"
- Stores dummy connection status in localStorage
- Real Plaid integration comes in Phase 2 post-validation

**Security Messaging:**
- Emphasize encryption
- "We can only send money, never withdraw"
- "Login credentials never stored by Flux"
- Partner trust signal (Plaid badge)

---

## Implementation Guide

### What Stays Unchanged

**Core logic (no changes needed):**
- Habit tracking calculations
- Context API state management
- localStorage persistence
- Streak calculations
- Chart.js library (just moves to detail view)
- Router setup (add routes, don't rebuild)

### What Gets Replaced

**Complete redesign:**
- `Home.jsx` → `Portfolio.jsx`
  - New portfolio header
  - Simplified cards
  - View toggle (positions/analytics placeholder)
  
**Component updates:**
- Bottom navigation: 5 tabs → 3 tabs
- Navigation.jsx needs update

**Deletions:**
- Weekly summary component (entire component deleted)
- "Today's Focus" component (entire component deleted)
- Savings page (or convert to placeholder/toggle)

### What Gets Added

**New components:**
```
/components
  ├── FAB.jsx                    # Floating action button
  ├── BottomSheet.jsx            # Habit list for logging + Add button
  ├── HabitCard.jsx              # Simplified portfolio card
  └── Navigation.jsx             # 3-tab bottom nav (updated)

/pages
  ├── Portfolio.jsx              # New home page
  ├── HabitDetail.jsx            # Full position detail view
  ├── AddHabit.jsx               # Create new position form
  ├── LogActivity.jsx            # Logging interface (build/break variants)
  ├── Activity.jsx               # All logs view (cross-habit)
  └── Account.jsx                # Settings, profile
```

### Recommended Implementation Order

**Phase 1: Foundation**
1. Update Navigation (3 tabs)
2. Create new Portfolio.jsx (replace Home)
3. Create simplified HabitCard component
4. Test portfolio view rendering

**Phase 2: Actions**
5. Build FAB component
6. Build BottomSheet component
7. Wire up FAB → sheet interaction
8. Test quick access flow

**Phase 3: Forms**
9. Build AddHabit form page
10. Wire up FAB → Add → Form flow
11. Build LogActivity page (start with build variant)
12. Wire up FAB → Habit → Log flow
13. Add break variant logging
14. Test complete creation and logging flows

**Phase 4: Detail View**
15. Build HabitDetail page
16. Implement chart section
17. Implement streaks section
18. Implement activity feed
19. Wire up card tap → detail navigation
20. Test complete view/edit cycle

**Phase 5: Polish**
21. Animations (sheet slide, transitions)
22. Error states
23. Empty states
24. Loading states
25. Accessibility review

---

## File Structure

### Recommended Organization

```
/src
  /components
    /common
      ├── FAB.jsx
      ├── BottomSheet.jsx
      ├── HabitCard.jsx
      └── Navigation.jsx
    /forms
      ├── AddHabitForm.jsx
      └── LogActivityForm.jsx
    /habit-detail
      ├── HabitChart.jsx
      ├── StreakStats.jsx
      └── ActivityFeed.jsx
  
  /pages
    ├── Portfolio.jsx          # Main home view
    ├── HabitDetail.jsx        # Position detail
    ├── AddHabit.jsx           # Create position
    ├── LogActivity.jsx        # Log activity
    ├── Activity.jsx           # All activity feed
    └── Account.jsx            # Settings
  
  /context
    └── HabitContext.jsx       # Existing (minor updates)
  
  /utils
    ├── calculations.js        # Existing
    └── formatters.js          # Existing
  
  /styles
    └── [component styles or Tailwind]
```

### Route Structure

```javascript
<Routes>
  <Route path="/" element={<Portfolio />} />
  <Route path="/habit/:id" element={<HabitDetail />} />
  <Route path="/add" element={<AddHabit />} />
  <Route path="/log/:habitId" element={<LogActivity />} />
  <Route path="/activity" element={<Activity />} />
  <Route path="/account" element={<Account />} />
</Routes>
```

---

## User Flows

### Flow 1: Quick Log (Most Common)

```
Portfolio view
  ↓ [Tap FAB]
Bottom sheet appears (70% height)
  ├─→ [Tap "Cardio"]
  │     ↓
  │   Log Activity page
  │     ↓ [Enter 30 min, tap Log]
  │   Back to Portfolio
  │   (Sheet dismissed, portfolio updates)
  │
  └─→ [Tap "Add"]
        ↓
      Add Position form (full screen)
        ↓ [Fill form, tap Create]
      Back to Portfolio
      (Sheet dismissed, new habit appears)
```

### Flow 2: View Details

```
Portfolio view
  ↓ [Tap habit card]
Habit Detail page
  ├─→ View charts/stats
  ├─→ View activity history
  ├─→ [Tap Position Details]
  │     ↓ View/edit settings
  │
  └─→ [Tap back]
      Return to Portfolio
```

### Flow 3: Add New Position

```
Portfolio view
  ↓ [Tap FAB]
Bottom sheet appears
  ↓ [Tap "Add" button]
Add Position form (sheet → full screen animation)
  ↓ [Select Build/Break]
  ↓ [Enter habit name]
  ↓ [Select rate structure]
  ↓ [Enter base rate]
  ↓ [Set goal]
  ↓ [Preview updates live]
  ↓ [Tap "Create"]
Back to Portfolio
(New position appears in list)
```

### Flow 4: Log Resistance with Top-up

```
Portfolio view
  ↓ [Tap FAB]
Bottom sheet
  ↓ [Tap "Resist Doordash"]
Log Resistance page
  ↓ Shows base rate: $1.00
  ↓ [Toggle "Add Money Saved"]
  ↓ [Enter $28.50]
  ↓ Preview shows: +$29.50 total
  ↓ [Tap "Log Resistance"]
Back to Portfolio
(Portfolio value updates)
```

---

## Visual Design Tokens

### Colors

**Primary Blues:**
- Primary: `#2563eb`
- Primary Dark: `#1d4ed8`
- Primary Light: `#eff6ff`

**Success/Earnings Greens:**
- Success: `#10b981`
- Success Dark: `#15803d`
- Success Light: `#f0fdf4`

**Resistance/Break Yellows:**
- Amber: `#f59e0b`
- Amber Dark: `#92400e`
- Amber Light: `#fef3c7`

**Neutrals:**
- Gray 900: `#111827` (headings)
- Gray 700: `#374151` (body)
- Gray 500: `#6b7280` (secondary text)
- Gray 300: `#d1d5db` (borders)
- Gray 100: `#f3f4f6` (backgrounds)

### Typography

**Font Stack:**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

**Scale:**
- App logo: 22px, bold
- Page title: 17px, semibold
- Section title: 18px, semibold
- Card habit name: 16px, medium
- Body text: 14-15px, regular
- Small text: 12-13px, regular
- Uppercase labels: 11px, semibold, tracking-wide

### Spacing

**Base unit: 4px**

Common spacing scale:
- 4px (1 unit)
- 8px (2 units)
- 12px (3 units)
- 16px (4 units) - standard padding
- 24px (6 units) - section spacing
- 32px (8 units) - large section spacing

### Border Radius

- Small: 8px (buttons, inputs)
- Medium: 10px (cards, containers)
- Large: 12px (major cards)
- XL: 20px (bottom sheet top corners)
- Circle: 50% (FAB, icons)

### Shadows

**Elevation system:**
- None: `box-shadow: none`
- Low: `box-shadow: 0 1px 2px rgba(0,0,0,0.05)`
- Medium: `box-shadow: 0 2px 8px rgba(0,0,0,0.1)`
- High: `box-shadow: 0 4px 12px rgba(37,99,235,0.3)` (FAB)

---

## Critical Implementation Notes

### 1. Build vs Break Logic

```javascript
// In habit data model, add:
{
  id: string,
  name: string,
  type: 'build' | 'break',  // NEW FIELD
  rateType: 'flat' | 'minute' | 'calorie' | 'unit',
  rateAmount: number,
  goalFrequency: 'day' | 'week',
  goalAmount: number,
  allowTopUp: boolean,  // NEW FIELD (for break habits)
  // ... rest of fields
}
```

### 2. Optional Top-up Logging

```javascript
// Log data structure:
{
  habitId: string,
  timestamp: Date,
  amount: number,  // duration/calories/units
  baseEarnings: number,  // calculated from rate
  topUpAmount: number,  // NEW FIELD (optional, break habits only)
  totalEarnings: number,  // base + topUp
}
```

### 3. Portfolio Calculations

```javascript
// getTotalValue()
// Sum all logs' totalEarnings (includes base + topUp)

// getTodayValue()
// Sum today's logs' totalEarnings

// getHabitValue(habitId)
// Sum all logs for this habit
```

### 4. Bottom Sheet Animation

```css
/* Bottom sheet entrance */
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* Expand to full screen when Add tapped */
@keyframes expandToFullScreen {
  from { 
    max-height: 70vh; 
    border-radius: 20px 20px 0 0;
  }
  to { 
    max-height: 100vh; 
    border-radius: 0;
  }
}
```

### 5. Responsive Breakpoints

```css
/* Mobile first */
/* Base styles: 320px - 768px */

/* Tablet */
@media (min-width: 768px) {
  .container { max-width: 768px; }
}

/* Desktop (center in viewport) */
@media (min-width: 1024px) {
  .container { 
    max-width: 768px; 
    margin: 0 auto;
  }
}
```

---

## Testing Checklist

### User Flow Testing
- [ ] Can open bottom sheet via FAB
- [ ] Can select habit to log
- [ ] Can complete build habit log
- [ ] Can complete break habit log with top-up
- [ ] Can tap "Add" from bottom sheet
- [ ] Can create new build habit
- [ ] Can create new break habit
- [ ] Can view habit detail page
- [ ] Can navigate between all tabs
- [ ] Portfolio value updates after logging

### Visual Testing
- [ ] Portfolio header displays correctly
- [ ] Habit cards render properly
- [ ] Build habits show checkmarks
- [ ] Break habits show shields
- [ ] Sparklines render
- [ ] Bottom sheet slides up smoothly
- [ ] Form expands to full screen
- [ ] Charts display in detail view
- [ ] All colors match design tokens
- [ ] Spacing is consistent

### Edge Cases
- [ ] Empty state (no habits)
- [ ] Single habit
- [ ] 10+ habits
- [ ] Very long habit names
- [ ] $0 portfolio value
- [ ] Large portfolio value ($1000+)
- [ ] Logging without internet (localStorage)
- [ ] Break habit without top-up
- [ ] Break habit with $0 top-up

### Accessibility
- [ ] All interactive elements keyboard accessible
- [ ] Focus states visible
- [ ] ARIA labels on icon buttons
- [ ] Color contrast meets WCAG AA
- [ ] Form inputs have labels
- [ ] Error messages announced

---

## Known Limitations & Future Considerations

### POC Scope Limitations

**Not included in this redesign:**
- Backend/server integration
- Real bank account connections (Plaid)
- Actual money transfers
- Multi-user/family features
- Behavior markets (Phase 8)
- Health device integrations
- Automated habit detection

**Acceptable for POC:**
- localStorage only
- Manual logging only
- Simulated money transfers
- Single user

### Post-POC Enhancements

**Phase 2 (After validation):**
- Backend API integration
- User authentication
- Cloud data sync
- Real bank connections

**Phase 3 (Scale):**
- Social features
- Habit templates
- Streak bonuses
- Achievement system (subtle, not gamified)

**Phase 8 (Long-term):**
- Behavior markets
- Habit ticker system
- Collective behavior data
- Market-like interface

---

## Questions to Answer During Implementation

1. **What happens when user logs same habit twice in one day?**
   - Allow it (sum the amounts)
   - Or prevent it for flat-rate habits?

2. **Can users edit/delete past logs?**
   - Yes (show edit button in activity feed)
   - Should deletion reduce portfolio value?

3. **What's the min/max rate amounts?**
   - Suggest: $0.01 min, $10.00 max per unit
   - To prevent abuse and keep sustainable

4. **How long do streaks persist after a miss?**
   - Current: resets to 0
   - Consider: grace period of 1 day?

5. **Should portfolio value ever decrease?**
   - If user deletes logs, yes
   - Otherwise it only grows

6. **What triggers weekly transfer?**
   - Automatic on Sunday at 11:59pm?
   - Manual "Transfer Now" button?
   - Both options?

---

## Conclusion

This redesign transforms Flux from a habit tracker with money into an investment portfolio for behavior. The interface language, visual design, and interaction patterns all reinforce the core mission: "invest in yourself, literally."

Key success metrics post-implementation:
- Does it *feel* like an investment portfolio?
- Is logging fast and frictionless?
- Does the money feel real but not stressful?
- Would users show this to friends?

The mockups in this project demonstrate the complete user journey. Implementation should follow the phased approach, starting with Portfolio view and working through FAB, forms, and detail pages.

Remember: This is a POC. Validate the core concept (behavior change + financial incentives) before building complex backend infrastructure. Keep rates tiny, keep the interface professional, and let the data tell the story.

---

**End of Documentation**

---

## Complete Mockup Reference

All mockups are numbered sequentially to show the complete user journey through the app:

### Core User Flow
1. **Portfolio Home** (`1-portfolio-home-final.html`)
   - Main landing page with portfolio value
   - "Your Positions" view with habit cards
   - FAB and 3-tab navigation

2. **FAB Bottom Sheet** (`2-fab-bottom-sheet-final.html`)
   - Quick logging interface
   - Habit list with "Add" button in header
   - Shows completion status for each habit

3. **Add Position Form** (`3-add-position-form-final.html`)
   - Full-screen form for creating habits
   - Build vs Break toggle
   - Rate structure, base rate, goals
   - Live preview card

4. **Log Build Habit** (`4-log-activity-build-final.html`)
   - Logging interface for positive habits
   - Amount input with quick buttons
   - Date/time selection
   - Earnings preview

5. **Log Resist Habit** (`5-log-activity-resist-final.html`)
   - Logging interface for breaking habits
   - Base rate display
   - Optional top-up field
   - Total earnings calculation

6. **Habit Detail Page** (`6-habit-detail-page-final.html`)
   - Complete position overview
   - Large activity chart with time toggles
   - Streaks statistics
   - Recent activity feed
   - Collapsible position details

### Onboarding Flow
7. **Welcome Screen** (`7-onboarding-welcome.html`)
   - First impression
   - Value proposition
   - Feature overview

8. **How It Works** (`8-onboarding-how-it-works.html`)
   - Three-step explanation
   - Visual examples
   - Key sustainability message

9. **Profile Setup** (`9-onboarding-profile-setup.html`)
   - Name and email entry
   - Avatar placeholder
   - Privacy notice

### Additional Pages
10. **Activity Feed** (`10-activity-feed.html`)
    - All logs across habits
    - Grouped by date
    - Filter options and summary stats

11. **Account Page** (`11-account-page.html`)
    - Profile overview
    - Stats grid
    - Menu navigation to settings

12. **Settings Page** (`12-settings-page.html`)
    - Notifications preferences
    - Transfer schedule
    - Appearance and privacy
    - Danger zone

13. **Bank Connection** (`13-bank-connection-setup.html`)
    - Simulated Plaid flow
    - Security messaging
    - Bank selection interface

### How to Use These Mockups

**During Design Review:**
- Open all mockups in browser tabs
- Walk through complete user journeys
- Verify visual consistency across screens
- Check that all flows connect logically

**During Implementation:**
- Reference specific mockup for each component
- Extract exact colors, spacing, typography
- Maintain interaction patterns shown in mockups
- Use as specification for React components

**For Testing:**
- Compare built components against mockups
- Verify responsive behavior
- Check that animations match intent
- Ensure all states are handled

---

**End of Documentation**
