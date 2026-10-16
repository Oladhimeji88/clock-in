import { cn } from '../../utils/cn';
import type { DayStatus, LeaveStatus, SessionStatus } from '../../types';

type AnyStatus = DayStatus | SessionStatus | LeaveStatus | 'active' | 'disabled' | 'invited';

const MAP: Record<string, {label: string;classes: string;dot: string;}> = {
  working: { label: 'Working', classes: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
  break: { label: 'On Break', classes: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' },
  out: { label: 'Clocked Out', classes: 'bg-ink-100 text-ink-600 ring-ink-200', dot: 'bg-ink-400' },
  not_in: { label: 'Not Clocked In', classes: 'bg-ink-100 text-ink-600 ring-ink-200', dot: 'bg-ink-300' },
  leave: { label: 'On Leave', classes: 'bg-blue-50 text-blue-700 ring-blue-200', dot: 'bg-blue-500' },
  late: { label: 'Late', classes: 'bg-rose-50 text-rose-700 ring-rose-200', dot: 'bg-rose-500' },
  absent: { label: 'Absent', classes: 'bg-ink-100 text-ink-500 ring-ink-200', dot: 'bg-ink-300' },
  Pending: { label: 'Pending', classes: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' },
  Approved: { label: 'Approved', classes: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
  Rejected: { label: 'Rejected', classes: 'bg-rose-50 text-rose-700 ring-rose-200', dot: 'bg-rose-500' },
  active: { label: 'Active', classes: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
  disabled: { label: 'Disabled', classes: 'bg-ink-100 text-ink-500 ring-ink-200', dot: 'bg-ink-300' },
  invited: { label: 'Invited', classes: 'bg-accent-50 text-accent-700 ring-accent-200', dot: 'bg-accent-500' }
};

interface StatusPillProps {
  status: AnyStatus;
  label?: string;
  pulse?: boolean;
  className?: string;
}

export function StatusPill({ status, label, pulse, className }: StatusPillProps) {
  const config = MAP[status] ?? MAP.out;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap',
        config.classes,
        className
      )}>
      
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot, pulse && 'animate-pulse-dot')} />
      {label ?? config.label}
    </span>);

}

export const statusOrder: DayStatus[] = ['working', 'break', 'out', 'leave', 'late'];
export const statusText = (status: string) => MAP[status]?.label ?? status;