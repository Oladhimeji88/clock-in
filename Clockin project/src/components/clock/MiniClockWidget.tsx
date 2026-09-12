import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GripVerticalIcon, Maximize2Icon, MinusIcon, TimerIcon } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useNow } from '../../hooks/useNow';
import { sessionTotals, formatDurationHMS } from '../../utils/time';
import { ClockFace, type ClockSize } from './ClockFace';
import { cn } from '../../utils/cn';

const SIZES: {key: ClockSize;label: string;width: string;}[] = [
{ key: 'mini', label: 'S', width: 'w-[236px]' },
{ key: 'sm', label: 'M', width: 'w-[300px]' },
{ key: 'md', label: 'L', width: 'w-[400px]' }];


export function MiniClockWidget() {
  const { currentUser, session, clockSettings } = useApp();
  const now = useNow();
  const [open, setOpen] = useState(false);
  const [sizeIndex, setSizeIndex] = useState(1);

  if (!currentUser || currentUser.role !== 'employee') return null;

  const totals = sessionTotals(session, now, currentUser.expectedHours);
  const size = SIZES[sizeIndex];

  return (
    <div className="pointer-events-none fixed inset-0 z-40 hidden md:block">
      <AnimatePresence initial={false}>
        {!open ?
        <motion.button
          key="collapsed"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          onClick={() => setOpen(true)}
          className="pointer-events-auto absolute bottom-6 right-6 flex items-center gap-2.5 rounded-full border border-white/10 bg-ink-950 px-4 py-2.5 text-white shadow-pop transition-colors duration-150 hover:bg-ink-900">
          
            <TimerIcon className="h-4 w-4 text-emerald-400" />
            <span className="num font-mono text-sm">{formatDurationHMS(totals.workedMs)}</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">Widget</span>
          </motion.button> :

        <motion.div
          key="expanded"
          drag
          dragMomentum={false}
          dragElastic={0}
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className={cn(
            'pointer-events-auto absolute bottom-6 right-6 rounded-[22px] bg-ink-950 p-1.5 shadow-pop',
            size.width
          )}>
          
            <div className="flex cursor-grab items-center justify-between px-2 py-1 active:cursor-grabbing">
              <span className="flex items-center gap-1 text-white/30">
                <GripVerticalIcon className="h-3.5 w-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em]">Drag</span>
              </span>
              <div className="flex items-center gap-1">
                {SIZES.map((s, i) =>
              <button
                key={s.key}
                onClick={() => setSizeIndex(i)}
                aria-label={`Widget size ${s.label}`}
                className={cn(
                  'h-6 w-6 rounded-md text-[11px] font-semibold transition-colors duration-150',
                  i === sizeIndex ? 'bg-white/15 text-white' : 'text-white/40 hover:bg-white/10'
                )}>
                
                    {s.label}
                  </button>
              )}
                <span className="mx-1 h-4 w-px bg-white/10" />
                <button
                onClick={() => setSizeIndex(2)}
                aria-label="Largest size"
                className="rounded-md p-1 text-white/40 transition-colors duration-150 hover:bg-white/10 hover:text-white">
                
                  <Maximize2Icon className="h-3.5 w-3.5" />
                </button>
                <button
                onClick={() => setOpen(false)}
                aria-label="Minimize clock widget"
                className="rounded-md p-1 text-white/40 transition-colors duration-150 hover:bg-white/10 hover:text-white">
                
                  <MinusIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <ClockFace
            settings={{ ...clockSettings, showDate: false, showDay: false }}
            now={now}
            workedMs={totals.workedMs}
            remainingMs={totals.remainingMs}
            progress={totals.progress}
            status={session.status}
            expectedHours={currentUser.expectedHours}
            size={size.key} />
          
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}