'use client';

import React, { useEffect, useState } from 'react';
import type { TocEntry } from '../lib/markdown';

interface Props {
  entries: TocEntry[];
}

export default function TableOfContents({ entries }: Props) {
  const [activeSlug, setActiveSlug] = useState<string>('');

  useEffect(() => {
    const headings = entries.map((e) => document.getElementById(e.slug)).filter(Boolean) as HTMLElement[];
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (ioEntries) => {
        for (const entry of ioEntries) {
          if (entry.isIntersecting) {
            setActiveSlug(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '0px 0px -60% 0px', threshold: 0.1 },
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <nav className="toc-sidebar hidden lg:block">
      <div className="sticky top-8">
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-wider"
          style={{ color: '#24292e' }}
        >
          Contents
        </p>
        <ol className="space-y-1 border-l" style={{ borderColor: '#eaecef' }}>
          {entries.map((e) => {
            const isActive = activeSlug === e.slug;
            return (
              <li
                key={e.slug}
                style={{ paddingLeft: `${(e.depth - 1) * 0.75 + 0.75}rem`, marginLeft: '-1px' }}
              >
                <a
                  href={`#${e.slug}`}
                  className="block border-l py-1 text-[13px] leading-snug transition-colors hover:border-current"
                  style={{
                    color: isActive ? '#0366d6' : '#6a737d',
                    borderColor: isActive ? '#0366d6' : 'transparent',
                  }}
                >
                  {e.text}
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
