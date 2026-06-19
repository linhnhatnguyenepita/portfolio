'use client';
import { Button } from '@heroui/react';
import { useState } from 'react';
import Image from 'next/image';
import cv from '@/public/cv.png';
import { IoPerson } from 'react-icons/io5';
import { FiDownload } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import ImageModal from './ImageModal';

export default function CV() {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);

  const downloadHandler = () => {
    const link = document.createElement('a');
    link.href = '/cv.pdf';
    link.download = 'Nhat-Linh_NGUYEN_CV.pdf';
    link.click();
  };

  return (
    <>
      <Button
        radius="full"
        className="mt-12 bg-accent px-7 py-6 text-base font-semibold text-cream shadow-lg shadow-accent/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-deep active:translate-y-0"
        startContent={<IoPerson aria-hidden="true" />}
        onPress={() => setOpen(true)}
      >
        {t('hero-cv')}
      </Button>

      <ImageModal
        open={open}
        onClose={() => setOpen(false)}
        title={t('hero-cv')}
        panelClassName="w-full mx-4 lg:w-1/2"
      >
        <div className="flex flex-col items-center gap-6 pt-6">
          <Button
            radius="full"
            className="bg-accent px-6 font-semibold text-cream transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-deep"
            startContent={<FiDownload aria-hidden="true" />}
            onPress={downloadHandler}
          >
            {t('hero-download')}
          </Button>
          <Image
            src={cv}
            alt="Resume of Nhat Linh Nguyen, frontend developer"
            className="h-auto w-full rounded-lg"
          />
        </div>
      </ImageModal>
    </>
  );
}
