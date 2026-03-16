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
| Card info | Image, title, date, excerpt (~120 chars) |
| Detail layout | Split: sticky sidebar (30%) + scrollable content (70%) |
| Color palette | Warm beige/brown family — existing colors retained |
| Other cases | Section at bottom of detail page |

---

## 1. Card Rework (`article.tsx`)

**Goal:** Make cards informative at a glance and navigate to dedicated pages.

**Changes:**
- Remove `w-3/4` width constraint — card fills full grid cell
- Remove all modal/overlay code (`AnimatePresence`, `useState`, `open` state)
- Wrap card in Next.js `<Link href="/<locale>/case/[id]">` instead of `onClick`
- Add **date** as a small muted label above the title (e.g. `text-xs text-[#8e705b]`)
- Add **excerpt**: extract first ~120 characters from the first text block in `body[]`, displayed as 2-line clamp (`line-clamp-2`) in muted color below the title
- Keep warm beige card background (`#e7e4d6`), rounded corners, hover shadow
- Keep `layoutId={props.id}` on the outer `motion.div` for shared element transition

**Excerpt extraction logic:**
```ts
function getExcerpt(body: any[]): string {
  const firstBlock = body?.find(b => b._type === 'block');
  const text = firstBlock?.children?.map((c: any) => c.text).join('') ?? '';
  return text.slice(0, 120);
}
```

**No data changes needed** — `body` is already fetched by `getArticles()`.

---

## 2. Detail Page (`app/[locale]/case/[id]/page.tsx`)

**Goal:** Readable, full-page case study with split layout.

### Route
- Path: `app/[locale]/case/[id]/page.tsx`
- Server component — fetches via `getArticleById(id)` and `getArticles()` (for other cases)

### Layout

```
┌─────────────────────────────────────────────────────┐
│  [Header]                                           │
├──────────────┬──────────────────────────────────────┤
│  SIDEBAR     │  CONTENT                             │
│  sticky      │  scrollable                          │
│  ~30% width  │  ~70% width                          │
│              │                                      │
│  ← Back      │  [Hero image, full column width]     │
│  Title       │                                      │
│  Date        │  PortableText body                   │
├──────────────┴──────────────────────────────────────┤
│  OTHER CASE STUDIES                                 │
│  [divider line]                                     │
│  Horizontal row of cards (excluding current)        │
└─────────────────────────────────────────────────────┘
```

### Sidebar (sticky, desktop only)
- `sticky top-24`, hidden on mobile (`hidden lg:flex`)
- "← Back" link navigates to `/#case`
- Case study title in large warm text
- Date in small muted text (`text-sm text-[#8e705b]`)

### Content column
- Hero image: full width of column, rounded corners, `object-cover`
- Body: `PortableText` with `prose prose-stone max-w-none` for readable typography
- On mobile: sidebar collapses, title and date appear above the hero image

### Page animation
- Outer `motion.div` with `layoutId={id}` — shared element transition from card
- Background: `#ece9dc`

---

## 3. Other Case Studies Section

**Goal:** Keep users engaged after reading a case study.

**Placement:** Full-width section below the main content split, inside the same page.

**Details:**
- Separated by a `#8e705b` horizontal rule (2px, `w-32` — matching the divider in `case_study.tsx`)
- Section label: "Other Case Studies" — small uppercase muted text
- Reuses the existing `Article` card component
- Data: `getArticles()` result filtered to exclude current `id`
- Layout: horizontal flex row on desktop, horizontal scroll snap on mobile (`flex overflow-x-auto snap-x snap-mandatory`)
- Each card: `min-w-[280px] snap-start`

---

## 4. Files to Create / Modify

| File | Action |
|---|---|
| `app/[locale]/components/article.tsx` | Modify — remove modal, add excerpt/date, make full-width, add Link |
| `app/[locale]/case/[id]/page.tsx` | Create — detail page server component |
| `app/[locale]/types/index.ts` | No change needed |
| `app/[locale]/lib/cases.ts` | No change needed |

---

## 5. Out of Scope

- No new Sanity schema fields
- No changes to other portfolio sections
- No i18n changes for case study content
