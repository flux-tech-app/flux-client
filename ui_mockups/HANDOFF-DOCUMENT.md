# Flux Redesign - Handoff Document

**Date:** November 5, 2025  
**Project:** Flux - "Invest in yourself, literally"  
**Status:** Design phase complete, ready for implementation  
**Next Step:** Fresh project setup and component implementation

---

## Where We Left Off

### What We Accomplished

**Completed a complete UI/UX redesign** of Flux, transforming it from a "habit tracker with money" into a professional "investment portfolio for behavior change."

**Created 13 complete mockups** showing every screen and flow:
- Core user flow (Portfolio, FAB, logging, habit details)
- Onboarding (Welcome, How It Works, Profile Setup)
- Additional pages (Activity, Account, Settings, Bank Connection)
- All mockups use professional SVG icons (no emojis)

**Documented all design decisions:**
- Portfolio-first UI approach
- Build vs Break habit types
- Money mechanics (base rates + optional top-up)
- FAB interaction patterns
- 3-tab navigation (down from 5)
- Complete visual design system

### Key Decision Made

**Ryan decided to start fresh** rather than refactor the existing project:
- Current codebase is messy (wrong names, tangled components)
- Redesign is so different it's essentially a rebuild anyway
- Will not salvage calculation logic and data structures from old project
- Clean slate = better architecture, cleaner code

---

## The Complete Design Vision

### Core Mission
"Invest in yourself, literally" - Behavior change platform using financial incentives, not gamification.

### UI Transformation

**From (old):**
- "Today's Focus" with habit checklist
- Weekly summary card with redundant stats
- Money scattered everywhere
- Felt like gamified todo list

**To (new):**
- Portfolio header showing total value ($127.50)
- Habits as "positions" (investment language)
- Single FAB for all actions
- Professional investment portfolio aesthetic

### Navigation Structure

**3 tabs (not 5):**
1. Portfolio (main view)
2. Activity (all logs)
3. Account (profile + settings)

**Removed:** Savings (merged into Portfolio), Markets (Phase 8, 12+ months away)

### Habit Types

**Build Habits (✓ icon):**
- Positive behaviors: Cardio, Journaling, Reading
- Fixed rates: $0.05/min, $0.50/completion
- Language: "Completed", "Done"

**Break Habits (shield icon):**
- Negative behaviors: Doordash, Vaping, Doomscrolling
- Base rate ($1-2) + optional top-up for actual savings
- Language: "Resisted", "Clean"

### Money Mechanics

**Key rules:**
- Money is required (with trial mode consideration)
- Base rates stay tiny ($5-10/week typical)
- Weekly transfers to avoid micro-transactions
- Track ONE number: Flux balance (what's in the app)
- Optional top-up for break habits (user enters actual savings)

**Example:**
- Resist Doordash = $1 base + $28.50 top-up = $29.50 total logged

---

## Complete Mockup Reference

All mockups are in the outputs folder, numbered sequentially:

### Core Flow (1-6)
1. **1-portfolio-home-final.html** - Main view with portfolio value, habit cards, FAB
2. **2-fab-bottom-sheet-final.html** - Quick logging sheet with "Add" button
3. **3-add-position-form-final.html** - Full-screen form for creating habits
4. **4-log-activity-build-final.html** - Logging interface for positive habits
5. **5-log-activity-resist-final.html** - Logging interface with optional top-up
6. **6-habit-detail-page-final.html** - Full position view with charts

### Onboarding (7-9)
7. **7-onboarding-welcome.html** - First impression, value prop
8. **8-onboarding-how-it-works.html** - Three-step education
9. **9-onboarding-profile-setup.html** - Name/email entry

### Additional Pages (10-13)
10. **10-activity-feed.html** - All logs grouped by date
11. **11-account-page.html** - Profile, stats, menu navigation
12. **12-settings-page.html** - Notifications, transfer schedule, preferences
13. **13-bank-connection-setup.html** - Simulated Plaid flow

### Complete Documentation
**FLUX-REDESIGN-DOCUMENTATION.md** - Full design system documentation (50+ pages)

---

## Build Everything Fresh

**Ryan's decision: Don't salvage anything from the old project.**

### Why This Is Right:
- Old data structures don't match new terminology ("habits" → "positions")
- Old fields don't support new features (allowTopUp, type: build/break)
- Old calculation logic might have bugs or unnecessary complexity
- Starting fresh = clean architecture from day 1

### Old Project as Reference Only:
- Keep it available to remember how things worked
- Don't copy/paste any code
- Build new implementations based on what you learned

### What We'll Build New:
- Data structures designed for new UI
- Calculations built clean and simple
- Context API with proper structure
- localStorage with clean save/load
- All components from scratch against mockups

---

## New Project Setup Steps

### 1. Create New React Project

```bash
cd C:\Users\watte\OneDrive\Documents
npm create vite@latest flux-v2 -- --template react
cd flux-v2
npm install
npm install react-router-dom
npm install chart.js react-chartjs-2
```

### 2. Create Folder Structure

```bash
mkdir src/components
mkdir src/pages
mkdir src/context
mkdir src/utils
mkdir src/styles
```

### 3. Connect to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Flux v2"
git branch -M main
git remote add origin https://github.com/vvatters/[repo-name].git
git push -u origin main
```

### 4. Deploy to Vercel

- Go to vercel.com
- Import GitHub repo
- Click Deploy
- Auto-deploys on every push

---

## Implementation Order

### Phase 1: Foundation (Start Here)
1. Set up new project (commands above)
2. Create folder structure
3. Copy calculation utilities from old project
4. Set up basic routing structure
5. Create HabitContext with data structures

### Phase 2: Core Components
6. Build Portfolio.jsx (new Home)
7. Build HabitCard component (simplified)
8. Build Navigation component (3 tabs)
9. Test portfolio view rendering

### Phase 3: Actions
10. Build FAB component
11. Build BottomSheet component
12. Wire up FAB → BottomSheet interaction
13. Build AddHabit form page
14. Build LogActivity page (build variant)
15. Add break variant logging
16. Test complete flows

### Phase 4: Detail View
17. Build HabitDetail page
18. Implement chart section
19. Implement streaks section
20. Implement activity feed
21. Wire up navigation

### Phase 5: Additional Pages
22. Build Activity feed page
23. Build Account page
24. Build Settings page
25. Build Onboarding flow
26. Build Bank connection (mock for POC)

### Phase 6: Polish
27. Animations and transitions
28. Error states
29. Empty states
30. Loading states
31. Accessibility review

---

## File Structure (Target)

```
flux-v2/
├── src/
│   ├── components/
│   │   ├── FAB.jsx
│   │   ├── BottomSheet.jsx
│   │   ├── HabitCard.jsx
│   │   └── Navigation.jsx
│   ├── pages/
│   │   ├── Portfolio.jsx
│   │   ├── HabitDetail.jsx
│   │   ├── AddHabit.jsx
│   │   ├── LogActivity.jsx
│   │   ├── Activity.jsx
│   │   ├── Account.jsx
│   │   ├── Settings.jsx
│   │   └── Onboarding.jsx
│   ├── context/
│   │   └── HabitContext.jsx
│   ├── utils/
│   │   ├── calculations.js
│   │   └── formatters.js
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

---

## Technical Specifications

### Dependencies
```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "chart.js": "^4.x",
  "react-chartjs-2": "^5.x"
}
```

### Core Routes
```javascript
<Routes>
  <Route path="/" element={<Portfolio />} />
  <Route path="/habit/:id" element={<HabitDetail />} />
  <Route path="/add" element={<AddHabit />} />
  <Route path="/log/:habitId" element={<LogActivity />} />
  <Route path="/activity" element={<Activity />} />
  <Route path="/account" element={<Account />} />
  <Route path="/settings" element={<Settings />} />
  <Route path="/onboarding" element={<Onboarding />} />
</Routes>
```

### Context Structure
```javascript
const HabitContext = {
  habits: [],
  logs: [],
  addHabit: (habit) => {},
  updateHabit: (id, updates) => {},
  deleteHabit: (id) => {},
  addLog: (log) => {},
  updateLog: (id, updates) => {},
  deleteLog: (id) => {},
  getHabitStats: (habitId) => {},
  getTotalEarnings: () => {},
  getTodayEarnings: () => {},
}
```

---

## Visual Design Tokens

### Colors
```css
/* Primary Blues */
--primary: #2563eb;
--primary-dark: #1d4ed8;
--primary-light: #eff6ff;

/* Success/Earnings Greens */
--success: #10b981;
--success-dark: #15803d;
--success-light: #f0fdf4;

/* Resistance/Break Yellows */
--amber: #f59e0b;
--amber-dark: #92400e;
--amber-light: #fef3c7;

/* Neutrals */
--gray-900: #111827; /* headings */
--gray-700: #374151; /* body */
--gray-500: #6b7280; /* secondary */
--gray-300: #d1d5db; /* borders */
--gray-100: #f3f4f6; /* backgrounds */
```

### Typography
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Scale */
--text-app-logo: 22px;
--text-page-title: 17px;
--text-section-title: 18px;
--text-card-title: 16px;
--text-body: 14-15px;
--text-small: 12-13px;
--text-label: 11px;
```

### Spacing (4px base unit)
- 4px, 8px, 12px, 16px (standard padding)
- 24px, 32px (section spacing)

### Border Radius
- Small: 8px (buttons, inputs)
- Medium: 10px (cards)
- Large: 12px (major cards)
- XL: 20px (bottom sheet)
- Circle: 50% (FAB, icons)

---

## Key Implementation Notes

### 1. Build vs Break Logic

```javascript
// In habit data model:
{
  type: 'build' | 'break',  // NEW
  allowTopUp: boolean,      // NEW (for break habits)
}

// In log data:
{
  baseEarnings: number,     // calculated from rate
  topUpAmount: number,      // optional, break habits only
  totalEarnings: number,    // base + topUp
}
```

### 2. FAB Interaction Pattern

```
User taps FAB
  ↓
Bottom sheet slides up (70% height)
  - Shows list of habits for quick logging
  - "Add" button in top right
  ↓
Two paths:
  1. Tap habit → LogActivity page
  2. Tap "Add" → Sheet expands to full screen → AddHabit form
```

### 3. Portfolio Calculations

```javascript
getTotalValue() {
  // Sum all logs' totalEarnings (includes base + topUp)
  return logs.reduce((sum, log) => sum + log.totalEarnings, 0)
}

getTodayValue() {
  // Sum today's logs only
  const today = new Date().toDateString()
  return logs
    .filter(log => new Date(log.timestamp).toDateString() === today)
    .reduce((sum, log) => sum + log.totalEarnings, 0)
}
```

### 4. Bottom Sheet Animation

```css
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* When expanding to full screen for Add */
@keyframes expandToFullScreen {
  from { max-height: 70vh; }
  to { max-height: 100vh; }
}
```

---

## Common Patterns to Follow

### Component Structure
```javascript
// Every component follows this pattern:
export default function ComponentName() {
  // 1. Hooks at top
  const navigate = useNavigate()
  const { habits } = useHabits()
  const [state, setState] = useState()
  
  // 2. Derived state
  const filteredData = useMemo(() => {...}, [deps])
  
  // 3. Event handlers
  const handleAction = () => {...}
  
  // 4. Return JSX
  return (...)
}
```

### File Naming
- Components: PascalCase (HabitCard.jsx)
- Pages: PascalCase (Portfolio.jsx)
- Utils: camelCase (calculations.js)
- All React components use .jsx extension

### Import Order
```javascript
// 1. React imports
import { useState, useEffect } from 'react'

// 2. Third-party
import { useNavigate } from 'react-router-dom'

// 3. Local components
import HabitCard from '../components/HabitCard'

// 4. Context/utils
import { useHabits } from '../context/HabitContext'

// 5. Icons (if using lucide-react)
import { Plus, Settings } from 'lucide-react'
```

---

## Questions to Answer During Implementation

1. **Editing logs:** Allow edit/delete from activity feed? How does that affect portfolio value?
2. **Rate limits:** Min/max amounts for rates? ($0.01 min, $10 max?)
3. **Streak grace period:** Reset to 0 immediately or allow 1-day miss?
4. **Multiple logs per day:** Allow logging same habit multiple times? (For flat-rate habits)
5. **Weekly transfer trigger:** Automatic Sunday 11:59pm? Manual button? Both?

---

## Critical Reminders

### Must-Dos:
- **Use proper SVG icons** (no emojis, as Ryan requested)
- **Keep language consistent:** "Positions" not "Habits" in UI
- **Portfolio-first:** Total value is the hero, not individual stats
- **Money mechanics:** Base rate + optional top-up for break habits
- **Professional aesthetic:** Coinbase-inspired, not gamified

### Never-Dos:
- Don't use emoji icons anywhere
- Don't show rates on portfolio card face (only in detail view)
- Don't use gradients on main habit cards
- Don't create "Today's Focus" or "Weekly Summary" components
- Don't add Markets tab until Phase 8

---

## Resources

### All Design Files
- **Mockups:** 13 HTML files in outputs folder (1-13)
- **Documentation:** FLUX-REDESIGN-DOCUMENTATION.md (complete spec)
- **Old Project:** C:\Users\watte\OneDrive\Documents\flux (for salvaging logic)

### Ryan's Preferences
- Professional, polished solutions over conservative approaches
- Mobile-first responsive design
- Apple-level polish and attention to detail
- Artifact-based code delivery (downloadable files)
- Concise feedback without excessive code pasting

### Development Environment
- Windows with PowerShell
- Node.js v25.1.0
- Git with GitHub Pro
- Vite for React projects
- VS Code (assumed)

---

## Next Session Action Items

**Immediate:**
1. Confirm project setup approach (fresh start agreed)
2. Run setup commands to create flux-v2 project
3. Verify localhost works (npm run dev)

**Then:**
4. I'll create all initial component files
5. Ryan downloads and organizes into project structure
6. Start with Portfolio.jsx + HabitCard implementation
7. Get basic portfolio view rendering

**Goal for next session:** Portfolio page showing habit cards with proper data flow.

---

## Final Notes

This is a **complete redesign, not a refactor.** We're building a professional investment portfolio app for behavior change, not iterating on a habit tracker.

The mockups are the source of truth. If something in code doesn't match the mockups, the mockups win.

Ryan knows React basics but prefers detailed implementation guidance. Provide complete, production-ready code in downloadable files.

Start fresh, build clean, ship professional.

---

**End of Handoff Document**
