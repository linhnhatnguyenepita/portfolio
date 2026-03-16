'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

function getExcerpt(body: string): string {
  return (body ?? '').replace(/[#*`>\[\]_~]/g, '').trim().slice(0, 120);
}

export default function Article(props: {
  id: string;
  image: string;
  body: string;
  date: string;
  title: string;
}) {
  const params = useParams();
  const locale = Array.isArray(params.locale) ? params.locale[0] : (params.locale as string);
  const excerpt = getExcerpt(props.body);

  return (
    <Link href={`/${locale}/case/${props.id}`} className="block w-full">
      <motion.div
        key={props.id}
        className="w-full bg-[#e7e4d6] rounded-xl flex flex-col p-6 hover:shadow-lg transition cursor-pointer"
      >
        {props.image && (
          <div className="relative aspect-video w-full rounded-md overflow-hidden mb-4">
            <Image
              src={props.image}
              alt={props.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="flex flex-col gap-1">
          {props.date && (
            <span className="text-xs text-[#8e705b]">{props.date}</span>
          )}
          <h2 className="font-semibold text-xl">{props.title}</h2>
          {excerpt && (
            <p className="text-sm text-[#6b6259] line-clamp-2 mt-1">
              {excerpt}
            </p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
