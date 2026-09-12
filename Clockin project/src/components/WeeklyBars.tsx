import React from 'react';
import { cn } from '../utils/cn';
import { formatHm } from '../utils/time';
import type { DayStatus } from '../types';

interface WeeklyBarsProps {
  data: {day: string;minutes: number;status: DayStatus;}[];
  expectedMin: number;
  height?: number;
  compact?: boolean;
}

export function WeeklyBars({ data, expectedMin, height = 132, compact }: WeeklyBarsProps) {
  const max = Math.max(expectedMin * 1.25, ...data.map((d) => d.minutes), 60);

  return (
    <div>
      <div className="flex items-end gap-2 sm:gap-3" style={{ height }}>
        {data.map((d) => {
          const pct = d.minutes / max * 100;
          const meetsTarget = d.minutes >= expectedMin;
          return (
            <div key={d.day} className="flex h-full flex-1 flex-col justify-end gap-2">
              <span
                className={cn(
                  'num text-center text-[11px] font-medium',
                  d.minutes ? 'text-ink-600' : 'text-ink-300'
                )}>
                
                {d.minutes ? formatHm(d.minutes) : '—'}
              </span>
              <div className="relative flex-1 overflow-hidden rounded-lg bg-ink-100">
                <div
                  className="absolute inset-x-0 border-t border-dashed border-ink-300"
                  style={{ bottom: `${expectedMin / max * 100}%` }}
                  aria-hidden="true" />
                
                <div
                  className={cn(
                    'absolute bottom-0 left-0 right-0 rounded-lg transition-[height] duration-500 ease-snap',
                    d.status === 'leave' ?
                    'bg-blue-400' :
                    meetsTarget ?
                    'bg-accent-600' :
                    d.minutes ?
                    'bg-accent-300' :
                    'bg-transparent'
                  )}
                  style={{ height: `${pct}%` }} />
                
              </div>
            </div>);

        })}
      </div>
      <div className="mt-2 flex gap-2 sm:gap-3">
        {data.map((d) =>
        <span
          key={d.day}
          className="flex-1 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">
          
            {d.day}
          </span>
        )}
      </div>
      {!compact &&
      <p className="mt-3 text-xs text-ink-400">
          Dashed line marks the expected {formatHm(expectedMin)} target for each working day.
        </p>
      }
    </div>);

}