'use client';
import Image from 'next/image';
import profile from '@/public/about.webp';
import profile_chaise from '@/public/profile-chaise.jpg';
import profile_music from '@/public/profile-music.jpg';
import profile_thinking from '@/public/profile_thinking.jpg';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'motion/react';
import Education from './education';
import Skills from './skills';
import Experience from './experience';

function About() {
  const { t } = useTranslation('common');
  const reduceMotion = useReducedMotion();

  const reveal = (delay = 0) =>
    reduceMotion
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.2 },
          transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <section
      id="about"
      className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-24 sm:px-8 lg:py-32"
    >
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        {/* Left: copy + panels */}
        <div>
          <motion.h2
            className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-7xl"
            {...reveal(0.05)}
          >
            {t('about-title')}
          </motion.h2>
          <motion.div className="accent-rule mb-8 mt-5" {...reveal(0.1)} />

          <motion.p
            className="max-w-[60ch] text-[15px] leading-7 text-ink-soft sm:text-base"
            {...reveal(0.15)}
          >
            {t('about-description')}
          </motion.p>

          <motion.div
            className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3"
            {...reveal(0.2)}
          >
            <Education />
            <Skills />
            <Experience />
          </motion.div>
        </div>

        {/* Right: portrait bento */}
        <motion.div
          className="grid aspect-square grid-cols-2 grid-rows-3 gap-3 sm:gap-4"
          {...reveal(0.1)}
        >
          <div className="relative overflow-hidden rounded-xl">
            <Image
              alt="Nhat Linh Nguyen in a studio with music equipment"
              src={profile_music}
              placeholder="blur"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div className="relative row-span-2 overflow-hidden rounded-xl">
            <Image
              alt="Portrait of Nhat Linh Nguyen"
              src={profile}
              placeholder="blur"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div className="relative row-span-2 overflow-hidden rounded-xl">
            <Image
              alt="Nhat Linh Nguyen seated in a studio"
              src={profile_chaise}
              placeholder="blur"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div className="relative overflow-hidden rounded-xl">
            <Image
              alt="Nhat Linh Nguyen, candid portrait"
              src={profile_thinking}
              placeholder="blur"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default About;
