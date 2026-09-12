import React from 'react';
import { cn } from '../../utils/cn';

interface CircularProgressProps {
  progress: number;
  size?: number;
  stroke?: number;
  tone?: 'accent' | 'emerald' | 'amber' | 'ink';
  children?: React.ReactNode;
  className?: string;
}

const TONES = {
  accent: '#E7454C',
  emerald: '#0E9F6E',
  amber: '#D97706',
  ink: '#18181B'
};

export function CircularProgress({
  progress,
  size = 220,
  stroke = 10,
  tone = 'accent',
  children,
  className
}: CircularProgressProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-ink-100" />
        
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={TONES[tone]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(0.23, 1, 0.32, 1)' }} />
        
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>);

}