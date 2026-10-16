import React from 'react';
import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: {direction: 'up' | 'down' | 'flat';text: string;tone?: 'positive' | 'negative' | 'neutral';};
  emphasis?: boolean;
  onClick?: () => void;
}

const TONE = {
  positive: 'text-emerald-600',
  negative: 'text-rose-600',
  neutral: 'text-ink-400'
};

export function StatCard({ label, value, icon, trend, emphasis, onClick }: StatCardProps) {
  const TrendIcon =
  trend?.direction === 'up' ? ArrowUpRightIcon : trend?.direction === 'down' ? ArrowDownRightIcon : MinusIcon;

  const body =
  <>
      <div className="flex w-full items-start justify-between">
        <span
        className={cn(
          'grid h-8 w-8 place-items-center rounded-lg',
          emphasis ? 'bg-white/10 text-emerald-400' : 'bg-ink-100 text-ink-500'
        )}>
        
          {icon}
        </span>
        {trend &&
      <span
        className={cn(
          'inline-flex items-center gap-1 text-[11px] font-medium',
          emphasis ? 'text-white/50' : TONE[trend.tone ?? 'neutral']
        )}>
        
            <TrendIcon className="h-3 w-3" />
            {trend.text}
          </span>
      }
      </div>
      <div>
        <p
        className={cn(
          'num text-[30px] font-semibold leading-none tracking-[-0.03em]',
          emphasis ? 'text-white' : 'text-ink-900'
        )}>
        
          {value}
        </p>
        <p className={cn('mt-1.5 text-[13px]', emphasis ? 'text-white/50' : 'text-ink-500')}>{label}</p>
      </div>
    </>;


  const shell = cn(
    'flex flex-col items-start gap-3 rounded-2xl border p-4 text-left transition-colors duration-150 ease-snap',
    emphasis ? 'border-ink-800 bg-ink-950 shadow-lift' : 'border-ink-200 bg-surface shadow-card',
    onClick && (emphasis ? 'hover:bg-ink-900' : 'hover:border-ink-300')
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={shell}>
        {body}
      </button>);

  }

  return <div className={shell}>{body}</div>;
}