'use client';
import { Button } from '@nextui-org/react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import Image from 'next/image';
import cv from '@/public/cv.png';
import { IoMdClose } from 'react-icons/io';
import { IoPerson } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';

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
        className="mt-8 text-medium font-bold bg-[#8e705b] text-white !rounded-lg !shadow-lg !transform hover:scale-105 transition-all duration-300"
        startContent={<IoPerson />}
        onClick={() => setOpen(true)}
      >
        {t('hero-cv')}
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="w-full h-full flex items-center justify-center fixed top-1/2 left-1/2 bg-[#b0ada08c] z-50 !transform -translate-x-1/2 -translate-y-1/2  backdrop-blur-lg text-black"
            key={'cv'}
            layoutId={'cv'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full h-screen bg-transparent absolute top-0 left-0 z-0"
              onClick={() => setOpen(false)}
            ></motion.div>
            <motion.div className="w-full mx-8 lg:w-1/2 h-5/6 flex flex-col items-start justify-start bg-[#ece9dc] overflow-y-auto p-4 rounded-lg z-10">
              <motion.div className="mt-4 flex flex-col items-center justify-start">
                <Button
                  className="mb-4 text-medium font-bold bg-[#8e705b] text-white !rounded-lg !shadow-lg !transform hover:scale-105 transition-all duration-300"
                  onClick={downloadHandler}
                >
                  {t('hero-download')}
                </Button>
                <Image src={cv} alt="cv" />
              </motion.div>
              <motion.button
                className="absolute top-4 right-4 bg-[#8e705b] rounded-full p-2"
                onClick={() => setOpen(false)}
              >
                <IoMdClose color="#d9d6c8" className="stroke-[20px]" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
