import { useEffect, useRef, useMemo, useState } from 'react';
import { useHabits } from '../../context/HabitContext';
import * as d3 from 'd3';
import './Growth.css';

// Color mapping for habit categories
const CATEGORY_COLORS = {
  // Cardio/Exercise - Teal
  running: '#00D4AA',
  cycling: '#00D4AA',
  swimming: '#00D4AA',
  walking: '#00D4AA',

  // Strength - Red/Coral
  gym: '#FF6B6B',
  pushups: '#FF6B6B',

  // Mindfulness - Orange/Gold
  meditation: '#FFC163',
  yoga: '#FFC163',
  journaling: '#FFC163',
  gratitude: '#FFC163',

  // Nutrition/Health - Blue
  water: '#63B3FF',
  vitamins: '#63B3FF',
  cooking: '#63B3FF',

  // Growth/Learning - Purple
  reading: '#B182FF',
  learning: '#B182FF',
  'language-practice': '#B182FF',

  // Resist/Break habits - Pink
  alcohol: '#FF69B4',
  smoking: '#FF69B4',
  'fast-food': '#FF69B4',
  'social-media': '#FF69B4',
  'online-shopping': '#FF69B4',
  snacking: '#FF69B4',
  soda: '#FF69B4',
  caffeine: '#FF69B4',
  takeout: '#FF69B4',

  // Default
  default: '#00D4AA'
};

const getColorForHabit = (libraryId) => {
  return CATEGORY_COLORS[libraryId] || CATEGORY_COLORS.default;
};

// Get unique categories from the logs for legend
const getCategoriesFromLogs = (logs, habits) => {
  const categories = new Map();

  logs.forEach(log => {
    const habit = habits.find(h => h.id === log.habitId);
    if (habit && habit.libraryId) {
      const color = getColorForHabit(habit.libraryId);
      if (!categories.has(color)) {
        categories.set(color, habit.name);
      }
    }
  });

  return Array.from(categories.entries()).map(([color, name]) => ({ color, name }));
};

export default function Growth() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const { habits, logs } = useHabits();
  const pathElementsRef = useRef([]);
  const animationRef = useRef(null);

  // Process logs to get branch data
  const branchData = useMemo(() => {
    if (!logs || !habits) return [];

    return logs
      .filter(log => log && log.habitId)
      .map(log => {
        const habit = habits.find(h => h.id === log.habitId);
        const libraryId = habit?.libraryId || 'default';
        const color = getColorForHabit(libraryId);

        return {
          id: log.id || `${log.habitId}-${log.timestamp}`,
          habitId: log.habitId,
          habitName: habit?.name || 'Unknown',
          color,
          value: log.totalEarnings || 0,
          timestamp: log.timestamp
        };
      })
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [logs, habits]);

  // Get legend categories
  const legendCategories = useMemo(() => {
    return getCategoriesFromLogs(logs || [], habits || []);
  }, [logs, habits]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Safety check for valid dimensions
    if (width <= 0 || height <= 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();
    pathElementsRef.current = [];

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Defs for gradients and filters
    const defs = svg.append('defs');

    // Line gradient
    const lineGradient = defs.append('linearGradient')
      .attr('id', 'line-gradient')
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '0%')
      .attr('y2', '0%');

    lineGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#00ffcc')
      .attr('stop-opacity', 1);

    lineGradient.append('stop')
      .attr('offset', '30%')
      .attr('stop-color', '#00D4AA')
      .attr('stop-opacity', 0.7);

    lineGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#00D4AA')
      .attr('stop-opacity', 0.2);

    // Base glow gradient
    const baseGlow = defs.append('radialGradient')
      .attr('id', 'base-glow')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');

    baseGlow.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#00ffcc')
      .attr('stop-opacity', 1);

    baseGlow.append('stop')
      .attr('offset', '40%')
      .attr('stop-color', '#00D4AA')
      .attr('stop-opacity', 0.4);

    baseGlow.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#00D4AA')
      .attr('stop-opacity', 0);

    // Glow filter
    const glowFilter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '1.5')
      .attr('result', 'coloredBlur');

    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Node glow filter
    const nodeGlow = defs.append('filter')
      .attr('id', 'node-glow')
      .attr('x', '-200%')
      .attr('y', '-200%')
      .attr('width', '500%')
      .attr('height', '500%');

    nodeGlow.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');

    const nodeMerge = nodeGlow.append('feMerge');
    nodeMerge.append('feMergeNode').attr('in', 'coloredBlur');
    nodeMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Base coordinates
    const baseX = width / 2;
    const baseY = height - 80;
    const trunkHeight = height * 0.30;
    const trunkTopY = baseY - trunkHeight;

    // Base glow group
    const baseGlowGroup = svg.append('g').attr('class', 'base-glow');

    baseGlowGroup.append('ellipse')
      .attr('cx', baseX)
      .attr('cy', baseY + 10)
      .attr('rx', 50)
      .attr('ry', 15)
      .attr('fill', 'url(#base-glow)')
      .attr('opacity', 0.7);

    baseGlowGroup.append('ellipse')
      .attr('cx', baseX)
      .attr('cy', baseY)
      .attr('rx', 12)
      .attr('ry', 4)
      .attr('fill', '#00ffcc')
      .attr('opacity', 1)
      .attr('filter', 'url(#glow)');

    // Layer groups
    const branchGroup = svg.append('g').attr('class', 'branches');
    const midNodeGroup = svg.append('g').attr('class', 'mid-nodes');
    const nodeGroup = svg.append('g').attr('class', 'nodes');
    const labelGroup = svg.append('g').attr('class', 'labels');

    // Generate curve for a branch
    const generateCurve = (index) => {
      const finalAngle = -170 + Math.random() * 160;
      const finalAngleRad = (finalAngle * Math.PI) / 180;

      const branchLength = height * 0.25 + Math.random() * (height * 0.35);

      const endX = baseX + Math.cos(finalAngleRad) * branchLength;
      const endY = trunkTopY + Math.sin(finalAngleRad) * branchLength * 0.8;

      const bundleOffset = (Math.random() - 0.5) * 16;

      const cp1x = baseX + bundleOffset * 0.3;
      const cp1y = baseY - trunkHeight * 0.4;

      const cp2x = baseX + bundleOffset + (endX - baseX) * 0.2;
      const cp2y = trunkTopY + (endY - trunkTopY) * 0.3;

      const cp3x = baseX + (endX - baseX) * 0.6 + (Math.random() - 0.5) * 40;
      const cp3y = trunkTopY + (endY - trunkTopY) * 0.6;

      const path = `M ${baseX} ${baseY}
                    C ${cp1x} ${cp1y},
                      ${cp2x} ${cp2y},
                      ${cp3x} ${cp3y}
                    S ${endX + (Math.random() - 0.5) * 30} ${endY + (Math.random() - 0.5) * 20},
                      ${endX} ${endY}`;

      const midX = (baseX + endX) / 2 + (Math.random() - 0.5) * 30;
      const midY = (trunkTopY + endY) / 2;

      return { path, endX, endY, midX, midY };
    };

    // Add a branch
    const addBranch = (branchItem, index, animate, showLabel) => {
      const curve = generateCurve(index);
      const opacity = 0.5 + Math.random() * 0.4;

      // Line
      const path = branchGroup.append('path')
        .attr('d', curve.path)
        .attr('stroke', 'url(#line-gradient)')
        .attr('stroke-width', 0.8 + Math.random() * 0.3)
        .attr('fill', 'none')
        .attr('filter', 'url(#glow)')
        .attr('opacity', 0);

      pathElementsRef.current.push({ el: path, baseOpacity: opacity });

      if (animate) {
        const pathNode = path.node();
        if (pathNode && typeof pathNode.getTotalLength === 'function') {
          const pathLength = pathNode.getTotalLength();
          path.attr('stroke-dasharray', pathLength)
            .attr('stroke-dashoffset', pathLength)
            .attr('opacity', opacity)
            .transition()
            .duration(1000)
            .ease(d3.easeCubicOut)
            .attr('stroke-dashoffset', 0);
        } else {
          path.attr('opacity', opacity);
        }
      } else {
        path.attr('opacity', opacity);
      }

      // Intermediate node (25% chance)
      if (Math.random() > 0.75) {
        const midNode = midNodeGroup.append('circle')
          .attr('cx', curve.midX)
          .attr('cy', curve.midY)
          .attr('r', 2)
          .attr('fill', branchItem.color)
          .attr('opacity', animate ? 0 : 0.4);

        if (animate) {
          midNode.transition().delay(500).duration(300).attr('opacity', 0.4);
        }
      }

      // Endpoint node
      const node = nodeGroup.append('circle')
        .attr('cx', curve.endX)
        .attr('cy', curve.endY)
        .attr('r', animate ? 0 : 4)
        .attr('fill', branchItem.color)
        .attr('filter', 'url(#node-glow)')
        .attr('opacity', 0.9);

      if (animate) {
        node.transition()
          .delay(800)
          .duration(400)
          .ease(d3.easeElasticOut.amplitude(1).period(0.5))
          .attr('r', 4);
      }

      // Label (40% chance, show earnings)
      if (showLabel && Math.random() > 0.6 && branchItem.value > 0) {
        const labelX = curve.endX + (curve.endX > baseX ? 10 : -10);
        const label = labelGroup.append('text')
          .attr('x', labelX)
          .attr('y', curve.endY + 3)
          .attr('fill', branchItem.color)
          .attr('font-size', '9px')
          .attr('font-weight', '500')
          .attr('font-family', 'SF Mono, Monaco, monospace')
          .attr('text-anchor', curve.endX > baseX ? 'start' : 'end')
          .attr('opacity', animate ? 0 : 0.6)
          .text(`$${branchItem.value.toFixed(2)}`);

        if (animate) {
          label.transition().delay(1000).duration(300).attr('opacity', 0.6);
        }
      }

      // Pulse animation
      const pulse = () => {
        node.transition()
          .duration(2000 + Math.random() * 2000)
          .attr('r', 5)
          .attr('opacity', 0.6)
          .transition()
          .duration(2000 + Math.random() * 2000)
          .attr('r', 4)
          .attr('opacity', 0.9)
          .on('end', pulse);
      };
      setTimeout(pulse, animate ? 1200 : Math.random() * 3000);
    };

    // Ambient sway animation
    const startAmbientAnimation = () => {
      let time = 0;

      const animate = () => {
        time += 0.015;

        pathElementsRef.current.forEach((item, i) => {
          try {
            const offset = i * 0.08;
            const sway = Math.sin(time + offset) * 0.5;
            if (item.el && item.el.attr) {
              item.el.attr('transform', `translate(${sway}, 0)`);
            }
          } catch (e) {
            // Element may have been removed
          }
        });

        animationRef.current = requestAnimationFrame(animate);
      };

      animate();
    };

    // Track timeouts for cleanup
    const timeouts = [];

    // Render branches from log data
    try {
      if (branchData.length > 0) {
        branchData.forEach((branch, index) => {
          const timeout = setTimeout(() => {
            try {
              const animate = index >= branchData.length - 5; // Animate last 5
              const showLabel = index >= branchData.length - 30; // Show labels for recent
              addBranch(branch, index, animate, showLabel);

              if (index === branchData.length - 1) {
                const finalTimeout = setTimeout(startAmbientAnimation, 500);
                timeouts.push(finalTimeout);
              }
            } catch (e) {
              console.warn('Error adding branch:', e);
            }
          }, Math.min(index * 30, 50)); // Stagger initial render
          timeouts.push(timeout);
        });
      } else {
        // No logs - just start animation for empty state
        startAmbientAnimation();
      }
    } catch (e) {
      console.warn('Error rendering growth tree:', e);
    }

    // Cleanup
    return () => {
      timeouts.forEach(t => clearTimeout(t));
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [branchData]);

  return (
    <div className="growth-page">
      <div className="growth-header">
        <h1>Your Growth</h1>
        <p>Every branch is a behavior logged</p>
      </div>

      <div className="growth-stats">
        <div className="growth-total">{branchData.length}</div>
        <div className="growth-label">behaviors logged</div>
      </div>

      {legendCategories.length > 0 && (
        <div className="growth-legend">
          {legendCategories.map((cat, i) => (
            <div key={i} className="legend-item">
              <div className="legend-dot" style={{ background: cat.color }}></div>
              <span>{cat.name}</span>
            </div>
          ))}
        </div>
      )}

      <div className="growth-canvas-container" ref={containerRef}>
        <svg ref={svgRef} id="growth-canvas"></svg>
      </div>

      {branchData.length === 0 && (
        <div className="growth-empty">
          <p>Log your first behavior to start growing your tree</p>
        </div>
      )}
    </div>
  );
}
