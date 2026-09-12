import { cn } from '../../utils/cn';
import type { ClockSettings, ClockStyle, ClockTheme, SessionStatus } from '../../types';
import { formatDurationHMS, formatTimeOfDay, longDate, meridiem } from '../../utils/time';

export type ClockSize = 'mini' | 'sm' | 'md' | 'lg' | 'xl';

interface ClockFaceProps {
  settings: ClockSettings;
  now: number;
  workedMs: number;
  remainingMs: number;
  progress: number;
  status: SessionStatus;
  expectedHours: number;
  size?: ClockSize;
  className?: string;
}

const STATUS_LABEL: Record<SessionStatus, string> = {
  not_in: 'NOT CLOCKED IN',
  working: 'WORKING',
  break: 'ON BREAK',
  out: 'CLOCKED OUT',
  leave: 'ON LEAVE'
};

const THEME: Record<
  ClockTheme,
  {shell: string;digits: string;muted: string;track: string;fill: string;sheen: boolean;}> =
{
  dark: {
    shell: 'clock-face-dark border border-white/10 text-white',
    digits: 'text-white',
    muted: 'text-white/45',
    track: 'bg-white/10',
    fill: 'bg-white',
    sheen: true
  },
  light: {
    shell: 'bg-white border border-ink-200 shadow-card text-ink-900',
    digits: 'text-ink-900',
    muted: 'text-ink-400',
    track: 'bg-ink-100',
    fill: 'bg-ink-900',
    sheen: false
  },
  minimal: {
    shell: 'bg-transparent border border-transparent text-ink-900',
    digits: 'text-ink-900',
    muted: 'text-ink-400',
    track: 'bg-ink-200',
    fill: 'bg-accent-600',
    sheen: false
  },
  glass: {
    shell: 'bg-ink-900/70 backdrop-blur-xl border border-white/15 text-white shadow-pop',
    digits: 'text-white',
    muted: 'text-white/55',
    track: 'bg-white/15',
    fill: 'bg-accent-300',
    sheen: true
  },
  retro: {
    shell: 'border text-amber-300 border-amber-500/20',
    digits: 'text-amber-300',
    muted: 'text-amber-200/50',
    track: 'bg-amber-300/15',
    fill: 'bg-amber-300',
    sheen: true
  }
};

const STYLE_FONT: Record<ClockStyle, string> = {
  digital: 'font-mono font-medium tracking-[-0.02em]',
  segmented: 'font-seg tracking-[0.02em]',
  minimal: 'font-sans font-light tracking-[-0.04em]',
  modern: 'font-display font-medium tracking-[-0.01em]',
  retro: 'font-seg tracking-[0.06em]'
};

const SIZE: Record<ClockSize, {pad: string;digits: string;radius: string;meta: string;gap: string;}> = {
  mini: { pad: 'px-3.5 py-3', digits: 'text-[28px]', radius: 'rounded-xl', meta: 'text-[9px]', gap: 'gap-2' },
  sm: { pad: 'px-5 py-4', digits: 'text-[40px]', radius: 'rounded-2xl', meta: 'text-[10px]', gap: 'gap-2.5' },
  md: {
    pad: 'px-6 py-6 sm:px-8 sm:py-7',
    digits: 'text-[52px] sm:text-[76px]',
    radius: 'rounded-[20px]',
    meta: 'text-[11px]',
    gap: 'gap-4'
  },
  lg: {
    pad: 'px-8 py-8 sm:px-10 sm:py-10',
    digits: 'text-[72px] sm:text-[104px]',
    radius: 'rounded-[24px]',
    meta: 'text-xs',
    gap: 'gap-5'
  },
  xl: {
    pad: 'px-6 py-10 sm:px-16 sm:py-16',
    digits: 'text-[clamp(3.5rem,17vw,15rem)]',
    radius: 'rounded-none',
    meta: 'text-xs sm:text-sm',
    gap: 'gap-8'
  }
};

const STATUS_TONE: Record<SessionStatus, string> = {
  working: 'text-emerald-400',
  break: 'text-amber-400',
  out: 'text-white/60',
  not_in: 'text-white/50',
  leave: 'text-sky-400'
};

const STATUS_TONE_LIGHT: Record<SessionStatus, string> = {
  working: 'text-emerald-600',
  break: 'text-amber-600',
  out: 'text-ink-500',
  not_in: 'text-ink-400',
  leave: 'text-blue-600'
};

function Indicator({
  label,
  value,
  muted,
  size,
  align = 'left'






}: {label: string;value: string;muted: string;size: string;align?: 'left' | 'right' | 'center';}) {
  return (
    <div
      className={cn(
        'flex flex-col',
        align === 'right' && 'items-end text-right',
        align === 'center' && 'items-center text-center'
      )}>
      
      <span className={cn('font-semibold uppercase tracking-[0.14em]', muted, size)}>{label}</span>
      <span className={cn('num mt-1 font-mono font-medium', size === 'text-[9px]' ? 'text-[11px]' : 'text-sm')}>
        {value}
      </span>
    </div>);

}

export function ClockFace({
  settings,
  now,
  workedMs,
  remainingMs,
  progress,
  status,
  expectedHours,
  size = 'md',
  className
}: ClockFaceProps) {
  const theme = THEME[settings.theme];
  const sizes = SIZE[size];
  const date = new Date(now);
  const time = formatTimeOfDay(date, settings.hour12, settings.showSeconds);
  const ghost = time.replace(/\d/g, '8');
  const isSegmented = settings.style === 'segmented' || settings.style === 'retro';
  const lightTheme = settings.theme === 'light' || settings.theme === 'minimal';
  const statusTone = lightTheme ? STATUS_TONE_LIGHT[status] : STATUS_TONE[status];
  const targetLabel = `${String(Math.floor(expectedHours)).padStart(2, '0')}:${String(
    Math.round(expectedHours % 1 * 60)
  ).padStart(2, '0')}`;

  return (
    <div
      className={cn(
        'relative isolate flex w-full flex-col overflow-hidden',
        sizes.radius,
        sizes.pad,
        sizes.gap,
        theme.shell,
        settings.theme === 'retro' && 'bg-[#120d08]',
        className
      )}
      style={
      settings.theme === 'retro' ?
      { boxShadow: 'inset 0 1px 0 rgba(255,196,96,0.14), 0 20px 50px -24px rgba(0,0,0,0.7)' } :
      undefined
      }>
      
      {theme.sheen && <div className="clock-sheen absolute inset-x-0 top-0 h-1/2" aria-hidden="true" />}

      {(settings.showStatus || settings.showDay || settings.showDate) &&
      <div className="flex items-start justify-between gap-4">
          {settings.showStatus ?
        <span
          className={cn('flex items-center gap-2 font-semibold uppercase tracking-[0.18em]', sizes.meta, statusTone)}>
          
              <span
            className={cn(
              'h-1.5 w-1.5 rounded-full bg-current',
              (status === 'working' || status === 'break') && 'animate-pulse-dot'
            )} />
          
              {STATUS_LABEL[status]}
            </span> :

        <span />
        }
          {(settings.showDay || settings.showDate) &&
        <span className={cn('font-medium uppercase tracking-[0.14em]', sizes.meta, theme.muted)}>
              {settings.showDay && settings.showDate ?
          longDate(date) :
          settings.showDay ?
          longDate(date).split(',')[0] :
          longDate(date).split(', ')[1]}
            </span>
        }
        </div>
      }

      <div className="flex items-end justify-center gap-3">
        <div className="relative">
          {isSegmented &&
          <span
            aria-hidden="true"
            className={cn('absolute inset-0 select-none leading-none opacity-[0.09]', STYLE_FONT[settings.style], sizes.digits, theme.digits)}>
            
              {ghost}
            </span>
          }
          <span
            className={cn('num relative block leading-none', STYLE_FONT[settings.style], sizes.digits, theme.digits)}
            style={
            settings.theme === 'retro' ?
            { textShadow: '0 0 18px rgba(252,211,77,0.45)' } :
            settings.theme === 'dark' || settings.theme === 'glass' ?
            { textShadow: '0 0 24px rgba(255,255,255,0.18)' } :
            undefined
            }>
            
            {time}
          </span>
        </div>
        {settings.hour12 &&
        <span className={cn('mb-[0.35em] font-semibold uppercase tracking-[0.12em]', sizes.meta, theme.muted)}>
            {meridiem(date)}
          </span>
        }
      </div>

      {(settings.showWorked || settings.showRemaining || size === 'mini') &&
      <div className="flex items-end justify-between gap-4">
          {settings.showWorked ?
        <Indicator label="Worked" value={formatDurationHMS(workedMs)} muted={theme.muted} size={sizes.meta} /> :

        <span />
        }
          <Indicator label="Target" value={targetLabel} muted={theme.muted} size={sizes.meta} align="center" />
          {settings.showRemaining ?
        <Indicator
          label="Remaining"
          value={formatDurationHMS(remainingMs)}
          muted={theme.muted}
          size={sizes.meta}
          align="right" /> :


        <span />
        }
        </div>
      }

      {settings.showProgress &&
      <div className="flex flex-col gap-2">
          <div className={cn('h-1.5 w-full overflow-hidden rounded-full', theme.track)}>
            <div
            className={cn('h-full rounded-full transition-[width] duration-500 ease-snap', theme.fill)}
            style={{ width: `${Math.max(progress * 100, progress > 0 ? 1.5 : 0)}%` }} />
          
          </div>
          <div className={cn('flex justify-between font-medium uppercase tracking-[0.14em]', sizes.meta, theme.muted)}>
            <span>Workday</span>
            <span className="num">{Math.round(progress * 100)}%</span>
          </div>
        </div>
      }
    </div>);

}

export const clockStatusLabel = STATUS_LABEL;