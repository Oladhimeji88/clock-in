import React from 'react';
import { cn } from '../utils/cn';

interface BrandProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
  inverted?: boolean;
}

const MARK = { sm: 'h-7 w-7 rounded-[8px]', md: 'h-9 w-9 rounded-[10px]', lg: 'h-12 w-12 rounded-[14px]' };
const TEXT = { sm: 'text-[15px]', md: 'text-[17px]', lg: 'text-xl' };

export function Brand({ size = 'md', showWordmark = true, className, inverted }: BrandProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'relative grid place-items-center overflow-hidden',
          MARK[size],
          inverted ? 'bg-white' : 'bg-ink-950'
        )}
        aria-hidden="true">
        
        <span className="flex items-end gap-[2px]">
          <span className={cn('w-[2px] rounded-full', inverted ? 'bg-ink-900' : 'bg-white/35')} style={{ height: 7 }} />
          <span className={cn('w-[2px] rounded-full', inverted ? 'bg-ink-900' : 'bg-white')} style={{ height: 13 }} />
          <span className="w-[2px] rounded-full bg-accent-400" style={{ height: 9 }} />
          <span className={cn('w-[2px] rounded-full', inverted ? 'bg-ink-900' : 'bg-white/35')} style={{ height: 5 }} />
        </span>
      </span>
      {showWordmark &&
      <span className={cn('font-semibold tracking-[-0.02em]', TEXT[size], inverted ? 'text-white' : 'text-ink-900')}>
          Cadence
        </span>
      }
    </span>);

}