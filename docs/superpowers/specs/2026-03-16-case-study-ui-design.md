# Case Study UI Rework — Design Spec

**Date:** 2026-03-16
**Status:** Approved

---

## Overview

Rework the portfolio's case study section for better readability and navigation. The current implementation uses a modal overlay for content. This design replaces it with dedicated case study pages and improved cards.

---

## Decisions

| Topic | Decision |
|---|---|
| Content display | Dedicated page (`/[locale]/case/[id]`) replacing modal |
| Card info | Image, title, date, excerpt (~120 chars derived from `body` at render time) |
| Detail layout | Split: sticky sidebar (30%) + scrollable content (70%) |
| Color palette | Warm beige/brown (`#e7e4d6`, `#ece9dc`, `#8e705b`) |
| Other cases | Horizontal row at bottom, data server-fetched and passed as prop |
| Rendering strategy | Dynamic — existing Sanity client already has `cache: 'no-store'` globally; no `export const dynamic` directive needed on the page |
| Loading/error boundaries | Out of scope |

---

## 1. Card Rework (`article.tsx`)

**Goal:** Make cards informative at a glance and navigate to dedicated pages.

### Props

All existing props are kept including `body: any[]`. `ArticleItem` type in `types/index.ts` is **unchanged**.

### Imports to remove

Remove these unused imports after the modal is deleted:
- `useState` from `react`
- `AnimatePresence` from `framer-motion`
- `IoMdClose` from `react-icons/io`
- `PortableText` from `@portabletext/react`

### Changes

- Remove `w-3/4` width constraint — card fills full grid cell
- Remove all modal/overlay code and its JSX
- Keep `'use client'` directive
- Locale is read via `useParams()` — destructure `params.locale` (matching the `[locale]` route segment):
  ```ts
  import { useParams } from 'next/navigation';
  const params = useParams();
  const locale = params.locale as string;
  ```
- Wrap card in `<Link href={`/${locale}/case/${id}`}>`
- Add **date** label above title: `text-xs text-[#8e705b]`
- Add **excerpt** below title: `line-clamp-2` muted text
- Image: replace `width={600} height={400}` with a `fill`-mode wrapper (see below)
- Keep warm beige card background (`#e7e4d6`), rounded corners, hover shadow
- Change `layoutId` from `props.title` to `props.id` — safe because the modal that previously shared the same `layoutId` is being removed

### Image rendering on cards

```tsx
<div className="relative aspect-video w-full rounded-md overflow-hidden mb-4">
  <Image src={props.image} alt={props.title} fill className="object-cover" />
</div>
```

### Excerpt extraction

```ts
function getExcerpt(body: any[]): string {
  const firstBlock = body?.find(b => b._type === 'block');
  const text = firstBlock?.children?.map((c: any) => c.text).join('') ?? '';
  return text.slice(0, 120);
}
```

---

## 2. Detail Page

### Route

`app/[locale]/case/[id]/page.tsx`

Note: `app/[locale]/cases-study/` contains only old markdown files — not a Next.js route, no conflict.

### Component split (server + client)

**`page.tsx`** — server component:
- Fetches `getArticleById(id)` and `getArticles()`
- Calls `notFound()` from `next/navigation` if article is null
- Filters `getArticles()` to exclude current `id` → `otherArticles`
- Passes `article` and `otherArticles` as props to `CaseDetailClient`

**`app/[locale]/case/[id]/CaseDetailClient.tsx`** — client component (`'use client'`):
- Receives `article: ArticleItem` and `otherArticles: ArticleItem[]` as props
- Renders the full split layout with Framer Motion
- Reads locale via `useParams()` (`params.locale`) for the Back link

### Layout

```
┌─────────────────────────────────────────────────────┐
│  [Header]                                           │
├──────────────┬──────────────────────────────────────┤
│  SIDEBAR     │  CONTENT                             │
│  sticky      │  scrollable                          │
│  ~30% width  │  ~70% width                          │
│  hidden on   │                                      │
│  mobile      │  [Hero image, aspect-video]          │
│              │                                      │
│  ← Back      │  PortableText body                   │
│  Title       │  (prose prose-stone max-w-none)      │
│  Date        │                                      │
├──────────────┴──────────────────────────────────────┤
│  OTHER CASE STUDIES                                 │
│  [divider]                                          │
│  Horizontal row of Article cards                    │
└─────────────────────────────────────────────────────┘
```

### Sidebar (desktop only)

- `sticky top-24 hidden lg:flex flex-col gap-4`
- "← Back" link → `/${locale}/#case` — this is a full-path hash link; Next.js `<Link>` will navigate to the home page and the browser will scroll to `#case` after load. This behavior is acceptable for a portfolio site.
- Title in large warm text
- Date in `text-sm text-[#8e705b]`

### Content column

- Hero image: `relative aspect-video w-full rounded-md overflow-hidden mb-8` + `Image fill object-cover`
- Body: `<PortableText>` with `prose prose-stone max-w-none`

### Mobile layout

On mobile (`lg:` breakpoint and below):
- Sidebar is hidden entirely (`hidden lg:flex`)
- Above the hero image, render a mobile-only block (`lg:hidden`):
  1. "← Back" link
  2. Title
  3. Date

### Page animation

Simple entry on `CaseDetailClient` — no cross-route `layoutId`:

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
```

### Background

`bg-[#ece9dc]` on the page wrapper.

---

## 3. Other Case Studies Section

**Goal:** Keep users engaged after reading.

**Data:** `otherArticles: ArticleItem[]` is fetched in `page.tsx` (server) and passed as a prop to `CaseDetailClient`. No client-side fetching.

**Card sizing:** The `min-w`/`max-w` constraints are applied to the **wrapper `div`** in `CaseDetailClient` around each `<Article>` — not inside `article.tsx` itself. This preserves `Article`'s default sizing behavior for the home page grid.

```tsx
{otherArticles.map(article => (
  <div key={article.id} className="min-w-[280px] max-w-[320px] snap-start flex-shrink-0">
    <Article {...article} />
  </div>
))}
```

**Layout:**
- Divider: `<div className="h-[2px] bg-[#8e705b] w-32 mb-6" />`
- Label: `<p className="text-xs uppercase tracking-widest text-[#8e705b] mb-4">Other Case Studies</p>`
- Container desktop: `flex flex-row gap-6`
- Container mobile: `flex overflow-x-auto snap-x snap-mandatory`

---

## 4. `getArticleById` update (`lib/cases.ts`)

Only `getArticleById` needs a null guard. `getArticles()` is **unchanged**.

Add `if (!item) return null;` immediately after the fetch, before any destructuring:

```ts
export const getArticleById = async (id: string): Promise<ArticleItem | null> => {
  const query = `*[_type == "caseStudy" && slug.current == $id][0] { ... }`;
  const item = await client.fetch(query, { id });
  if (!item) return null;
  return {
    id: item.id,
    title: item.title,
    image: item.image ? urlFor(item.image) : '',
    date: item.date ? moment(item.date, 'YYYY-MM-DD').format('MMMM Do, YYYY') : '',
    body: item.body ?? [],
  };
};
```

---

## 5. Files to Create / Modify

| File | Action | Notes |
|---|---|---|
| `app/[locale]/components/article.tsx` | Modify | Remove modal + unused imports, add excerpt/date/Link, fix image, fix layoutId |
| `app/[locale]/case/[id]/page.tsx` | Create | Server component — data fetching, notFound, prop passing |
| `app/[locale]/case/[id]/CaseDetailClient.tsx` | Create | Client component — split layout, animation, other cases section |
| `app/[locale]/lib/cases.ts` | Modify | Null guard on `getArticleById` only; `getArticles()` unchanged |
| `app/[locale]/types/index.ts` | No change | `ArticleItem` type unchanged |
| `app/[locale]/case/[id]/loading.tsx` | Out of scope | — |
| `app/[locale]/case/[id]/error.tsx` | Out of scope | — |

---

## 6. Out of Scope

- No new Sanity schema fields
- No i18n changes for case study content
- No changes to other portfolio sections
- No loading or error boundary files for the new route
