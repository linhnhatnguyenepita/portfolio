'use client';
import { TypewriterEffect } from '../ui/typewriter-effect';
import CV from './cv';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'motion/react';

export default function Hero() {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  const nameWords = [
    { text: 'Nhat', className: 'text-ink' },
    { text: 'Linh', className: 'text-ink' },
    { text: 'NGUYEN', className: 'text-accent' },
  ];

  const fade = (delay: number) =>
    reduceMotion
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.7,
            delay,
            ease: [0.16, 1, 0.3, 1] as const,
          },
        };

  return (
    <section className="relative w-full overflow-hidden">
      {/* soft editorial backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, rgba(142,112,91,0.10), transparent 70%)',
        }}
      />
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-6xl flex-col items-center justify-center px-4 py-20 text-center sm:px-8">
        <motion.p className="eyebrow mb-6" {...fade(0)}>
          Portfolio
        </motion.p>

        <h1 className="font-display font-bold leading-[1.05] tracking-tightest">
          <TypewriterEffect
            words={nameWords}
            className="text-5xl sm:text-7xl lg:text-8xl"
          />
        </h1>

        <motion.p
          className="mt-6 max-w-xl font-sans text-lg font-medium uppercase tracking-[0.3em] text-ink-soft sm:text-xl"
          {...fade(0.35)}
        >
          {t('hero-title')}
        </motion.p>

        <motion.div {...fade(0.5)}>
          <CV />
        </motion.div>
      </div>
    </section>
  );
}
