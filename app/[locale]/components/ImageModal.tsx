'use client';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { IoMdClose } from 'react-icons/io';

/**
 * Accessible modal shell for the raster-image panels (CV / skills / education /
 * experience). Handles Escape-to-close, click-outside, focus capture on open,
 * focus restore on close, body scroll lock, and dialog aria semantics.
 */
export default function ImageModal({
  open,
  onClose,
  title,
  children,
  panelClassName = 'w-full mx-4 sm:w-3/4 lg:w-2/3',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  panelClassName?: string;
}) {
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-md sm:p-8 lg:p-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        >
          <button
            type="button"
            aria-label="Close dialog"
            tabIndex={-1}
            className="absolute inset-0 h-full w-full cursor-default"
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            className={`relative z-10 flex max-h-[88vh] flex-col overflow-y-auto rounded-2xl border border-line bg-surface p-4 shadow-2xl sm:p-8 lg:p-12 ${panelClassName}`}
            initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              ref={closeRef}
              type="button"
              aria-label="Close dialog"
              onClick={onClose}
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-cream transition-colors hover:bg-accent-deep"
            >
              <IoMdClose size={20} />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
