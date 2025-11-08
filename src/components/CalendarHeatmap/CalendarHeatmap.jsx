import React, { useMemo } from 'react';
import DayCell from './DayCell';
import { getCalendarHeatmapData } from '../../utils/chartCalculations';
import './CalendarHeatmap.css';

/**
 * CalendarHeatmap Component
 * Shows current month with completion status for each day
 * Compact design that flows seamlessly below the toggle chart
 */
function CalendarHeatmap({ habit, logs }) {
  // Get current month calendar data
  const calendarData = useMemo(() => {
    if (!habit || !logs) return null;
    return getCalendarHeatmapData(habit, logs);
  }, [habit, logs]);

  if (!calendarData) {
    return null;
  }

  const { grid, year, month } = calendarData;

  // Get month name
  const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  // Split grid into weeks (7 days per week)
  const weeks = [];
  for (let i = 0; i < grid.length; i += 7) {
    weeks.push(grid.slice(i, i + 7));
  }

  return (
    <div className="calendar-heatmap">
      {/* Header */}
      <div className="calendar-header">
        <h2 className="calendar-title">This Month</h2>
        <div className="calendar-month">{monthName}</div>
      </div>

      {/* Calendar grid */}
      <div className="calendar-grid">
        {/* Day headers (S M T W T F S) */}
        <div className="day-headers">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <div key={idx} className="day-header">{day}</div>
          ))}
        </div>

        {/* Calendar weeks */}
        <div className="calendar-weeks">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="calendar-week">
              {week.map((dayData, dayIdx) => (
                <DayCell 
                  key={dayIdx} 
                  dayData={dayData} 
                  habit={habit}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-dot completed"></div>
            <span>Done</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot missed"></div>
            <span>Missed</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot future"></div>
            <span>Future</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarHeatmap;
