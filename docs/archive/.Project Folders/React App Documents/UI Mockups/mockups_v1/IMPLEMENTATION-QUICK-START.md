# Habit Analytics Implementation - Quick Start

**Time estimate**: 4 weeks  
**Priority**: High - key differentiator for Flux  
**Complexity**: Medium-High (data accuracy critical)

---

## What We're Building

**Toggle Chart** (main feature):
- Two views: Progress (bars) and Earnings (line)
- Five time periods: 7D, 30D, 90D, 1Y, All
- Adapts to habit type automatically
- Summary metric card above chart

**Calendar Heatmap** (below chart):
- Shows current month only
- Compact, flows seamlessly with chart above
- Color-coded by completion/intensity
- Interactive day cells with hover details

---

## Essential Files to Review

### 1. Start Here
**`HABIT-ANALYTICS-HANDOFF.md`** - Complete implementation guide
- Data structure requirements
- Calculation functions needed
- Component architecture
- Integration points
- Testing requirements

### 2. Visual Reference
**`MOCKUPS-QUICK-REFERENCE.md`** - All mockup files indexed
- Final approved designs
- Color/spacing specs
- Alternative explorations

### 3. Use These Mockups
**Primary references**:
- `heatmap-final-compact.html` - Complete layout (Progress view + calendar)
- `earnings-view-final-blue.html` - Earnings view with gradient + data points

---

## Critical Success Factors

### 1. Data Accuracy (Non-Negotiable)
- Use date-fns for ALL date operations
- Store dates as ISO strings ('yyyy-MM-dd')
- Validate calculations match raw data exactly
- One log per habit per day maximum

### 2. Performance Requirements
- Chart toggle < 100ms
- Page scroll 60fps with charts visible
- No memory leaks when switching periods

### 3. Design Fidelity
- Match mockups exactly (colors, spacing, sizing)
- Seamless flow (no visual breaks)
- Smooth animations (200-300ms transitions)
- Blue theme for earnings (not green)

---

## Implementation Order

### Week 1: Data Layer
**Goal**: Build calculation functions
**Output**: chartCalculations.js, dateHelpers.js
**Deliverable**: Unit-tested calculation functions

**Key functions**:
```javascript
getProgressChartData(habit, logs, period)
getEarningsChartData(logs, period)
getCalendarHeatmapData(habit, logs, year, month)
calculatePeriodSummary(habit, logs, period, view)
```

### Week 2: Toggle Chart
**Goal**: Build chart component with two views
**Output**: HabitChart component
**Deliverable**: Working toggle chart in isolation

**Features**:
- Bar chart for Progress view
- Line chart (gradient + points) for Earnings view
- Period controls (7D, 30D, 90D, 1Y, All)
- View toggle (Progress ↔ Earnings)
- Summary metric card

### Week 3: Calendar Heatmap
**Goal**: Build month calendar component
**Output**: CalendarHeatmap component
**Deliverable**: Working calendar in isolation

**Features**:
- CSS Grid layout (7 columns)
- Current month only
- Day cells with proper coloring
- Today indicator
- Future days grayed out
- Hover tooltips

### Week 4: Integration & Polish
**Goal**: Wire into HabitDetail page, add polish
**Output**: Updated HabitDetail page
**Deliverable**: Production-ready feature

**Tasks**:
- Integrate both components into HabitDetail
- Add animations and transitions
- Implement loading/empty/error states
- Test across all habit types
- Mobile device testing
- Performance optimization

---

## Quick Validation Checklist

Before merging, verify:

### Functionality
- [ ] Toggle between Progress/Earnings works
- [ ] All five periods work correctly
- [ ] Works for all three habit types (duration, count, binary)
- [ ] Calendar shows current month correctly
- [ ] Charts update when logs change
- [ ] Calculations match raw data exactly

### Design
- [ ] Matches `heatmap-final-compact.html`
- [ ] Earnings view matches `earnings-view-final-blue.html`
- [ ] Blue color scheme (not green)
- [ ] Seamless flow between sections
- [ ] Proper spacing and sizing
- [ ] Animations are smooth (60fps)

### Performance
- [ ] Chart toggle < 100ms
- [ ] No lag when scrolling
- [ ] No console errors
- [ ] Works on mobile device

### Edge Cases
- [ ] Empty states (no logs yet)
- [ ] Future dates handled correctly
- [ ] Month boundaries correct
- [ ] Incomplete periods display properly
- [ ] Single-day data doesn't break layout

---

## Common Pitfalls to Avoid

### Date/Time Issues
❌ Don't: Use native Date() without timezone handling
✅ Do: Use date-fns with explicit formats

❌ Don't: Assume "today" is the same everywhere
✅ Do: Use consistent getCurrentDate() helper

### Performance Issues
❌ Don't: Recalculate chart data on every render
✅ Do: Memoize calculations, use useEffect properly

❌ Don't: Render 365 individual SVG elements
✅ Do: Use canvas or optimized SVG paths

### Data Accuracy Issues
❌ Don't: Estimate or interpolate missing data
✅ Do: Show null/empty for days without logs

❌ Don't: Allow future logs
✅ Do: Validate dates before saving

---

## Questions? Start Here

1. **How do I structure the data?**
   → See "Critical Data Accuracy Requirements" in handoff doc

2. **Should I use a chart library?**
   → Recommend custom implementation for best control/performance

3. **How do I handle different habit types?**
   → See "Progress View Calculations" section in handoff doc

4. **What about mobile responsiveness?**
   → Charts are already mobile-first (iPhone 12 Pro viewport)

5. **How do I test this?**
   → See "Testing Requirements" section in handoff doc

---

## Resources

**Documentation**:
- `HABIT-ANALYTICS-HANDOFF.md` - Full implementation guide
- `MOCKUPS-QUICK-REFERENCE.md` - All mockup files
- `FLUX-POC-ROADMAP-v3-INDICES.md` - Project context
- `FLUX-REDESIGN-DOCUMENTATION.md` - Design system

**Mockup Files** (use these as reference):
- `heatmap-final-compact.html` - Main reference
- `earnings-view-final-blue.html` - Earnings view

**Project Files** (existing code):
- `src/context/HabitContext.jsx` - Data source
- `src/utils/calculations.js` - Existing calculations
- `src/pages/HabitDetail/HabitDetail.jsx` - Integration point

---

## Success Criteria

This feature is complete when:
1. Charts accurately reflect user data
2. Performance is instant (< 100ms interactions)
3. Design matches mockups exactly
4. Works across all habit types
5. Mobile experience is smooth
6. All tests pass
7. Code is documented and maintainable

Remember: These charts are a key differentiator. Users will see them daily. They must be accurate, fast, and beautiful.
