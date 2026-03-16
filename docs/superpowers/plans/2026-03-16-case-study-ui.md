# Case Study UI Rework Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the modal-based case study view with dedicated pages and improved cards that show image, title, date, and excerpt.

**Architecture:** `article.tsx` is simplified to a card-only component with a Link. A new `app/[locale]/case/[id]/` route handles detail pages via a server component (`page.tsx`) that fetches data and a client component (`CaseDetailClient.tsx`) that renders the split layout and animations. A `TranslationProvider` wrapper is required on the new page so `Header`'s `useTranslation()` works.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, Sanity (`@portabletext/react`), `next/image`, `next/navigation`, `react-i18next`

---

## Chunk 1: Prep — null guard and card rework

### Task 1: Add null guard to `getArticleById`

**Files:**
- Modify: `app/[locale]/lib/cases.ts`

- [ ] **Step 1: Open `app/[locale]/lib/cases.ts` and locate `getArticleById`**

  The function currently fetches from Sanity and immediately destructures the result without checking for null. When no document matches the slug, `item` is `null` and the function crashes.

- [ ] **Step 2: Update `getArticleById` with null guard**

  Replace the function body with:

  ```ts
  export const getArticleById = async (id: string): Promise<ArticleItem | null> => {
    const query = `*[_type == "caseStudy" && slug.current == $id][0] {
      "id": slug.current,
      title,
      date,
      body,
      image
    }`;
    const item = await client.fetch(query, { id });
    if (!item) return null;
    return {
      id: item.id,
      title: item.title,
      image: item.image ? urlFor(item.image) : '',
      date: item.date
        ? moment(item.date, 'YYYY-MM-DD').format('MMMM Do, YYYY')
        : '',
      body: item.body ?? [],
    };
  };
  ```

- [ ] **Step 3: Verify TypeScript compiles**

  ```bash
  cd /Users/nlnguyen/Documents/code/CMS/portfolio && npx tsc --noEmit
  ```

  Expected: no new errors.

- [ ] **Step 4: Commit**

  ```bash
  git add app/\[locale\]/lib/cases.ts
  git commit -m "fix: add null guard to getArticleById"
  ```

---

### Task 2: Rework `article.tsx` into a card-only component

**Files:**
- Modify: `app/[locale]/components/article.tsx`

- [ ] **Step 1: Write the new `article.tsx`**

  Replace the entire file content with:

  ```tsx
  'use client';
  import React from 'react';
  import { motion } from 'framer-motion';
  import Image from 'next/image';
  import Link from 'next/link';
  import { useParams } from 'next/navigation';

  function getExcerpt(body: any[]): string {
    const firstBlock = body?.find((b) => b._type === 'block');
    const text =
      firstBlock?.children?.map((c: any) => c.text).join('') ?? '';
    return text.slice(0, 120);
  }

  export default function Article(props: {
    id: string;
    image: string;
    body: any[];
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
  ```

- [ ] **Step 2: Verify TypeScript compiles**

  ```bash
  cd /Users/nlnguyen/Documents/code/CMS/portfolio && npx tsc --noEmit
  ```

  Expected: no new errors.

- [ ] **Step 3: Commit**

  ```bash
  git add app/\[locale\]/components/article.tsx
  git commit -m "feat: rework article card with excerpt, date, and link navigation"
  ```

---

## Chunk 2: Detail page

### Task 3: Create the detail page server component

**Files:**
- Create: `app/[locale]/case/[id]/page.tsx`

**i18n note:** The `Header` component uses `useTranslation()` from `react-i18next`, which requires an `I18nextProvider` in the tree. The home page sets this up via `TranslationProvider`. The new detail page must do the same: call `initTranslations` server-side and wrap children with `TranslationProvider`.

- [ ] **Step 1: Create the directory**

  ```bash
  mkdir -p "/Users/nlnguyen/Documents/code/CMS/portfolio/app/[locale]/case/[id]"
  ```

- [ ] **Step 2: Create `page.tsx`**

  Relative paths: `../../` from `app/[locale]/case/[id]/` resolves to `app/[locale]/` — correct for `lib/`, `ui/`, `types/`, and `components/`.

  ```tsx
  import { notFound } from 'next/navigation';
  import { getArticleById } from '../../lib/cases';
  import getArticles from '../../lib/cases';
  import CaseDetailClient from './CaseDetailClient';
  import Header from '../../ui/header';
  import initTranslations from '@/app/i18n';
  import TranslationProvider from '../../components/TranslationProvider';

  interface PageProps {
    params: { locale: string; id: string };
  }

  export default async function CaseDetailPage({ params }: PageProps) {
    const { resources } = await initTranslations(params.locale, ['common']);

    const article = await getArticleById(params.id);
    if (!article) notFound();

    const allArticles = await getArticles();
    const otherArticles = allArticles.filter((a) => a.id !== params.id);

    return (
      <TranslationProvider
        resources={resources}
        locale={params.locale}
        namespaces={['common']}
      >
        <Header />
        <CaseDetailClient article={article} otherArticles={otherArticles} />
      </TranslationProvider>
    );
  }
  ```

- [ ] **Step 3: Verify TypeScript compiles**

  ```bash
  cd /Users/nlnguyen/Documents/code/CMS/portfolio && npx tsc --noEmit
  ```

  Expected: error that `CaseDetailClient` does not exist yet — acceptable at this stage.

- [ ] **Step 4: Commit**

  ```bash
  git add "app/[locale]/case/[id]/page.tsx"
  git commit -m "feat: add case study detail page server component"
  ```

---

### Task 4: Create `CaseDetailClient`

**Files:**
- Create: `app/[locale]/case/[id]/CaseDetailClient.tsx`

- [ ] **Step 1: Create `CaseDetailClient.tsx`**

  ```tsx
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
  ```

- [ ] **Step 2: Verify TypeScript compiles**

  ```bash
  cd /Users/nlnguyen/Documents/code/CMS/portfolio && npx tsc --noEmit
  ```

  Expected: no new errors.

- [ ] **Step 3: Start dev server and manually verify the detail page**

  ```bash
  cd /Users/nlnguyen/Documents/code/CMS/portfolio && npm run dev
  ```

  Open `http://localhost:3000/en/case/<any-valid-slug>` and check:
  - Header renders with navigation links (not empty strings — confirms i18n is working)
  - Page renders with warm beige background (`#ece9dc`)
  - Sidebar visible on desktop with title, date, back link
  - Hero image renders correctly
  - Body content renders
  - "Other Case Studies" section appears below with cards

- [ ] **Step 4: Commit**

  ```bash
  git add "app/[locale]/case/[id]/CaseDetailClient.tsx"
  git commit -m "feat: add CaseDetailClient with split layout and other cases section"
  ```

---

## Chunk 3: Integration and smoke test

### Task 5: Smoke test the full flow

- [ ] **Step 1: Verify card grid on home page**

  Open `http://localhost:3000/en` and scroll to the case study section. Check:
  - Cards are full-width in their grid cells (no `w-3/4` centering)
  - Each card shows image (aspect-video ratio), date, title, excerpt (2 lines max)
  - Hovering shows shadow

- [ ] **Step 2: Verify navigation**

  Click a card. Check:
  - URL changes to `/en/case/<slug>`
  - Detail page renders correctly with header, sidebar, content, and other cases

- [ ] **Step 3: Verify 404 for unknown slug**

  Open `http://localhost:3000/en/case/nonexistent-slug`. Check:
  - Next.js 404 page is shown (not a crash)

- [ ] **Step 4: Verify mobile layout**

  Resize browser to mobile width (< 1024px). Check:
  - Sidebar hidden
  - Back link, title, date appear above hero image
  - "Other Case Studies" scrolls horizontally with snap

- [ ] **Step 5: Final commit**

  ```bash
  git add -A
  git commit -m "feat: complete case study UI rework with dedicated pages"
  ```
