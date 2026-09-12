import React from 'react';
import { cn } from '../../utils/cn';

interface PanelProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  flush?: boolean;
}

export function Panel({ title, description, actions, children, className, bodyClassName, flush }: PanelProps) {
  return (
    <section className={cn('overflow-hidden rounded-2xl border border-ink-200 bg-surface shadow-card', className)}>
      {(title || actions) &&
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
          <div>
            {title && <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink-900">{title}</h2>}
            {description && <p className="mt-0.5 text-[13px] text-ink-500">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      }
      <div className={cn(!flush && 'p-5', bodyClassName)}>{children}</div>
    </section>);

}

export function ProgressBar({
  value,
  tone = 'accent',
  className




}: {value: number;tone?: 'accent' | 'emerald' | 'amber' | 'ink';className?: string;}) {
  const tones = {
    accent: 'bg-accent-600',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    ink: 'bg-ink-800'
  };
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-ink-100', className)}>
      <div
        className={cn('h-full rounded-full transition-[width] duration-500 ease-snap', tones[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }} />
      
    </div>);

}