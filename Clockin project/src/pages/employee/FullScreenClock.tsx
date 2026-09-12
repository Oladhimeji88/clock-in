import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { MinimizeIcon, SettingsIcon, XIcon } from 'lucide-react';
import { ClockFace } from '../../components/clock/ClockFace';
import { useApp } from '../../contexts/AppContext';
import { useNow } from '../../hooks/useNow';
import { sessionTotals } from '../../utils/time';
import { cn } from '../../utils/cn';
import type { ClockStyle, ClockTheme } from '../../types';

const STYLES: ClockStyle[] = ['segmented', 'digital', 'minimal', 'modern', 'retro'];
const THEMES: ClockTheme[] = ['dark', 'light', 'minimal', 'glass', 'retro'];

export function FullScreenClock() {
  const { currentUser, session, clockSettings, saveClockSettings } = useApp();
  const now = useNow();
  const navigate = useNavigate();
  const [panelOpen, setPanelOpen] = useState(false);

  if (!currentUser) return <Navigate to="/" replace />;

  const totals = sessionTotals(session, now, currentUser.expectedHours);
  const light = clockSettings.theme === 'light' || clockSettings.theme === 'minimal';

  const requestNativeFullscreen = () => {
    const el = document.documentElement;
    if (!document.fullscreenElement && el.requestFullscreen) el.requestFullscreen().catch(() => undefined);else
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
  };

  return (
    <div
      className={cn(
        'relative flex min-h-screen w-full items-center justify-center',
        clockSettings.theme === 'retro' ? 'bg-[#0a0704]' : light ? 'bg-canvas' : 'bg-ink-950'
      )}>
      
      <ClockFace
        settings={clockSettings}
        now={now}
        workedMs={totals.workedMs}
        remainingMs={totals.remainingMs}
        progress={totals.progress}
        status={session.status}
        expectedHours={currentUser.expectedHours}
        size="xl"
        className="max-w-[1400px] border-transparent bg-transparent shadow-none" />
      

      <div className="absolute right-4 top-4 flex items-center gap-1.5">
        <button
          onClick={requestNativeFullscreen}
          aria-label="Toggle browser full screen"
          className={cn(
            'rounded-lg p-2 transition-colors duration-150',
            light ? 'text-ink-400 hover:bg-ink-200' : 'text-white/40 hover:bg-white/10 hover:text-white'
          )}>
          
          <MinimizeIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => setPanelOpen((p) => !p)}
          aria-label="Clock settings"
          className={cn(
            'rounded-lg p-2 transition-colors duration-150',
            light ? 'text-ink-400 hover:bg-ink-200' : 'text-white/40 hover:bg-white/10 hover:text-white'
          )}>
          
          <SettingsIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => navigate('/me')}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors duration-150',
            light ? 'text-ink-500 hover:bg-ink-200' : 'text-white/50 hover:bg-white/10 hover:text-white'
          )}>
          
          <XIcon className="h-4 w-4" />
          Exit full screen
        </button>
      </div>

      {panelOpen &&
      <div className="absolute right-4 top-16 w-[260px] rounded-xl border border-ink-200 bg-surface p-4 shadow-pop">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">Style</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {STYLES.map((s) =>
          <button
            key={s}
            onClick={() => saveClockSettings({ ...clockSettings, style: s })}
            className={cn(
              'rounded-lg border px-2.5 py-1 text-[13px] capitalize transition-colors duration-150',
              clockSettings.style === s ?
              'border-accent-600 bg-accent-50 text-accent-800' :
              'border-ink-200 text-ink-600 hover:border-ink-300'
            )}>
            
                {s}
              </button>
          )}
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">Theme</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {THEMES.map((t) =>
          <button
            key={t}
            onClick={() => saveClockSettings({ ...clockSettings, theme: t })}
            className={cn(
              'rounded-lg border px-2.5 py-1 text-[13px] capitalize transition-colors duration-150',
              clockSettings.theme === t ?
              'border-accent-600 bg-accent-50 text-accent-800' :
              'border-ink-200 text-ink-600 hover:border-ink-300'
            )}>
            
                {t}
              </button>
          )}
          </div>
          <button
          onClick={() => navigate('/me/customize')}
          className="mt-4 text-[13px] font-medium text-accent-700 hover:text-accent-800">
          
            All clock settings →
          </button>
        </div>
      }
    </div>);

}