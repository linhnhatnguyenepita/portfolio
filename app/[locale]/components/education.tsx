'use client';
import Image from 'next/image';
import education from '@/public/education.png';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuGraduationCap } from 'react-icons/lu';
import ImageModal from './ImageModal';
import PanelButton from './PanelButton';

export default function Education() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  return (
    <>
      <PanelButton
        label={t('about-education')}
        icon={<LuGraduationCap />}
        onClick={() => setOpen(true)}
      />
      <ImageModal open={open} onClose={() => setOpen(false)} title={t('about-education')}>
        <div className="flex flex-col items-center pt-4">
          <h2 className="font-display text-4xl font-bold text-ink sm:text-6xl">
            {t('about-education')}
          </h2>
          <Image
            src={education}
            alt={`${t('about-education')} of Nhat Linh Nguyen`}
            className="mt-8 h-auto w-full max-w-2xl"
          />
        </div>
      </ImageModal>
    </>
  );
}
