'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PortableText } from '@portabletext/react';
import Article from '../../components/article';
import { ArticleItem } from '../../types/index';

interface Props {
  article: ArticleItem;
  otherArticles: ArticleItem[];
}

export default function CaseDetailClient({ article, otherArticles }: Props) {
  const params = useParams();
  const locale = Array.isArray(params.locale) ? params.locale[0] : (params.locale as string);

  return (
    <motion.div
      className="min-h-screen bg-[#ece9dc]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Main content area */}
      <div className="flex flex-col lg:flex-row w-full max-w-6xl mx-auto px-4 sm:px-8 py-12 gap-12">

        {/* Sidebar — desktop only */}
        <aside className="hidden lg:flex flex-col gap-4 w-[30%] sticky top-24 self-start">
          <Link
            href={`/${locale}/#case`}
            className="text-sm text-[#8e705b] hover:underline"
          >
            ← Back
          </Link>
          <h1 className="text-4xl font-semibold text-[#3d2e26] leading-tight">
            {article.title}
          </h1>
          {article.date && (
            <span className="text-sm text-[#8e705b]">{article.date}</span>
          )}
        </aside>

        {/* Content column */}
        <div className="flex-1">

          {/* Mobile header — hidden on desktop */}
          <div className="lg:hidden flex flex-col gap-2 mb-6">
            <Link
              href={`/${locale}/#case`}
              className="text-sm text-[#8e705b] hover:underline"
            >
              ← Back
            </Link>
            <h1 className="text-3xl font-semibold text-[#3d2e26] leading-tight">
              {article.title}
            </h1>
            {article.date && (
              <span className="text-sm text-[#8e705b]">{article.date}</span>
            )}
          </div>

          {/* Hero image */}
          {article.image && (
            <div className="relative aspect-video w-full rounded-md overflow-hidden mb-8">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Body */}
          <div className="prose prose-stone max-w-none">
            <PortableText value={article.body} />
          </div>
        </div>
      </div>

      {/* Other Case Studies */}
      {otherArticles.length > 0 && (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 pb-16">
          <div className="h-[2px] bg-[#8e705b] w-32 mb-6" />
          <p className="text-xs uppercase tracking-widest text-[#8e705b] mb-6">
            Other Case Studies
          </p>
          <div className="flex flex-row gap-6 overflow-x-auto snap-x snap-mandatory pb-4">
            {otherArticles.map((other) => (
              <div
                key={other.id}
                className="min-w-[280px] max-w-[320px] snap-start flex-shrink-0"
              >
                <Article
                  id={other.id}
                  image={other.image}
                  body={other.body}
                  date={other.date}
                  title={other.title}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
