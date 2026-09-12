import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'center' | 'drawer';
}

const SIZES = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' };

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  variant = 'center'
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div
          className="absolute inset-0 bg-ink-950/40 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          onClick={onClose} />
        
          <motion.div
          initial={variant === 'drawer' ? { x: 32, opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
          animate={variant === 'drawer' ? { x: 0, opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={variant === 'drawer' ? { x: 32, opacity: 0 } : { opacity: 0, scale: 0.97, y: 6 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className={cn(
            'relative z-10 flex flex-col bg-surface shadow-pop',
            variant === 'drawer' ?
            'ml-auto h-full w-full max-w-[520px] border-l border-ink-200' :
            cn('m-auto w-[calc(100%-2rem)] rounded-2xl border border-ink-200', SIZES[size])
          )}>
          
            <header className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-5">
              <div>
                <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-ink-900">{title}</h2>
                {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
              </div>
              <button
              onClick={onClose}
              aria-label="Close"
              className="-mr-1 -mt-1 rounded-lg p-1.5 text-ink-400 transition-colors duration-150 hover:bg-ink-100 hover:text-ink-700">
              
                <XIcon className="h-4 w-4" />
              </button>
            </header>
            <div className="thin-scroll flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer &&
          <footer className="flex items-center justify-end gap-2 border-t border-ink-100 bg-ink-50/60 px-6 py-4">
                {footer}
              </footer>
          }
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}