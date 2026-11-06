import React, { useMemo } from 'react';
import { RoomAnalyticsSummary } from '../../types/models';
import { getRoleColor } from '../../lib/utils';
import { PieChart, BarChart2, Tag } from 'lucide-react';

export interface DemographicChartsProps {
  analytics: RoomAnalyticsSummary;
}

export const DemographicCharts: React.FC<DemographicChartsProps> = ({ analytics }) => {
  const { totalAttendees, roleBreakdown, intentBreakdown, topSkills } = analytics;

  // Memoize entries to prevent expensive sorting on unrelated renders (Vercel rerender-memo rule)
  const roleEntries = useMemo(() => {
    return Object.entries(roleBreakdown).sort((a, b) => b[1] - a[1]);
  }, [roleBreakdown]);

  const intentEntries = useMemo(() => {
    return Object.entries(intentBreakdown).sort((a, b) => b[1] - a[1]);
  }, [intentBreakdown]);

  // Calculate SVG Donut Paths with memoization
  const donutSlices = useMemo(() => {
    let cumulativeAngle = 0;
    return roleEntries.map(([role, count]) => {
      const percentage = totalAttendees > 0 ? count / totalAttendees : 0;
      const angle = percentage * 360;
      const startAngle = cumulativeAngle;
      cumulativeAngle += angle;

      // SVG arc calculation (radius: 70, strokeWidth: 26)
      const r = 70;
      const c = 100;
      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (startAngle + angle - 90) * (Math.PI / 180);

      const x1 = c + r * Math.cos(startRad);
      const y1 = c + r * Math.sin(startRad);
      const x2 = c + r * Math.cos(endRad);
      const y2 = c + r * Math.sin(endRad);
      const largeArc = angle > 180 ? 1 : 0;

      const pathData =
        angle >= 360
          ? `M ${c - r} ${c} A ${r} ${r} 0 1 0 ${c + r} ${c} A ${r} ${r} 0 1 0 ${c - r} ${c}`
          : `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;

      return {
        role,
        count,
        percentage: Math.round(percentage * 100),
        pathData,
        color: getRoleColor(role),
      };
    });
  }, [roleEntries, totalAttendees]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. ROLE BREAKDOWN DONUT CHART */}
      <div className="bg-surface-card border border-surface-border p-5 rounded-3xl shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Role Composition</h3>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* SVG Donut */}
          <div className="relative w-40 h-40 shrink-0">
            <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="currentColor"
                strokeWidth="24"
                className="text-slate-200 dark:text-[#1e2430]"
              />
              {donutSlices.map((slice, i) => (
                <path
                  key={i}
                  d={slice.pathData}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth="24"
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{totalAttendees}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                Attendees
              </span>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="flex-1 space-y-2 w-full">
            {donutSlices.slice(0, 5).map((slice) => (
              <div key={slice.role} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="text-slate-700 dark:text-slate-300 truncate">{slice.role}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-500 dark:text-slate-400">{slice.count}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200 min-w-[32px] text-right">
                    {slice.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. INTENT DISTRIBUTION */}
      <div className="bg-surface-card border border-surface-border p-5 rounded-3xl shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Participant Intent Breakdown</h3>
        </div>

        <div className="space-y-3">
          {intentEntries.map(([intent, count]) => {
            const pct = totalAttendees > 0 ? Math.round((count / totalAttendees) * 100) : 0;
            return (
              <div key={intent} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[200px]">
                    {intent}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">{count} ({pct}%)</span>
                </div>
                <div className="w-full h-2 bg-surface-raised rounded-full overflow-hidden border border-surface-border">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. POPULAR SKILLS MATRIX */}
      <div className="md:col-span-2 bg-surface-card border border-surface-border p-5 rounded-3xl shadow-card space-y-3">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Top Technical Skills Matrix</h3>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {topSkills.slice(0, 15).map(({ tag, count }) => (
            <div
              key={tag}
              className="px-3 py-1.5 rounded-xl bg-surface-raised border border-surface-border flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200"
            >
              <span>{tag}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-brand-500/15 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
