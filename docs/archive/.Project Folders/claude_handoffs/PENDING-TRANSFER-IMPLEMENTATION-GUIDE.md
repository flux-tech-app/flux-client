# Pending Transfer Balance - Implementation Guide

## Overview
Add a pending transfer balance display to the Portfolio page that shows:
1. **Portfolio Value** - Money that has been transferred (confirmed earnings)
2. **Pending Balance** - Money earned since last transfer (awaiting Friday transfer)
3. **Transfer Schedule** - Next transfer date display

## Visual Design
See mockup: `portfolio-final-stacked.html` in project outputs

**Layout:**
```
Total Portfolio Value
$127.50
+$43.25 pending · transfers Friday
+$6.00 today
```

**Styling:**
- Pending line: 14px, grey (#9ca3af)
- Small clock icon (14px)
- Neutral, informational appearance
- No background/card treatment

---

## Files That Need Updates

### 1. HabitContext.jsx
**Location:** `/src/context/HabitContext.jsx`

#### Add State Variables
```jsx
// Add to existing state
const [transfers, setTransfers] = useState([]);
const [lastTransferDate, setLastTransferDate] = useState(null);
```

#### Add Calculation Functions
```jsx
// Calculate money that's been transferred
const getTransferredBalance = () => {
  return transfers
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
};

// Calculate money earned since last transfer
const getPendingBalance = () => {
  if (!lastTransferDate) {
    // If no transfers yet, all earnings are pending
    return getTotalEarnings();
  }
  
  const lastTransfer = new Date(lastTransferDate);
  
  return logs
    .filter(log => new Date(log.timestamp) > lastTransfer)
    .reduce((sum, log) => sum + log.totalEarnings, 0);
};

// Manual transfer function (for testing/future use)
const processTransfer = () => {
  const pending = getPendingBalance();
  
  if (pending > 0) {
    const newTransfer = {
      id: Date.now().toString(),
      amount: pending,
      date: new Date().toISOString(),
      status: 'completed'
    };
    
    setTransfers(prev => [...prev, newTransfer]);
    setLastTransferDate(new Date().toISOString());
  }
};
```

#### Update Context Value Export
```jsx
const value = {
  // ... existing exports
  habits,
  logs,
  user,
  addHabit,
  updateHabit,
  deleteHabit,
  addLog,
  updateLog,
  deleteLog,
  getTotalEarnings,
  getTodayEarnings,
  getWeekEarnings,
  getHabitLogs,
  getHabitStats,
  updateUser,
  
  // NEW EXPORTS
  getTransferredBalance,
  getPendingBalance,
  processTransfer,
  transfers,
  lastTransferDate,
};
```

#### Add localStorage Persistence
```jsx
// Save transfers to localStorage
useEffect(() => {
  if (transfers.length > 0) {
    localStorage.setItem('flux-transfers', JSON.stringify(transfers));
  }
}, [transfers]);

useEffect(() => {
  if (lastTransferDate) {
    localStorage.setItem('flux-last-transfer', lastTransferDate);
  }
}, [lastTransferDate]);

// Load transfers on mount (add to existing useEffect or create new one)
useEffect(() => {
  const savedTransfers = localStorage.getItem('flux-transfers');
  const savedLastTransfer = localStorage.getItem('flux-last-transfer');
  
  if (savedTransfers) {
    try {
      setTransfers(JSON.parse(savedTransfers));
    } catch (e) {
      console.error('Error loading transfers:', e);
    }
  }
  
  if (savedLastTransfer) {
    setLastTransferDate(savedLastTransfer);
  }
}, []);
```

---

### 2. calculations.js
**Location:** `/src/utils/calculations.js`

#### Add New Function
```javascript
/**
 * Get the next Friday's date formatted for display
 * @returns {string} - Formatted date like "Friday, Nov 8"
 */
export function getNextTransferDate() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 5 = Friday
  
  // Calculate days until next Friday
  let daysUntilFriday;
  if (dayOfWeek === 5) {
    // Today is Friday - next transfer is in 7 days
    daysUntilFriday = 7;
  } else if (dayOfWeek < 5) {
    // Before Friday this week
    daysUntilFriday = 5 - dayOfWeek;
  } else {
    // After Friday (Sat/Sun) - next Friday
    daysUntilFriday = 7 - dayOfWeek + 5;
  }
  
  const nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + daysUntilFriday);
  
  return nextFriday.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'short', 
    day: 'numeric' 
  });
}
```

---

### 3. Portfolio.jsx
**Location:** `/src/pages/Portfolio.jsx`

#### Update Imports
```jsx
import { getNextTransferDate } from '../utils/calculations';
```

#### Update Component Logic
```jsx
export default function Portfolio() {
  const { 
    habits, 
    logs,
    getTotalEarnings,      // Keep for backward compatibility
    getTransferredBalance, // NEW
    getPendingBalance      // NEW
  } = useHabits();
  
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // CHANGED: Portfolio value now shows only transferred money
  const portfolioValue = getTransferredBalance();
  
  // NEW: Get pending balance
  const pendingBalance = getPendingBalance();
  
  // Existing: Today's earnings for the daily change indicator
  const todayEarnings = calculateTodayEarnings(logs);
  
  // NEW: Get next transfer date
  const nextTransferDate = getNextTransferDate();

  // ... rest of component logic
```

#### Update JSX - Portfolio Value Section
```jsx
{/* Portfolio Value Section */}
<section className="portfolio-value-section">
  <div className="portfolio-label">Total Portfolio Value</div>
  <div className="portfolio-value">{formatCurrency(portfolioValue)}</div>
  
  {/* NEW: Pending transfer line - only show if there's pending balance */}
  {pendingBalance > 0 && (
    <div className="pending-transfer-line">
      <svg className="pending-icon" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
      <span className="pending-amount">+{formatCurrency(pendingBalance)} pending</span>
      <span className="pending-separator">·</span>
      <span className="pending-schedule">transfers {nextTransferDate}</span>
    </div>
  )}
  
  {/* Existing: Daily change indicator */}
  {todayEarnings > 0 && (
    <div className="portfolio-change">
      <svg className="trend-icon" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
      </svg>
      <span className="change-amount">+{formatCurrency(todayEarnings)} today</span>
    </div>
  )}
</section>
```

---

### 4. Portfolio.css
**Location:** `/src/pages/Portfolio.css`

#### Add New Styles
```css
/* Pending transfer line */
.pending-transfer-line {
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.pending-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.pending-amount {
  font-weight: 500;
}

.pending-separator {
  color: #d1d5db;
}

.pending-schedule {
  color: #9ca3af;
}

/* Ensure portfolio-value-section has proper spacing */
.portfolio-value-section {
  /* Add if not already present */
  padding: 24px 16px;
}

.portfolio-label {
  /* Add if not already present */
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
}

.portfolio-value {
  /* Add if not already present */
  font-size: 36px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 6px;
}

.portfolio-change {
  /* Update if needed to ensure proper spacing */
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}
```

---

## Data Structure

### Transfer Object
```javascript
{
  id: "1699380000000",           // Timestamp string
  amount: 43.25,                 // Dollar amount transferred
  date: "2024-11-08T00:00:00Z",  // ISO date string
  status: "completed"            // "completed" | "pending" | "failed"
}
```

### localStorage Keys
- `flux-transfers` - Array of transfer objects
- `flux-last-transfer` - ISO date string of last completed transfer

---

## Testing Checklist

### Initial State (No Transfers)
- [ ] Portfolio value shows $0.00
- [ ] All earnings show as pending
- [ ] Pending line displays total earnings
- [ ] Next Friday date is calculated correctly

### After Adding Logs
- [ ] Pending balance increases when logging habits
- [ ] Portfolio value remains at transferred amount
- [ ] Both balances update correctly
- [ ] Daily change indicator still works

### Visual Testing
- [ ] Pending line is grey (#9ca3af)
- [ ] Clock icon displays at 14px
- [ ] Text is readable and properly spaced
- [ ] Line appears/disappears based on pending balance > 0
- [ ] Layout doesn't shift when pending line shows/hides

### Edge Cases
- [ ] Pending balance of $0 hides the line
- [ ] Very large pending amounts ($1000+) display correctly
- [ ] Next Friday calculation works on different days
- [ ] Works when it's currently Friday
- [ ] Works on Saturday/Sunday (shows next week's Friday)

### Persistence
- [ ] Transfers survive page reload
- [ ] Last transfer date persists
- [ ] Pending balance recalculates correctly after reload

---

## Manual Testing Flow

1. **Start Fresh:**
   - Clear localStorage: `localStorage.clear()`
   - Reload app
   - Portfolio value should be $0.00
   - No pending line should show

2. **Add First Habit & Log:**
   - Create a habit (e.g., Cardio, $0.05/min)
   - Log 30 minutes
   - Should earn $1.50
   - Pending line should appear: "+$1.50 pending · transfers Friday"
   - Portfolio value stays $0.00

3. **Add More Logs:**
   - Log more activities
   - Watch pending balance increase
   - Portfolio value should remain $0.00

4. **Simulate Transfer (Dev Tool):**
   - Open browser console
   - Run: `localStorage.setItem('flux-last-transfer', new Date().toISOString())`
   - Reload page
   - Portfolio value should now show previous pending amount
   - Pending should reset to new earnings since refresh

5. **Test Date Calculation:**
   - Check that "transfers Friday" shows correct date
   - Test on different days of the week

---

## Future Enhancements (Not in this implementation)

### Automatic Transfers
- Scheduled job to run every Friday at 11:59 PM
- Automatically calls `processTransfer()`
- Sends notification to user

### Transfer History
- View in Account page
- List of past transfers with dates and amounts
- "Transaction History" section

### Transfer Settings
- Change transfer day (Settings page)
- Set minimum transfer amount
- Enable/disable automatic transfers

### Real Money Integration
- Connect to Plaid for actual bank transfers
- Move from simulated to real transfers
- Requires backend API

---

## Implementation Order

1. **HabitContext.jsx** - Add state and functions (core logic)
2. **calculations.js** - Add date calculation utility
3. **Portfolio.jsx** - Update component to use new functions
4. **Portfolio.css** - Add styling
5. **Test** - Verify everything works
6. **Commit** - Git commit with clear message

---

## Git Commit Message
```
feat: add pending transfer balance display

- Add transfer tracking to HabitContext
- Separate transferred vs pending balance
- Display pending line on Portfolio page
- Calculate next Friday transfer date
- Grey, informational styling
- Persist transfers to localStorage

Portfolio now shows:
- Confirmed transferred money
- Pending balance awaiting transfer
- Next Friday transfer date
```

---

## Common Issues & Solutions

### Issue: Pending balance not updating
**Solution:** Check that `getTotalEarnings()` and `getPendingBalance()` are being called correctly in Portfolio component

### Issue: Transfer date shows wrong day
**Solution:** Verify timezone handling in `getNextTransferDate()` function

### Issue: Portfolio value still showing total earnings
**Solution:** Make sure Portfolio.jsx is calling `getTransferredBalance()` instead of `getTotalEarnings()`

### Issue: Pending line always visible even at $0
**Solution:** Check conditional rendering: `{pendingBalance > 0 && ...}`

### Issue: Styles not applying
**Solution:** Verify Portfolio.css is imported in Portfolio.jsx

---

## Dependencies
No new dependencies required - uses existing:
- React (useState, useEffect, useContext)
- React Router (already in project)
- Existing utility functions
- localStorage API

---

## Notes
- This is a visual/UX update - doesn't change core habit tracking logic
- Transfers are simulated (no actual bank integration)
- Real money transfers will come in Phase 2 post-POC validation
- Friday transfer day is hardcoded but can be made configurable later
- All monetary amounts remain in cents precision (2 decimal places)

---

## Questions to Clarify Before Implementation

1. Should portfolio value start at $0 (all earnings pending) or should we seed an initial transfer?
2. When user first loads app, should we set `lastTransferDate` to "last Friday" automatically?
3. Should pending balance display even if it's $0.00, or hide completely?
4. Do we want a "Transfer Now" button for manual testing, or keep it automatic?

**Current assumptions (can change):**
- Portfolio starts at $0, all earnings are pending
- lastTransferDate is null until first "transfer" happens
- Pending line hidden when balance is $0
- No manual transfer button (automatic only)
