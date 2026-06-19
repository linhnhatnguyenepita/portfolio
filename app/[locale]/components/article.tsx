'use client';
import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FiArrowUpRight } from 'react-icons/fi';

function getExcerpt(body: string): string {
  return (body ?? '')
    .replace(/[#*`>\[\]_~]/g, '')
    .trim()
    .slice(0, 120);
}

export default function Article(props: {
  id: string;
  image: string;
  body: string;
  date: string;
  title: string;
  index?: number;
}) {
  const params = useParams();
  const reduceMotion = useReducedMotion();
  const locale = Array.isArray(params.locale)
    ? params.locale[0]
    : (params.locale as string);
  const excerpt = getExcerpt(props.body);

  const reveal = reduceMotion
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: {
          duration: 0.5,
          delay: (props.index ?? 0) * 0.08,
          ease: [0.16, 1, 0.3, 1] as const,
        },
      };

  return (
    <motion.div {...reveal} className="h-full">
      <Link
        href={`/${locale}/case/${props.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5"
      >
        {props.image && (
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <Image
              src={props.image}
              alt={props.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <div className="flex flex-1 flex-col gap-2 p-6">
          {props.date && (
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-accent-deep">
              {props.date}
            </span>
          )}
          <h3 className="font-display text-xl font-semibold leading-snug text-ink">
            {props.title}
          </h3>
          {excerpt && (
            <p className="line-clamp-2 text-sm leading-6 text-ink-soft">
              {excerpt}
            </p>
          )}
          <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-accent-deep">
            Read case study
            <FiArrowUpRight
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
