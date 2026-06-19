'use client';
import Image from 'next/image';
import experiences from '@/public/experiences.png';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuBriefcase } from 'react-icons/lu';
import ImageModal from './ImageModal';
import PanelButton from './PanelButton';

export default function Experience() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  return (
    <>
      <PanelButton
        label={t('about-experiences')}
        icon={<LuBriefcase />}
        onClick={() => setOpen(true)}
      />
      <ImageModal open={open} onClose={() => setOpen(false)} title={t('about-experiences')}>
        <div className="flex flex-col items-center pt-4">
          <h2 className="font-display text-4xl font-bold text-ink sm:text-6xl">
            {t('about-experiences')}
          </h2>
          <Image
            src={experiences}
            alt={`${t('about-experiences')} of Nhat Linh Nguyen`}
            className="mt-8 h-auto w-full max-w-2xl"
          />
        </div>
      </ImageModal>
    </>
  );
}
