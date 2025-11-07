# Resist/Break Habit Shield Icons

## The Problem
Your current beta uses a **flag icon** for resist/break habits.
The mockup design uses **shield icons** - much better visual metaphor for "defending against bad habits."

---

## Two Shield Variants

The mockup actually uses **two different shield icons** depending on context:

### 1. Plain Shield (for habit cards)
Small, clean, minimal - perfect for completion status on portfolio cards.

### 2. Shield with Exclamation (for logging pages)
Larger, more emphatic - emphasizes "I resisted this temptation!"

---

## Plain Shield (Portfolio Cards)

### React Component Version
```jsx
const ShieldIcon = ({ size = 12, color = "#f59e0b" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 20 20" 
    fill={color}
  >
    <path 
      fillRule="evenodd" 
      d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944z" 
      clipRule="evenodd" 
    />
  </svg>
);
```

### Inline JSX Version
```jsx
<svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-amber-500">
  <path 
    fillRule="evenodd" 
    d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944z" 
    clipRule="evenodd" 
  />
</svg>
```

---

## Shield with Exclamation (Log Activity)

### React Component Version
```jsx
const ShieldExclamationIcon = ({ size = 32, color = "#f59e0b" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 20 20" 
    fill={color}
  >
    <path 
      fillRule="evenodd" 
      d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" 
      clipRule="evenodd" 
    />
  </svg>
);
```

### Inline JSX Version
```jsx
<svg viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-amber-500">
  <path 
    fillRule="evenodd" 
    d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" 
    clipRule="evenodd" 
  />
</svg>
```

---

## Where to Use Each Variant

### Use PLAIN SHIELD for:

**1. Portfolio Habit Cards (HabitCard.jsx)**
Small completion status indicator:
```jsx
{habit.type === 'resist' && (
  <div className="checkmark">
    <svg style={{ width: '12px', height: '12px', color: '#f59e0b' }} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944z" clipRule="evenodd" />
    </svg>
  </div>
)}
```

**2. Bottom Sheet (BottomSheet.jsx)**
When listing resist habits in compact view:
```jsx
{habit.type === 'resist' && (
  <svg className="w-5 h-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944z" clipRule="evenodd" />
  </svg>
)}
```

---

### Use SHIELD WITH EXCLAMATION for:

**1. Log Activity Page (LogActivity.jsx)**
In the resistance badge - emphasizes the action:
```jsx
<div className="resistance-badge">
  <svg style={{ width: '32px', height: '32px', color: '#f59e0b' }} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
  </svg>
  <span>I resisted this temptation</span>
</div>
```

**2. Activity Feed (Activity.jsx)**
When showing resist logs with more detail:
```jsx
<div className="activity-icon" style={{ color: '#f59e0b' }}>
  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
  </svg>
</div>
```

---

## Design Rationale

**Plain Shield:** Clean, minimal - doesn't overpower the habit card
**Shield with Exclamation:** More emphatic - celebrates the resistance action

Both use **amber color (#f59e0b)** to distinguish from green "build" habits.

---

## Color Guidelines
- **Active/Complete:** Amber (#f59e0b) 
- **Inactive:** Gray (#6b7280)
- **On colored backgrounds:** White

---

## Icon Sources
Both icons are from [Heroicons](https://heroicons.com/):
- **shield** (plain) - Type: Solid, Size: 20x20
- **shield-exclamation** - Type: Solid, Size: 20x20
- License: MIT

The shield symbolizes **defense and protection** - perfect visual metaphor for resisting temptation.
