'use client';
import Image from 'next/image';
import skills from '@/public/skills.png';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuWrench } from 'react-icons/lu';
import ImageModal from './ImageModal';
import PanelButton from './PanelButton';

export default function Skills() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  return (
    <>
      <PanelButton
        label={t('about-skills')}
        icon={<LuWrench />}
        onClick={() => setOpen(true)}
      />
      <ImageModal open={open} onClose={() => setOpen(false)} title={t('about-skills')}>
        <div className="flex flex-col items-center pt-4">
          <h2 className="font-display text-4xl font-bold text-ink sm:text-6xl">
            {t('about-skills')}
          </h2>
          <Image
            src={skills}
            alt={`${t('about-skills')} of Nhat Linh Nguyen`}
            className="mt-8 h-auto w-full max-w-3xl"
          />
        </div>
      </ImageModal>
    </>
  );
}
