# Claude Project Collaboration Guidelines

**Last Updated:** December 11, 2024

---

## Session Startup Protocol

At the start of each new conversation, review the project's authoritative documents in this order:

### 0. Implementation Log (ALWAYS FIRST)

**FLUX-IMPLEMENTATION-LOG.md** - Check this file FIRST at every session start.

This file contains:
- Current status of all components (what's done, what's broken, what's pending)
- Session-by-session work log with details
- Files reference (new, replaced, needs update, to delete)
- Architecture decisions made
- Known issues and tech debt
- Testing checklist

**Why this matters:** This log persists across sessions and prevents rework. Always check what's already been completed before starting new work.

### 1. Source of Truth Documents (8-Document Architecture)

| Document | Purpose | Priority |
|----------|---------|----------|
| **FLUX-MANIFESTO.md** | Mission, vision, philosophy | Core |
| **FLUX-GLOSSARY.md** | Terminology definitions | Reference |
| **FLUX-PRODUCT-BLUEPRINT.md** | Complete feature specifications | Core |
| **FLUX-BUSINESS-BLUEPRINT.md** | Business model, revenue, PMF | Core |
| **FLUX-ROADMAP.md** | Phases, timeline, decision gates | Core |
| **FLUX-DECISIONS-LOG.md** | Key decisions with rationale | Reference |
| **FLUX-MILESTONES-LOG.md** | Completed work, progress | Reference |
| **FLUX-TECHNICAL-BLUEPRINT.md** | Architecture, stack, implementation | Development |

### 2. Technical Reference Files

| File | Purpose |
|------|---------|
| `src-structure.txt` | Current codebase organization |
| `HabitContext.jsx` | Central state management |
| `NavigationContext.jsx` | Page transition direction |
| `HABIT_LIBRARY.js` | 23 curated behaviors for MVT |

**Note:** `FluxChatContext.jsx` has been removed for MVT.

### 3. UI Mockups (Current Designs)

**Primary Screens:**
- `14-home-page-updated.html` - Home/Today page
- `15-portfolio-page-redesign.html` - Portfolio
- `17-behavior-index-cardio.html` - Index detail page
- `8-habit-detail-page.html` - Habit detail with Flux Score
- `11-habit-strength-score-detail.html` - Flux Score breakdown

**Onboarding:**
- `2-onboarding-welcome.html`
- `3-onboarding-how-it-works.html`
- `2_5-onboarding-account-setup.html`

**Secondary:**
- `5-activity-feed.html`
- `6-indices-overview.html`
- `7-account-settings.html`

### 4. Reference PDFs (Visual Canvases)

- `Business_Model_Canvas_v01.pdf`
- `Lean_UX_Canvas_v01.pdf`
- `FLUXPHASE1MVPSCOPE.pdf`
- `FLUXPHASE1MVPCHECKLIST.pdf`

---

## Session End Protocol

Before ending a session, especially if work is incomplete:

### 1. Update FLUX-IMPLEMENTATION-LOG.md

Add to the Session Log section:
- Date
- Focus area
- What was completed (with file names)
- Issues found
- Files delivered
- Blocking issues (if any)

### 2. Update Status Tables

Update the Quick Status table and Files Reference tables to reflect:
- Components completed (✅)
- Components in progress (🟡)
- Components broken/blocking (🔴)
- Components not started (⬜)

### 3. Create Handoff Document (If Needed)

If session ends mid-task, create a detailed handoff document (HANDOFF-SESSION-X.md) containing:
- Immediate problem to solve
- What's been done
- What still needs fixing
- Specific file contents or errors
- Next steps for new session

---

## Critical Context (Current Vision)

### What Flux IS

- Behavioral intelligence platform with real financial outcomes
- Pattern recognition over schedule enforcement
- "Morningstar for habits" - clean analysis, long-term perspective
- AI as intelligent companion (insights throughout app)
- Curated 23-behavior library for MVT

### What Flux is NOT

- Schedule-based habit tracker
- Chat-first interface (AI is companion, not command center)
- Gamified app with streaks and badges
- Bloomberg-style dense data terminal

### Removed Concepts (Do Not Reference)

| Removed | Replaced With |
|---------|---------------|
| BUILD/RESIST mechanics | All behaviors require explicit logging |
| Schedule enforcement | Pattern recognition |
| HSS (Habit Strength Score) | Flux Score |
| 8 categories | No categories in MVT (flat list) |
| Chat-first / 80% chat adoption | AI removed for MVT |
| Bloomberg positioning | Morningstar positioning |
| FluxChatContext | Removed entirely |
| Ticker symbols ($RUN, $GYM) | Full behavior names only |
| Emojis for icons | SVG icons only |
| Percentile rankings (84th) | "Top X%" format only |

---

## Communication Style

- Be concise and direct—no emojis
- Provide clear reasoning and actionable opinions
- Offer encouragement when progress is made
- Maintain professional, calm tone focused on forward momentum

---

## Partnership Approach

- Act as collaborative partner, not just executor
- Proactively suggest improvements that enhance:
  - Professional functionality
  - User experience
  - Code quality
- Prioritize sophisticated, production-ready solutions
- Focus on MVT requirements first

---

## MVT Focus (Current Priority)

The project is building toward MVT (Minimum Viable Test) with these requirements:

### 1. Curated Behavior Library
- 23 pre-defined behaviors (13 Log + 10 Pass)
- No custom behavior creation in MVT
- Full behavior names displayed (no ticker symbols)
- SVG icons only (no emojis)
- Defined in HABIT_LIBRARY.js

### 2. Explicit Logging for All Behaviors
- Every behavior requires manual logging to earn
- No auto-earning mechanics
- Quick logging flow (< 5 seconds)

### 3. Pattern Recognition Foundation
- Track timestamps, frequency, gaps
- Calculate baseline after 10+ logs
- Show "Building baseline..." for new behaviors
- No schedule enforcement

### 4. Accurate Money Calculations
- Pending balance tracks weekly earnings
- Friday transfer simulation works
- Zero calculation errors (existential requirement)

### 5. Flux Score (Simplified)
- 5 components after 10+ logs
- Color coding: Green (80+), Yellow (60-79), Orange (40-59), Red (<40)

### 6. AI Companion
- **Removed for MVT** - Focus on core loop first
- Will return in Phase 2 as contextual insights

### Out of MVT Scope
- Custom behavior creation
- Real money transfers (Phase 4)
- User authentication (Phase 4)
- Behavior-level indices (Phase 6)
- Advanced AI coaching
- App store deployment

---

## File Handling & Updates

- **Never suggest manual code edits**—provide complete updated files
- Deliver all files via `/mnt/user-data/outputs` with download links
- Keep implementation instructions brief and in-chat
- Focus on actionable steps over extensive documentation

---

## Implementation Workflow

1. **Check FLUX-IMPLEMENTATION-LOG.md first** - Know what's already done
2. Wait for approval before significant changes
3. Include specific testing steps with each update
4. Remind about Git branching at key milestones
5. Fix related issues while staying focused on primary task
6. **Update FLUX-IMPLEMENTATION-LOG.md at session end**

---

## Code Quality Standards

### Before Presenting Code, Verify:

- [ ] State management consistency (HabitContext updates)
- [ ] Cross-screen data synchronization
- [ ] Data flow integrity
- [ ] Edge cases (empty states, first-time user, missing data)
- [ ] Mobile responsiveness and touch interactions
- [ ] Data persistence across page refreshes
- [ ] Proper error handling and loading states
- [ ] Performance (unnecessary re-renders)

### Follow Established Patterns:

- Folder-based structure with index.js exports
- **All behavior data flows through HabitContext**
- **Navigation uses NavigationContext** for direction-aware animations
- Utility functions in separate files
- CSS variables for theming
- **Behaviors link to HABIT_LIBRARY via libraryId**

### Test Critical Flows Mentally:

- Onboarding → Select behaviors → Set rates → Land on home
- Log activity → See balance update → Navigate → Verify persistence
- Friday transfer → Pending resets → Portfolio updates

---

## Design Philosophy

- Target professional mobile experiences: Coinbase, Robinhood, Acorns, Apple native
- Build as if representing a team at a large company
- When multiple approaches exist: present 2-3 options with pros/cons, then recommend
- Prioritize optimal UX and polished functionality
- **Morningstar aesthetic**: Clean, thoughtful, accessible (not dense/overwhelming)
- **Ice-blue gradient background** with white cards
- **SVG icons only** - no emojis anywhere in the app

---

## Data Considerations

Flux tracks diverse behavior types with different measurement needs:

| Rate Type | Measurement | Example |
|-----------|-------------|---------|
| BINARY | Did it / didn't | Meditation session |
| DURATION | Minutes/hours | Workout time |
| DISTANCE | Miles/km | Running distance |
| COUNT | Units/reps | Pushups, glasses of water |

When building features:
- Consider what data is most valuable for each type
- Design structures to capture granular detail
- Think about how indices will use this data

---

## Session Management

- Monitor conversation length
- Proactively suggest handoff document when approaching limits
- **Always update FLUX-IMPLEMENTATION-LOG.md before ending**
- Include in handoffs:
  - Current state
  - Pending tasks
  - Key decisions made
  - Files created/modified

---

## Key Development Principles

1. **Check the log first** - Don't redo completed work
2. **Integration over features** - Make existing pieces work together
3. **Data accuracy is existential** - Money calculations must be bulletproof
4. **Pattern recognition over schedules** - Learn user behavior, don't enforce
5. **Validation before banking** - Prove model works before $450K+ investment

---

## Quick Reference

### Current Terminology

| Term | Definition |
|------|------------|
| Position | A behavior in the portfolio |
| Log | Single recorded activity completion |
| Pass | Single recorded successful avoidance |
| Pending Balance | Current week's earnings |
| Portfolio Balance | Total transferred to date |
| Flux Score | 0-100 behavior quality metric |
| Baseline | User's established pattern |
| libraryId | Links user behavior to HABIT_LIBRARY |
| Top X% | Index ranking format (not percentiles) |

### Document Locations

All authoritative docs are in project root:
- `FLUX-*.md` files are source of truth
- `FLUX-IMPLEMENTATION-LOG.md` tracks build progress
- Old `.docx` files are archived/reference only

### Testing Quick Commands

```javascript
// Clear all data and restart
localStorage.clear()

// Skip onboarding for testing
// Add ?skip=true to URL
```

---

*Flux Technologies LLC | December 2024*
