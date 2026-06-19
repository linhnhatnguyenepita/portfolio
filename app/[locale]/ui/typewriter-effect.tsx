'use client';

import { cn } from '@/utils/cn';
import {
  motion,
  stagger,
  useAnimate,
  useInView,
  useReducedMotion,
} from 'motion/react';
import { useEffect } from 'react';

export const TypewriterEffect = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}) => {
  const reduceMotion = useReducedMotion();

  // split text inside of words into array of characters
  const wordsArray = words.map((word) => {
    return {
      ...word,
      text: word.text.split(''),
    };
  });

  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);
  useEffect(() => {
    if (!isInView) return;
    if (reduceMotion) {
      // Reveal all characters instantly, no per-character stagger.
      animate('span', { display: 'inline-block', opacity: 1 }, { duration: 0 });
      return;
    }
    animate(
      'span',
      {
        display: 'inline-block',
        opacity: 1,
      },
      {
        duration: 0.3,
        delay: stagger(0.1),
        ease: 'easeInOut',
      }
    );
  }, [animate, isInView, reduceMotion]);

  const renderWords = () => {
    return (
      <motion.div ref={scope} className="inline">
        {wordsArray.map((word, idx) => {
          return (
            <div key={`word-${idx}`} className="inline-block">
              {word.text.map((char, index) => (
                <motion.span
                  initial={{}}
                  key={`char-${index}`}
                  className={cn(`opacity-0 hidden`, word.className)}
                >
                  {char}
                </motion.span>
              ))}
              &nbsp;
            </div>
          );
        })}
      </motion.div>
    );
  };
  return (
    <div
      className={cn(
        'text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-bold text-center',
        className
      )}
    >
      {renderWords()}
      <motion.span
        aria-hidden="true"
        initial={{
          opacity: reduceMotion ? 1 : 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                duration: 0.8,
                repeat: Infinity,
                repeatType: 'reverse',
              }
        }
        className={cn(
          'inline-block rounded-sm w-[2px] sm:w-[3px] md:w-[4px] h-[24px] sm:h-[48px] md:h-[72px] lg:h-[92px] bg-accent',
          cursorClassName
        )}
      ></motion.span>
    </div>
  );
};

export const TypewriterEffectSmooth = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}) => {
  // split text inside of words into array of characters
  const wordsArray = words.map((word) => {
    return {
      ...word,
      text: word.text.split(''),
    };
  });
  const renderWords = () => {
    return (
      <div>
        {wordsArray.map((word, idx) => {
          return (
            <div key={`word-${idx}`} className="inline-block">
              {word.text.map((char, index) => (
                <span
                  key={`char-${index}`}
                  className={cn(`dark:text-white text-black `, word.className)}
                >
                  {char}
                </span>
              ))}
              &nbsp;
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn('flex space-x-1 my-6', className)}>
      <motion.div
        className="overflow-hidden "
        initial={{
          width: '0%',
        }}
        whileInView={{
          width: 'fit-content',
        }}
        transition={{
          duration: 2,
          ease: 'linear',
          delay: 1,
        }}
      >
        <div
          className="text-xs sm:text-base md:text-xl lg:text-3xl xl:text-5xl font-bold"
          style={{
            whiteSpace: 'nowrap',
          }}
        >
          {renderWords()}{' '}
        </div>{' '}
      </motion.div>
      <motion.span
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.8,

          repeat: Infinity,
          repeatType: 'reverse',
        }}
        className={cn(
          'block rounded-sm w-[2px] sm:w-[3px] md:w-[4px] h-2 sm:h-4 md:h-6 lg:h-8 xl:h-12 bg-blue-500',
          cursorClassName
        )}
      ></motion.span>
    </div>
  );
};
