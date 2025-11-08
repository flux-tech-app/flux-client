import React from 'react';
import './DayCell.css';

/**
 * DayCell Component
 * Individual day cell in the calendar heatmap
 * Shows completion status with color coding and intensity
 */
function DayCell({ dayData, habit }) {
  // Empty cell (before month starts)
  if (dayData.isEmpty) {
    return <div className="day-cell empty"></div>;
  }

  const { day, isToday, isFuture, status, log } = dayData;

  // Determine CSS classes
  const classes = ['day-cell'];
  
  if (isToday) classes.push('today');
  if (isFuture) classes.push('future');
  if (status) {
    classes.push(status.type);
    if (status.intensity) {
      classes.push(`intensity-${status.intensity}`);
    }
  }

  // Create tooltip content
  const getTooltip = () => {
    if (isFuture) return 'Future day';
    if (!log) return 'Missed';
    
    // Build tooltip based on habit type
    let tooltip = `${dayData.date}\n`;
    
    if (log.duration) {
      tooltip += `${log.duration} minutes\n`;
    } else if (log.count) {
      tooltip += `${log.count} ${habit?.unit || 'units'}\n`;
    } else if (log.completed) {
      tooltip += 'Completed\n';
    }
    
    if (log.earnings) {
      tooltip += `Earned: $${log.earnings.toFixed(2)}`;
    }
    
    return tooltip;
  };

  return (
    <div 
      className={classes.join(' ')}
      title={getTooltip()}
    >
      {day}
    </div>
  );
}

export default DayCell;
