# Habit Detail Analytics Implementation - Handoff Document

## Overview

This document outlines the implementation of a dual-chart analytics system for the Habit Detail page: a toggle chart (Progress vs Earnings views) and a monthly calendar heatmap. These features provide users with sophisticated behavioral insights while maintaining Flux's investment portfolio aesthetic.

**Design Priority**: Data accuracy, temporal precision, and smooth user experience are critical. These charts must be intelligent, performant, and perfectly synchronized with the app's existing data model.

---

## Design Decisions Summary

### Toggle Chart (Main Feature)
- **Two views**: Progress (behavioral metric) and Earnings (financial metric)
- **Time periods**: 7D, 30D, 90D, 1Y, All
- **Progress view adapts to habit type**:
  - Duration habits → Bar chart showing minutes/hours
  - Count habits → Bar chart showing units (glasses, reps, etc.)
  - Binary habits → Bar chart showing daily completion (100% or 0%)
- **Earnings view**: Line chart with gradient fill and data points (blue theme)
- **Summary metric card**: Shows aggregated stat for current view/period

### Calendar Heatmap (Below Chart)
- **Always shows current month only** (e.g., November 2025)
- **Compact design**: Tight spacing, small cells, flows seamlessly below toggle chart
- **Color coding adapts to habit type**:
  - Binary: Green (completed), Red (missed), Gray (future)
  - Quantitative: Gradient intensity based on value achieved
- **Interactive**: Hover/tap shows day details

### Mockup References
All mockups available at start of previous conversation:
- `heatmap-final-compact.html` - Complete layout with toggle + heatmap
- `earnings-view-final-blue.html` - Earnings view with gradient + data points
- Option 3C toggle approach from initial exploration

---

## Critical Data Accuracy Requirements

### 1. Date/Time Precision
**All timestamps must use consistent timezone handling**:
```javascript
// ALWAYS use date-fns for date operations
import { format, startOfDay, endOfDay, isToday, isFuture } from 'date-fns';

// Store dates as ISO strings in localStorage
const log = {
  habitId: "hab_123",
  date: format(new Date(), 'yyyy-MM-dd'), // "2025-11-08"
  timestamp: new Date().toISOString(), // Full timestamp for sorting
  // ...
};

// When filtering by date range
const logsInRange = logs.filter(log => {
  const logDate = new Date(log.date);
  return logDate >= startDate && logDate <= endDate;
});
```

**Key principle**: Never rely on browser timezone assumptions. Always be explicit about date boundaries.

### 2. Value Tracking Accuracy
**Each habit type requires specific data capture**:

```javascript
// Duration-based (cardio, meditation, etc.)
const log = {
  habitId: "hab_123",
  date: "2025-11-08",
  duration: 45, // ALWAYS in minutes
  earnings: 2.25, // Calculated: 45 * $0.05
  completed: true
};

// Count-based (water, pushups, etc.)
const log = {
  habitId: "hab_456",
  date: "2025-11-08",
  count: 8, // Number of units
  earnings: 4.00, // Calculated: 8 * $0.50
  completed: true
};

// Binary/completion-based (reading, meditation)
const log = {
  habitId: "hab_789",
  date: "2025-11-08",
  completed: true,
  earnings: 0.50 // Flat rate
  // NO duration or count
};
```

**Validation rules**:
- Duration must be positive integer (minutes)
- Count must be positive integer
- Earnings must match rate calculation exactly
- One log per habit per day maximum (update existing if re-logging)

### 3. Chart Data Aggregation

**Progress View Calculations**:
```javascript
// For duration habits - show average per logged day
function calculateProgressData(habit, logs, period) {
  // Filter logs to period
  const periodLogs = filterLogsByPeriod(logs, period);
  
  // Group by date
  const logsByDate = groupByDate(periodLogs);
  
  // For each date in period, get value or null
  return period.dates.map(date => {
    const log = logsByDate[date];
    return {
      date: date,
      value: log ? log.duration || log.count || (log.completed ? 100 : 0) : null,
      hasData: !!log
    };
  });
}

// Calculate summary metric
function calculateAverageMetric(logs, habit) {
  if (habit.rateType === 'completion') {
    // Binary: show completion rate
    const scheduledDays = logs.filter(l => l.wasScheduled).length;
    const completedDays = logs.filter(l => l.completed && l.wasScheduled).length;
    return `${completedDays}/${scheduledDays} (${Math.round(completedDays/scheduledDays * 100)}%)`;
  } else if (habit.rateType === 'per-minute') {
    // Duration: show average minutes
    const totalMinutes = logs.reduce((sum, l) => sum + l.duration, 0);
    return `${Math.round(totalMinutes / logs.length)} min`;
  } else {
    // Count: show average units
    const totalCount = logs.reduce((sum, l) => sum + l.count, 0);
    return `${Math.round(totalCount / logs.length)} ${habit.unit}`;
  }
}
```

**Earnings View Calculations**:
```javascript
// Show daily earnings for period
function calculateEarningsData(logs, period) {
  const logsByDate = groupByDate(logs);
  
  return period.dates.map(date => {
    const log = logsByDate[date];
    return {
      date: date,
      earnings: log ? log.earnings : 0,
      hasData: !!log
    };
  });
}

// Calculate total earnings for period
function calculateTotalEarnings(logs) {
  return logs.reduce((sum, log) => sum + log.earnings, 0);
}

// Calculate change from previous period
function calculateEarningsChange(currentLogs, previousLogs) {
  const current = calculateTotalEarnings(currentLogs);
  const previous = calculateTotalEarnings(previousLogs);
  const change = current - previous;
  const percentChange = previous > 0 ? (change / previous * 100) : 0;
  
  return {
    amount: change,
    percent: percentChange,
    direction: change >= 0 ? 'up' : 'down'
  };
}
```

### 4. Calendar Heatmap Data
**Must handle month boundaries correctly**:
```javascript
import { getDaysInMonth, startOfMonth, endOfMonth, getDay, format } from 'date-fns';

function generateCalendarData(habit, logs, year, month) {
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(monthStart);
  const daysInMonth = getDaysInMonth(monthStart);
  
  // Get first day of week (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = getDay(monthStart);
  
  // Create array of all days in month
  const calendarDays = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push({ isEmpty: true });
  }
  
  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dateStr = format(date, 'yyyy-MM-dd');
    const log = logs.find(l => l.date === dateStr);
    
    calendarDays.push({
      date: dateStr,
      day: day,
      isToday: isToday(date),
      isFuture: isFuture(date),
      log: log,
      status: determineStatus(log, date, habit)
    });
  }
  
  return calendarDays;
}

function determineStatus(log, date, habit) {
  if (isFuture(date)) return 'future';
  if (!log) return 'missed'; // Should have logged but didn't
  
  if (habit.rateType === 'completion') {
    return log.completed ? 'completed' : 'missed';
  } else {
    // For quantitative habits, determine intensity
    const maxValue = getMaxValueForPeriod(habit, logs);
    const intensity = Math.ceil((log.duration || log.count) / maxValue * 4);
    return `completed-${intensity}`;
  }
}
```

---

## Implementation Phases

### Phase 1: Data Structure & Calculations (Week 1)

**Goal**: Build calculation layer that feeds charts

**Files to create/update**:
- `src/utils/chartCalculations.js` (NEW)
- `src/utils/dateHelpers.js` (NEW)
- Review `src/utils/calculations.js` (existing)

**Key functions needed**:
```javascript
// chartCalculations.js
export function getProgressChartData(habit, logs, period);
export function getEarningsChartData(logs, period);
export function getCalendarHeatmapData(habit, logs, year, month);
export function calculatePeriodSummary(habit, logs, period, view);

// dateHelpers.js
export function getPeriodDates(period); // Returns array of dates for 7D, 30D, etc.
export function getPreviousPeriodDates(period); // For comparison
export function getCurrentMonthInfo(); // Returns { year, month, daysInMonth, etc. }
```

**Testing priority**:
- Edge cases: month boundaries, leap years, DST changes
- Different habit types produce correct data structures
- Empty states (no logs yet)
- Future dates handled correctly

### Phase 2: Toggle Chart Component (Week 2)

**Goal**: Build reusable chart component with two view modes

**File to create**:
- `src/components/HabitChart/HabitChart.jsx`
- `src/components/HabitChart/HabitChart.css`
- `src/components/HabitChart/index.js`

**Component structure**:
```jsx
<HabitChart
  habit={habit}
  logs={logs}
  view="progress" // or "earnings"
  period="30D" // or "7D", "90D", "1Y", "All"
  onViewChange={(newView) => {}}
  onPeriodChange={(newPeriod) => {}}
/>
```

**Implementation notes**:
- Use `<canvas>` for chart rendering (better performance than SVG for frequent updates)
- Consider Chart.js library for bar/line charts (handles responsiveness well)
- OR build custom SVG implementation if Chart.js is too heavy
- Ensure smooth transitions when toggling views
- Responsive design: chart scales properly on all screen sizes
- Touch interactions: tap on bars/points shows tooltip

**Performance requirements**:
- Chart re-render < 100ms when switching views
- Smooth 60fps animations
- No jank when scrolling page

### Phase 3: Calendar Heatmap Component (Week 3)

**Goal**: Build month calendar with day-level detail

**File to create**:
- `src/components/CalendarHeatmap/CalendarHeatmap.jsx`
- `src/components/CalendarHeatmap/CalendarHeatmap.css`
- `src/components/CalendarHeatmap/index.js`

**Component structure**:
```jsx
<CalendarHeatmap
  habit={habit}
  logs={logs}
  month={11} // 1-12
  year={2025}
  onDayClick={(date) => {}}
/>
```

**Implementation notes**:
- CSS Grid for calendar layout (7 columns)
- Aspect ratio cells maintain square shape
- Hover/tap shows tooltip with day details
- Handles months with different starting days correctly
- Legend shows color meanings

### Phase 4: Integration & Polish (Week 4)

**Goal**: Wire everything into HabitDetail page, add animations, test thoroughly

**File to update**:
- `src/pages/HabitDetail/HabitDetail.jsx`
- `src/pages/HabitDetail/HabitDetail.css`

**Layout structure**:
```jsx
<div className="habit-detail">
  <Header />
  <HeroSection habit={habit} />
  
  {/* Charts section - seamless flow */}
  <div className="analytics-section">
    <HabitChart
      habit={habit}
      logs={logs}
      view={chartView}
      period={chartPeriod}
      onViewChange={setChartView}
      onPeriodChange={setChartPeriod}
    />
    
    <CalendarHeatmap
      habit={habit}
      logs={logs}
      month={currentMonth}
      year={currentYear}
      onDayClick={handleDayClick}
    />
  </div>
  
  <StreaksSection habit={habit} logs={logs} />
  <RecentActivitySection logs={logs} />
  <PositionDetails habit={habit} />
</div>
```

**Polish checklist**:
- [ ] Smooth view toggle animation
- [ ] Loading states for calculations
- [ ] Empty states (no data yet)
- [ ] Error states (invalid data)
- [ ] Accessibility: keyboard navigation, screen readers
- [ ] Mobile gestures: swipe between periods
- [ ] Performance: lazy load charts if below fold

---

## Integration with Existing System

### HabitContext Integration
```javascript
// Charts should read from HabitContext
const { habits, logs } = useHabit();

// Filter logs for specific habit
const habitLogs = logs.filter(log => log.habitId === habit.id);

// Charts must update when logs change
useEffect(() => {
  // Recalculate chart data when logs update
  const chartData = getProgressChartData(habit, habitLogs, period);
  setChartData(chartData);
}, [logs, habit, period]);
```

### Log Activity Integration
When user logs activity:
1. Log is saved to HabitContext
2. HabitContext triggers localStorage sync
3. Charts automatically re-render with new data (via useEffect)

**No manual refresh needed** - charts react to context changes.

### Date Synchronization
```javascript
// Use consistent current date across app
import { getCurrentDate } from '@/utils/dateHelpers';

// In components
const today = getCurrentDate(); // Returns 'yyyy-MM-dd' string

// This ensures "today" is consistent across charts, heatmap, and activity logging
```

---

## Edge Cases & Special Considerations

### 1. First Day Issues
**Problem**: User creates habit today, no historical data exists
**Solution**: 
- Show empty chart with message "Start logging to see your progress"
- Calendar shows today as available to log
- Don't show "missed" status for dates before habit creation

### 2. Incomplete Periods
**Problem**: User views "30D" but habit only exists for 5 days
**Solution**:
- Chart shows all 30 days, bars/points only for days with data
- Metric card indicates "5 days tracked" alongside average
- Don't extrapolate or estimate missing data

### 3. Timezone Changes
**Problem**: User travels across timezones, dates get confusing
**Solution**:
- Always use local timezone for "today"
- Historical logs remain in timezone they were logged
- Display dates in user's current timezone

### 4. Deleted Logs
**Problem**: User deletes a log, charts should update
**Solution**:
- Filter out deleted logs before calculations
- If log is soft-deleted (has `deleted: true` flag), exclude from charts
- If log is hard-deleted (removed from array), charts update automatically via context

### 5. Future Logs
**Problem**: User somehow logs activity for future date (clock issues, manual entry)
**Solution**:
- Validation prevents future logs in LogActivity component
- If future log exists in data, exclude from chart calculations
- Calendar heatmap shows future days as unavailable

### 6. Multiple Logs Per Day
**Problem**: Current data model allows one log per habit per day
**Solution**:
- Enforce one log per day in LogActivity component
- If user logs again same day, update existing log (don't create new)
- Charts always show latest/updated value for each day

---

## Testing Requirements

### Unit Tests
Test all calculation functions:
```javascript
describe('chartCalculations', () => {
  test('handles empty logs array', () => {
    const result = getProgressChartData(habit, [], '30D');
    expect(result).toHaveLength(30);
    expect(result.every(d => d.value === null)).toBe(true);
  });
  
  test('calculates correct average for duration habit', () => {
    const logs = [
      { date: '2025-11-01', duration: 30 },
      { date: '2025-11-02', duration: 45 },
      { date: '2025-11-03', duration: 60 }
    ];
    const avg = calculateAverageMetric(logs, durationHabit);
    expect(avg).toBe('45 min');
  });
  
  test('handles month boundary correctly', () => {
    const data = generateCalendarData(habit, logs, 2025, 11);
    expect(data[0].isEmpty).toBe(true); // Nov 1 is Saturday, first 6 cells empty
    expect(data[6].day).toBe(1); // Nov 1 is in 7th position
  });
});
```

### Integration Tests
Test component interactions:
- Toggle between Progress/Earnings updates chart correctly
- Period change updates both chart and summary metric
- Clicking calendar day shows correct details
- Charts update when new log is added via LogActivity

### Visual Regression Tests
Compare rendered charts against mockups:
- Progress bar chart matches design
- Earnings line chart matches design  
- Calendar heatmap matches design
- Responsive breakpoints work correctly

### Performance Tests
- Chart re-renders in <100ms
- Page scroll remains 60fps with charts visible
- No memory leaks with period switching

---

## UI/UX Requirements

### Animations
**View toggle transition** (Progress ↔ Earnings):
```css
.chart-container {
  transition: opacity 200ms ease-in-out;
}

.chart-container.transitioning {
  opacity: 0;
}
```

**Period change transition**:
- Fade out old data
- Fade in new data
- Total duration: 300ms

**Calendar day hover**:
```css
.day-cell:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 150ms ease-out;
  z-index: 1;
}
```

### Touch Interactions
- Tap on chart bar/point: Show tooltip with details
- Tap on calendar day: Show day summary modal
- Swipe on chart: Switch between periods (optional enhancement)

### Loading States
```jsx
{isCalculating ? (
  <div className="chart-loading">
    <Spinner />
    <p>Calculating your progress...</p>
  </div>
) : (
  <HabitChart data={chartData} />
)}
```

### Empty States
**No data yet**:
```jsx
<div className="empty-state">
  <Icon name="chart-bar" />
  <h3>Start Tracking Your Progress</h3>
  <p>Log your first activity to see charts and insights.</p>
  <Button onClick={goToLogActivity}>Log Activity</Button>
</div>
```

**No data in selected period**:
```jsx
<div className="empty-period">
  <p>No activity in the last {period}.</p>
  <Button onClick={() => setPeriod('All')}>View All Time</Button>
</div>
```

---

## File Structure

```
src/
├── components/
│   ├── HabitChart/
│   │   ├── HabitChart.jsx      # Main toggle chart component
│   │   ├── HabitChart.css
│   │   ├── BarChart.jsx        # Progress view (bars)
│   │   ├── LineChart.jsx       # Earnings view (line + gradient)
│   │   └── index.js
│   │
│   └── CalendarHeatmap/
│       ├── CalendarHeatmap.jsx # Month calendar grid
│       ├── CalendarHeatmap.css
│       ├── DayCell.jsx         # Individual day component
│       └── index.js
│
├── utils/
│   ├── chartCalculations.js   # NEW: Chart data preparation
│   ├── dateHelpers.js          # NEW: Date manipulation utilities
│   ├── calculations.js         # EXISTING: General calculations
│   └── formatters.js           # EXISTING: Format functions
│
└── pages/
    └── HabitDetail/
        ├── HabitDetail.jsx     # UPDATE: Add chart components
        └── HabitDetail.css     # UPDATE: Seamless chart layout
```

---

## Dependencies to Consider

### Option A: Custom Implementation (Recommended)
**Pros**: Full control, lighter bundle, matches design exactly
**Cons**: More development time
**Use**: Native SVG for line chart, CSS for bar chart

### Option B: Chart.js
**Pros**: Battle-tested, handles edge cases, good performance
**Cons**: ~200KB, requires styling customization
```bash
npm install chart.js react-chartjs-2
```

### Option C: Recharts
**Pros**: React-native, declarative API, responsive
**Cons**: ~400KB, heavier than Chart.js
```bash
npm install recharts
```

**Recommendation**: Start with Option A (custom). The charts are relatively simple and custom implementation gives best performance and exact match to design. If timeline is tight, consider Chart.js.

---

## Definition of Done

### Phase 1 Complete When:
- [ ] All calculation functions written and tested
- [ ] Date helpers handle all edge cases
- [ ] Unit tests pass for all scenarios
- [ ] Functions integrated into existing utils

### Phase 2 Complete When:
- [ ] Toggle chart component renders both views
- [ ] Period switching works correctly
- [ ] Charts adapt to all three habit types
- [ ] Summary metric displays correctly
- [ ] Smooth view transitions
- [ ] Mobile responsive

### Phase 3 Complete When:
- [ ] Calendar heatmap renders current month
- [ ] Day cells colored correctly for habit type
- [ ] Today indicator visible
- [ ] Future days grayed out appropriately
- [ ] Hover tooltips work
- [ ] Mobile tap interactions work

### Phase 4 Complete When:
- [ ] Charts integrated into HabitDetail page
- [ ] Layout flows seamlessly (no visual breaks)
- [ ] Charts update when logs change
- [ ] All animations smooth
- [ ] Loading/empty/error states work
- [ ] Tested across habit types
- [ ] Performance benchmarks met
- [ ] Mobile tested on actual device

---

## Success Metrics

After implementation, validate:
1. **Accuracy**: Charts match raw data exactly (spot-check random dates)
2. **Performance**: Page load < 1s, chart toggle < 100ms
3. **Reliability**: No console errors, no data inconsistencies
4. **UX**: Smooth 60fps animations, responsive touch interactions
5. **Code Quality**: Functions are pure, tested, documented

---

## Questions for Implementation Team

Before starting, clarify:
1. Should we implement custom charts or use library? (Recommend custom)
2. Any concerns about date-fns dependency for date operations?
3. Should calendar heatmap allow navigating to previous/next months? (Current spec: no, current month only)
4. Do we need to support multiple logs per day in future? (Current spec: no, one log per habit per day)
5. Should chart period selection persist in localStorage? (User's last selected period remembered)

---

## Risk Areas & Mitigation

### Risk: Date/timezone bugs
**Mitigation**: Use date-fns exclusively, test across timezones, explicit date boundaries

### Risk: Performance with large datasets
**Mitigation**: Limit "All" period to max 365 days, lazy load calendar, optimize re-renders

### Risk: Chart library bundle size
**Mitigation**: Use custom implementation or tree-shake unused Chart.js features

### Risk: Design-dev mismatch
**Mitigation**: Reference mockup files frequently, do visual QA at each phase

### Risk: Calculation errors compound over time
**Mitigation**: Comprehensive unit tests, validation at data entry, periodic data audits

---

## Next Steps

1. Review this document with team
2. Set up development branch: `feature/habit-analytics`
3. Begin Phase 1: Data structure & calculations
4. Daily standups to review progress
5. Phase gates: review/approve before moving to next phase
6. Final QA on mobile device before merging

---

## Contact & Resources

**Mockup Files** (in previous chat):
- `heatmap-final-compact.html`
- `earnings-view-final-blue.html`
- All option 3 exploration files

**Key Principles**:
- Data accuracy is non-negotiable
- Performance must feel instant
- Design should match mockups exactly
- User experience should feel sophisticated and polished

**Remember**: These charts are a key differentiator for Flux. Users will look at them daily. They must be accurate, fast, and beautiful.
