import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useMotionValue } from 'framer-motion';
import { GripVerticalIcon, PictureInPicture2Icon, MinusIcon, TimerIcon, XIcon } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useNow } from '../../hooks/useNow';
import { useDocumentPiP } from '../../hooks/useDocumentPiP';
import { useWidgetVisibility } from '../../hooks/useWidgetVisibility';
import { sessionTotals, formatDurationHMS } from '../../utils/time';
import { ClockFace, type ClockSize } from './ClockFace';
import { cn } from '../../utils/cn';

const SIZES: {key: ClockSize;label: string;width: string;}[] = [
{ key: 'mini', label: 'S', width: 'w-[236px]' },
{ key: 'sm', label: 'M', width: 'w-[300px]' },
{ key: 'md', label: 'L', width: 'w-[400px]' }];


const POSITION_KEY = 'chronotrack_widget_position';

function loadSavedPosition(): {x: number;y: number;} {
  try {
    const saved = localStorage.getItem(POSITION_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    /* ignore storage errors */
  }
  return { x: 0, y: 0 };
}

export function MiniClockWidget() {
  const { currentUser, session, clockSettings } = useApp();
  const now = useNow();
  const [open, setOpen] = useState(false);
  const [sizeIndex, setSizeIndex] = useState(1);
  const [visible, setVisible] = useWidgetVisibility();
  const { supported: pipSupported, pipWindow, open: openPip, close: closePip } = useDocumentPiP();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const saved = useRef(loadSavedPosition());
  const x = useMotionValue(saved.current.x);
  const y = useMotionValue(saved.current.y);
  const draggedRef = useRef(false);

  if (!currentUser || currentUser.role !== 'employee' || !visible) return null;

  const totals = sessionTotals(session, now, currentUser.expectedHours);
  const size = SIZES[sizeIndex];

  const persistPosition = () => {
    try {
      localStorage.setItem(POSITION_KEY, JSON.stringify({ x: x.get(), y: y.get() }));
    } catch {
      /* ignore storage errors */
    }
  };

  const clockFace =
  <ClockFace
    settings={{ ...clockSettings, showDate: false, showDay: false }}
    now={now}
    workedMs={totals.workedMs}
    remainingMs={totals.remainingMs}
    progress={totals.progress}
    status={session.status}
    expectedHours={currentUser.expectedHours}
    size={pipWindow ? 'sm' : size.key} />;


  return (
    <>
      <div ref={constraintsRef} className="pointer-events-none fixed inset-0 z-40">
        <motion.div
          drag
          dragConstraints={constraintsRef}
          dragMomentum={false}
          dragElastic={0}
          onDragStart={() => {
            draggedRef.current = false;
          }}
          onDrag={(_, info) => {
            if (Math.abs(info.offset.x) > 4 || Math.abs(info.offset.y) > 4) draggedRef.current = true;
          }}
          onDragEnd={persistPosition}
          style={{ x, y }}
          className={cn(
            'pointer-events-auto absolute bottom-20 right-4 cursor-grab shadow-pop active:cursor-grabbing sm:bottom-6 sm:right-6',
            open ? cn('rounded-[22px] bg-ink-950 p-1.5', size.width) : 'flex items-center gap-1.5 rounded-full'
          )}>

          {!open ?
          <>
              <button
              onClick={() => {
                if (draggedRef.current) return;
                setOpen(true);
              }}
              className="flex items-center gap-2.5 rounded-full border border-white/10 bg-ink-950 px-4 py-2.5 text-white transition-colors duration-150 hover:bg-ink-900">

                <TimerIcon className="h-4 w-4 text-emerald-400" />
                <span className="num font-mono text-sm">{formatDurationHMS(totals.workedMs)}</span>
                <span className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40 sm:inline">
                  Widget
                </span>
              </button>
              <button
              onClick={() => !draggedRef.current && setVisible(false)}
              aria-label="Close clock widget"
              className="grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-ink-950 text-white/40 transition-colors duration-150 hover:bg-ink-900 hover:text-white">

                <XIcon className="h-3.5 w-3.5" />
              </button>
            </> :

          <div>
              <div className="flex items-center justify-between px-2 py-1">
                <span className="flex items-center gap-1 text-white/30">
                  <GripVerticalIcon className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em]">Drag</span>
                </span>
                <div className="flex items-center gap-1">
                  {SIZES.map((s, i) =>
                <button
                  key={s.key}
                  onClick={() => !draggedRef.current && setSizeIndex(i)}
                  aria-label={`Widget size ${s.label}`}
                  className={cn(
                    'h-6 w-6 rounded-md text-[11px] font-semibold transition-colors duration-150',
                    i === sizeIndex ? 'bg-white/15 text-white' : 'text-white/40 hover:bg-white/10'
                  )}>

                      {s.label}
                    </button>
                )}
                  {pipSupported &&
                <>
                      <span className="mx-1 h-4 w-px bg-white/10" />
                      <button
                    onClick={() => !draggedRef.current && (pipWindow ? closePip() : openPip())}
                    aria-label={pipWindow ? 'Close floating window' : 'Pop out as floating window'}
                    className={cn(
                      'rounded-md p-1 transition-colors duration-150',
                      pipWindow ? 'bg-white/15 text-white' : 'text-white/40 hover:bg-white/10 hover:text-white'
                    )}>

                        <PictureInPicture2Icon className="h-3.5 w-3.5" />
                      </button>
                    </>
                }
                  <span className="mx-1 h-4 w-px bg-white/10" />
                  <button
                  onClick={() => !draggedRef.current && setOpen(false)}
                  aria-label="Minimize clock widget"
                  className="rounded-md p-1 text-white/40 transition-colors duration-150 hover:bg-white/10 hover:text-white">

                    <MinusIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                  onClick={() => !draggedRef.current && setVisible(false)}
                  aria-label="Close clock widget"
                  className="rounded-md p-1 text-white/40 transition-colors duration-150 hover:bg-white/10 hover:text-white">

                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {pipWindow ?
            <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
                  <PictureInPicture2Icon className="h-5 w-5 text-white/30" />
                  <p className="text-[13px] text-white/60">Showing in the floating window</p>
                </div> :

            clockFace}
            </div>
          }
        </motion.div>
      </div>

      {pipWindow && createPortal(
        <div className="flex h-screen w-screen items-center justify-center bg-[#0a0e17] p-3">
          {clockFace}
        </div>,
        pipWindow.document.body
      )}
    </>);

}
