import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ExpandIcon, RotateCcwIcon, SaveIcon } from 'lucide-react';
import { ClockFace } from '../../components/clock/ClockFace';
import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { Toggle } from '../../components/ui/Field';
import { useApp } from '../../contexts/AppContext';
import { useNow } from '../../hooks/useNow';
import { sessionTotals } from '../../utils/time';
import { cn } from '../../utils/cn';
import type { ClockSettings, ClockStyle, ClockTheme } from '../../types';

const STYLES: {key: ClockStyle;label: string;hint: string;}[] = [
{ key: 'segmented', label: 'Segmented', hint: 'Seven-segment display' },
{ key: 'digital', label: 'Digital', hint: 'Monospace precision' },
{ key: 'minimal', label: 'Minimal', hint: 'Light, wide-set' },
{ key: 'modern', label: 'Modern', hint: 'Geometric sans' },
{ key: 'retro', label: 'Retro', hint: 'Amber alarm clock' }];


const THEMES: {key: ClockTheme;label: string;swatch: string;}[] = [
{ key: 'dark', label: 'Dark', swatch: 'bg-ink-950' },
{ key: 'light', label: 'Light', swatch: 'bg-white border border-ink-200' },
{ key: 'minimal', label: 'Minimal', swatch: 'bg-canvas border border-ink-200' },
{ key: 'glass', label: 'Glass', swatch: 'bg-ink-700/70 backdrop-blur' },
{ key: 'retro', label: 'Retro', swatch: 'bg-[#120d08]' }];


const TOGGLES: {key: keyof ClockSettings;label: string;}[] = [
{ key: 'showSeconds', label: 'Seconds' },
{ key: 'showDate', label: 'Date' },
{ key: 'showDay', label: 'Day' },
{ key: 'showStatus', label: 'Working status' },
{ key: 'showWorked', label: 'Hours worked' },
{ key: 'showRemaining', label: 'Remaining hours' },
{ key: 'showProgress', label: 'Progress bar' }];


export function CustomizeClock() {
  const { clockSettings, saveClockSettings, currentUser, session } = useApp();
  const navigate = useNavigate();
  const now = useNow();
  const [draft, setDraft] = useState<ClockSettings>(clockSettings);

  if (!currentUser) return null;
  const totals = sessionTotals(session, now, currentUser.expectedHours);
  const set = <K extends keyof ClockSettings,>(key: K, value: ClockSettings[K]) =>
  setDraft((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.025em] text-ink-900">Customize clock</h2>
          <p className="mt-1 text-[13px] text-ink-500">
            Your choices apply to the dashboard clock, the widget and full-screen mode.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button icon={<RotateCcwIcon className="h-4 w-4" />} onClick={() => setDraft(clockSettings)}>
            Reset
          </Button>
          <Button
            variant="primary"
            icon={<SaveIcon className="h-4 w-4" />}
            onClick={() => {
              saveClockSettings(draft);
              toast.success('Clock saved', { description: 'Applied everywhere you see your clock.' });
            }}>
            
            Save clock
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3 lg:sticky lg:top-20 lg:self-start">
          <div
            className={cn(
              'rounded-[26px] p-4',
              draft.theme === 'light' || draft.theme === 'minimal' ? 'bg-ink-100' : 'bg-ink-900'
            )}>
            
            <ClockFace
              settings={draft}
              now={now}
              workedMs={totals.workedMs}
              remainingMs={totals.remainingMs}
              progress={totals.progress || 0.31}
              status={session.status === 'not_in' ? 'working' : session.status}
              expectedHours={currentUser.expectedHours}
              size="lg" />
            
          </div>
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-ink-400">Live preview · updates as you change settings</p>
            <button
              onClick={() => navigate('/me/fullscreen')}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent-700 hover:text-accent-800">
              
              <ExpandIcon className="h-3.5 w-3.5" />
              Open full screen
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <Panel title="Clock style">
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map((s) =>
              <button
                key={s.key}
                onClick={() => set('style', s.key)}
                aria-pressed={draft.style === s.key}
                className={cn(
                  'rounded-xl border p-3 text-left transition-colors duration-150 ease-snap',
                  draft.style === s.key ?
                  'border-accent-600 bg-accent-50' :
                  'border-ink-200 bg-white hover:border-ink-300'
                )}>
                
                  <span
                  className={cn(
                    'num block text-[19px] leading-none text-ink-900',
                    s.key === 'digital' && 'font-mono',
                    (s.key === 'segmented' || s.key === 'retro') && 'font-seg',
                    s.key === 'minimal' && 'font-sans font-light tracking-tight',
                    s.key === 'modern' && 'font-display'
                  )}>
                  
                    09:42
                  </span>
                  <span className="mt-2 block text-[13px] font-medium text-ink-900">{s.label}</span>
                  <span className="block text-xs text-ink-400">{s.hint}</span>
                </button>
              )}
            </div>
          </Panel>

          <Panel title="Theme">
            <div className="flex flex-wrap gap-2">
              {THEMES.map((t) =>
              <button
                key={t.key}
                onClick={() => set('theme', t.key)}
                aria-pressed={draft.theme === t.key}
                className={cn(
                  'flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 text-[13px] font-medium transition-colors duration-150',
                  draft.theme === t.key ?
                  'border-accent-600 bg-accent-50 text-accent-800' :
                  'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
                )}>
                
                  <span className={cn('h-5 w-5 rounded-full', t.swatch)} />
                  {t.label}
                </button>
              )}
            </div>
          </Panel>

          <Panel title="Display">
            <div className="mb-3 flex items-center gap-1 rounded-lg bg-ink-100 p-0.5">
              {[
              { label: '12 hour', value: true },
              { label: '24 hour', value: false }].
              map((opt) =>
              <button
                key={opt.label}
                onClick={() => set('hour12', opt.value)}
                className={cn(
                  'flex-1 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors duration-150',
                  draft.hour12 === opt.value ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800'
                )}>
                
                  {opt.label}
                </button>
              )}
            </div>
            <div className="divide-y divide-ink-100">
              {TOGGLES.map((t) =>
              <div key={t.key} className="py-0.5">
                  <Toggle
                  checked={Boolean(draft[t.key])}
                  onChange={(v) => set(t.key, v as never)}
                  label={t.label} />
                
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>);

}