import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { DEFAULT_SAVINGS_MILESTONES, SavingsMilestone } from './SavingsMilestonesInteractive';

export interface D3SavingsProgressChartProps {
  currentAmount: number;
  targetAmount: number;
  color?: string;
  size?: number;
  strokeWidth?: number;
  title?: string;
  subtitle?: string;
  currencyPrefix?: string;
  showMilestones?: boolean;
  interactive?: boolean;
  centerIcon?: React.ReactNode;
  selectedMilestone?: number | null;
  onSelectMilestone?: (milestone: number | null) => void;
  className?: string;
}

export const D3SavingsProgressChart: React.FC<D3SavingsProgressChartProps> = ({
  currentAmount,
  targetAmount,
  color = '#06b6d4',
  size = 220,
  strokeWidth = 16,
  title,
  subtitle,
  currencyPrefix = '₫',
  showMilestones = true,
  interactive = true,
  centerIcon,
  selectedMilestone = null,
  onSelectMilestone,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredMilestone, setHoveredMilestone] = useState<number | null>(null);

  // Calculate percentage (0 to 100, or above 100)
  const validTarget = Math.max(1, targetAmount);
  const percentage = Math.max(0, Math.round((currentAmount / validTarget) * 100));
  const progressRatio = Math.min(Math.max(0, currentAmount / validTarget), 1);
  const isComplete = currentAmount >= validTarget;

  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(val)) + ' ' + currencyPrefix;
  };

  const displayedMilestone = hoveredMilestone ?? selectedMilestone;
  const activeMilestoneObj = DEFAULT_SAVINGS_MILESTONES.find(m => m.percentage === displayedMilestone);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = size;
    const height = size;
    const radius = Math.min(width, height) / 2;
    const innerRadius = radius - strokeWidth;
    const outerRadius = radius - 4; // slight padding

    // Unique gradient IDs
    const gradientId = `d3-savings-grad-${Math.random().toString(36).substring(2, 9)}`;
    const glowFilterId = `d3-savings-glow-${Math.random().toString(36).substring(2, 9)}`;

    // Defs: Gradients and Glow Filter
    const defs = svg.append('defs');

    // Glow filter
    const filter = defs
      .append('filter')
      .attr('id', glowFilterId)
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');

    filter
      .append('feGaussianBlur')
      .attr('stdDeviation', 4)
      .attr('result', 'blur');

    filter
      .append('feMerge')
      .selectAll('feMergeNode')
      .data(['blur', 'SourceGraphic'])
      .enter()
      .append('feMergeNode')
      .attr('in', (d) => d);

    // Linear gradient along arc
    const gradient = defs
      .append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', color)
      .attr('stop-opacity', 0.85);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', isComplete ? '#10b981' : d3.color(color)?.brighter(0.8)?.formatHex() || '#38bdf8')
      .attr('stop-opacity', 1);

    // Main grouping centered
    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Arc generators
    // Starting from 12 o'clock: angle 0 to 2*PI
    const arcGen = d3
      .arc<any>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(strokeWidth / 2);

    // 1. Background full track
    g.append('path')
      .datum({ startAngle: 0, endAngle: 2 * Math.PI })
      .attr('d', arcGen)
      .attr('fill', '#18181b')
      .attr('stroke', '#27272a')
      .attr('stroke-width', 1);

    // Subtle inner glow track
    g.append('circle')
      .attr('r', innerRadius - 2)
      .attr('fill', 'none')
      .attr('stroke', '#27272a')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,4')
      .attr('opacity', 0.6);

    // 2. Foreground Progress Arc with animated transition
    const targetEndAngle = progressRatio * 2 * Math.PI;

    if (targetEndAngle > 0.001) {
      const progressPath = g
        .append('path')
        .datum({ startAngle: 0, endAngle: 0.001 })
        .attr('fill', `url(#${gradientId})`)
        .attr('filter', `url(#${glowFilterId})`)
        .style('cursor', interactive ? 'pointer' : 'default');

      // Animate progress arc from 0 to targetEndAngle
      progressPath
        .transition()
        .duration(1200)
        .ease(d3.easeCubicOut)
        .attrTween('d', function (d) {
          const interpolate = d3.interpolate(d.endAngle, targetEndAngle);
          return function (t) {
            d.endAngle = interpolate(t);
            return arcGen(d) || '';
          };
        });

      // Indicator Tip (Glowing bead at current progress end point)
      if (progressRatio > 0.02 && progressRatio < 1.0) {
        const midRadius = (innerRadius + outerRadius) / 2;
        const tipDot = g
          .append('circle')
          .attr('r', strokeWidth / 3)
          .attr('fill', '#ffffff')
          .attr('stroke', color)
          .attr('stroke-width', 2.5)
          .attr('filter', `url(#${glowFilterId})`)
          .attr('opacity', 0);

        tipDot
          .transition()
          .duration(1200)
          .ease(d3.easeCubicOut)
          .attr('opacity', 1)
          .tween('position', function () {
            const interpolate = d3.interpolate(0, targetEndAngle);
            return function (t) {
              const currentAngle = interpolate(t);
              const tx = midRadius * Math.sin(currentAngle);
              const ty = -midRadius * Math.cos(currentAngle);
              tipDot.attr('cx', tx).attr('cy', ty);
            };
          });
      }
    }

    // 3. Interactive Milestone Badges & Anchors (25%, 50%, 75%, 100%)
    if (showMilestones) {
      const milestoneGroup = g.append('g').attr('class', 'milestones');

      DEFAULT_SAVINGS_MILESTONES.forEach((milestone) => {
        const mVal = milestone.percentage / 100;
        const angle = mVal * 2 * Math.PI; // from 12 o'clock clockwise
        const midRadius = (innerRadius + outerRadius) / 2;
        // In SVG arc, 0 is at (0, -r). Clockwise: x = r * sin(a), y = -r * cos(a)
        const mx = midRadius * Math.sin(angle);
        const my = -midRadius * Math.cos(angle);

        const isReached = progressRatio >= mVal;
        const isCurrentSelected = selectedMilestone === milestone.percentage;

        // Outer pulsing ring for reached or selected milestones
        if (isReached || isCurrentSelected) {
          milestoneGroup
            .append('circle')
            .attr('cx', mx)
            .attr('cy', my)
            .attr('r', isCurrentSelected ? 9.5 : 7)
            .attr('fill', 'none')
            .attr('stroke', isCurrentSelected ? '#38bdf8' : milestone.unlockedColor)
            .attr('stroke-width', isCurrentSelected ? 2 : 1.2)
            .attr('opacity', isCurrentSelected ? 0.9 : 0.45);
        }

        // Inner milestone badge node
        const mNode = milestoneGroup
          .append('g')
          .attr('transform', `translate(${mx}, ${my})`)
          .style('cursor', interactive ? 'pointer' : 'default');

        // Circular background for node
        mNode
          .append('circle')
          .attr('r', isCurrentSelected ? 5.5 : isReached ? 4.5 : 3)
          .attr('fill', isReached ? milestone.unlockedColor : '#27272a')
          .attr('stroke', isCurrentSelected ? '#ffffff' : isReached ? '#ffffff' : '#3f3f46')
          .attr('stroke-width', isCurrentSelected ? 2 : 1.2)
          .attr('filter', isReached ? `url(#${glowFilterId})` : null);

        // Center dot
        mNode
          .append('circle')
          .attr('r', isReached ? 1.8 : 1)
          .attr('fill', isReached ? '#ffffff' : '#71717a');

        // Touch & mouse event interactions
        if (interactive) {
          mNode
            .on('mouseenter', () => setHoveredMilestone(milestone.percentage))
            .on('mouseleave', () => setHoveredMilestone(null))
            .on('click', (e) => {
              e.stopPropagation();
              if (onSelectMilestone) {
                onSelectMilestone(isCurrentSelected ? null : milestone.percentage);
              }
            });
        }
      });
    }

    // Center circular background plate for contrast
    g.append('circle')
      .attr('r', innerRadius - 4)
      .attr('fill', '#09090b')
      .attr('opacity', 0.92);
  }, [
    currentAmount, 
    targetAmount, 
    color, 
    size, 
    strokeWidth, 
    showMilestones, 
    interactive, 
    isComplete, 
    selectedMilestone,
    onSelectMilestone
  ]);

  const remainingAmount = Math.max(0, targetAmount - currentAmount);

  return (
    <div 
      ref={containerRef}
      className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      />

      {/* Central Content Overlay */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none"
        style={{ width: size, height: size }}
      >
        {centerIcon && !activeMilestoneObj && (
          <div className="mb-1 text-zinc-400">
            {centerIcon}
          </div>
        )}

        {/* Dynamic Percentage / Milestone Badge Info Hover or Selected */}
        {activeMilestoneObj ? (
          <div className="transition-all animate-in fade-in zoom-in-95 space-y-0.5">
            <div className="flex items-center justify-center gap-1">
              <span className="text-base">{activeMilestoneObj.icon}</span>
              <span 
                className="text-[10px] font-black uppercase tracking-wider"
                style={{ color: activeMilestoneObj.unlockedColor }}
              >
                Mốc {activeMilestoneObj.percentage}%
              </span>
            </div>

            <div className="text-sm font-black text-white truncate max-w-[130px]">
              {activeMilestoneObj.badgeName}
            </div>

            <div className="text-[11px] font-black text-white font-mono">
              {formatVND((validTarget * activeMilestoneObj.percentage) / 100)}
            </div>

            <div className="text-[9px] font-bold">
              {percentage >= activeMilestoneObj.percentage ? (
                <span className="text-emerald-400">✓ Đã Mở Khóa</span>
              ) : (
                <span className="text-zinc-400">
                  Thiếu {formatVND(Math.max(0, (validTarget * activeMilestoneObj.percentage) / 100 - currentAmount))}
                </span>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-baseline justify-center gap-0.5">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                {percentage}
              </span>
              <span className="text-sm font-bold text-cyan-400 font-mono">%</span>
            </div>

            <span className="text-[10px] font-semibold text-zinc-400 mt-0.5 line-clamp-1 max-w-[125px]">
              {isComplete ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1 justify-center">
                  Đã đạt mục tiêu! 🎉
                </span>
              ) : (
                <span>Còn thiếu {formatVND(remainingAmount)}</span>
              )}
            </span>

            {title && (
              <span className="text-[10px] font-bold text-zinc-300 mt-1 max-w-[130px] truncate">
                {title}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};
