'use client';
import { motion, useReducedMotion } from 'motion/react';

/**
 * Shared outline trigger for the About panels (education / skills / experience).
 * Accent outline that fills on hover. Single radius + accent system.
 */
export default function PanelButton({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={reduceMotion ? undefined : { y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      className="group flex w-full items-center justify-between gap-3 rounded-xl border border-accent/60 bg-transparent px-5 py-4 text-left font-semibold text-accent-deep transition-colors duration-300 hover:border-transparent hover:bg-accent hover:text-cream"
    >
      <span>{label}</span>
      {icon && <span aria-hidden="true" className="text-lg opacity-70 transition-opacity group-hover:opacity-100">{icon}</span>}
    </motion.button>
  );
}
