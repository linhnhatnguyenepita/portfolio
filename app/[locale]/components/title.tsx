'use client';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'motion/react';

export default function Title() {
  const { t } = useTranslation('common');
  const reduceMotion = useReducedMotion();
  const reveal = reduceMotion
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.3 },
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
      };

  return (
    <motion.div className="w-full" {...reveal}>
      <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-7xl">
        {t('cases-title')}
      </h2>
      <div className="accent-rule mt-5" />
    </motion.div>
  );
}
