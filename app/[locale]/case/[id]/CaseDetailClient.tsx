'use client';

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Article from '../../components/article';
import TableOfContents from '../../components/TableOfContents';
import { extractToc } from '../../lib/markdown';
import type { ArticleItem } from '../../types/index';

interface Props {
  article: ArticleItem;
  otherArticles: ArticleItem[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const headingComponents = {
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 id={slugify(String(children))} {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 id={slugify(String(children))} {...props}>{children}</h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 id={slugify(String(children))} {...props}>{children}</h3>
  ),
  h4: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 id={slugify(String(children))} {...props}>{children}</h4>
  ),
  h5: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h5 id={slugify(String(children))} {...props}>{children}</h5>
  ),
  h6: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h6 id={slugify(String(children))} {...props}>{children}</h6>
  ),
};

export default function CaseDetailClient({ article, otherArticles }: Props) {
  const params = useParams();
  const locale = Array.isArray(params.locale) ? params.locale[0] : (params.locale as string);
  const toc = useMemo(() => extractToc(article.body), [article.body]);

  return (
    <motion.div
      className="case-detail-page min-h-screen bg-[#faf7ea] antialiased"
      style={{ color: '#24292e' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <main className="mx-auto max-w-[1280px] px-4 py-8">
        <Link
          href={`/${locale}/#case`}
          className="mb-6 inline-block text-sm"
          style={{ color: '#0366d6' }}
        >
          ← Back
        </Link>

        <article>
          <header className="mb-8 pb-8" style={{ borderBottom: '1px solid #eaecef' }}>
            {article.category && (
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: '#0366d6' }}
              >
                {article.category}
              </span>
            )}
            <h1
              className="mt-2 font-semibold leading-tight"
              style={{ color: '#24292e', fontSize: '2em' }}
            >
              {article.title}
            </h1>
            {article.date && (
              <time
                className="mt-3 block text-sm"
                style={{ color: '#6a737d' }}
              >
                {article.date}
              </time>
            )}
          </header>

          <div className="relative lg:flex lg:gap-10">
            <aside className="w-56 shrink-0">
              <TableOfContents entries={toc} />
            </aside>

            <div className="min-w-0 flex-1">
              {article.image && (
                <div
                  className="relative mb-8 w-full overflow-hidden rounded"
                  style={{ border: '1px solid #eaecef', aspectRatio: '16/9' }}
                >
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="prose max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={headingComponents}>
                  {article.body}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </article>
      </main>

      {otherArticles.length > 0 && (
        <div className="mx-auto max-w-[1280px] px-4 pb-16">
          <div className="h-[2px] w-32 mb-6" style={{ backgroundColor: '#eaecef' }} />
          <p
            className="text-xs uppercase tracking-widest mb-6"
            style={{ color: '#6a737d' }}
          >
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
