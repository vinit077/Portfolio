# Portfolio v2 — Implementation Plan (Next.js + Tailwind)

## Stack

| Layer | Choice | Free tier |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | ✅ |
| **Styling** | Tailwind CSS v4 | ✅ |
| **Hosting** | Vercel (free hobby plan) | ✅ |
| **DB + Auth** | Supabase (free tier — 500 MB Postgres, 50K MAU) | ✅ |
| **Backend logic** | Supabase Edge Functions (Deno) | ✅ 500K inv/mo |
| **Scheduling** | Supabase pg_cron + pg_net | ✅ built-in free |
| **GitHub data** | GitHub REST API + free PAT | ✅ |
| **Codeforces** | `codeforces.com/api` (public) | ✅ |
| **LeetCode** | Unofficial GraphQL, Edge Function only | ✅ cached |

> [!IMPORTANT]
> **LeetCode**: No official public API. Unofficial GraphQL is called server-side only (CORS blocks browsers). Data is always served from cache — the widget never blocks page load or goes blank.

> [!NOTE]
> **Supabase free tier**: Projects may pause after ~1 week of zero activity. The pg_cron sync job (every 12h) acts as a keepalive, preventing pausing in practice.

---

## Project Structure

```
portfolio-v2/
├── app/
│   ├── page.tsx                  # Public portfolio (all sections)
│   ├── admin/
│   │   ├── page.tsx              # Login redirect gate
│   │   ├── layout.tsx            # Auth wrapper
│   │   └── dashboard/
│   │       └── page.tsx          # Admin dashboard (tabs)
│   ├── api/
│   │   ├── projects/
│   │   │   └── route.ts          # GET /api/projects (public)
│   │   └── coding-profile/
│   │       └── route.ts          # GET /api/coding-profile (public)
│   └── globals.css               # Tailwind + custom CSS vars from v1
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── sections/
│   │   ├── Hero.tsx              # Typing animation console
│   │   ├── About.tsx
│   │   ├── Stack.tsx             # Icon chip groups
│   │   ├── Experience.tsx
│   │   ├── Projects.tsx          # Dynamic — fetches from DB
│   │   ├── CodingProfile.tsx     # Dynamic — LeetCode + Codeforces cards
│   │   ├── Credentials.tsx
│   │   └── Contact.tsx
│   ├── ui/
│   │   ├── MethodBadge.tsx       # GET / POST badge
│   │   ├── ProjCard.tsx          # Reused in public + admin preview
│   │   ├── CodingCard.tsx        # LeetCode / Codeforces card
│   │   ├── Chip.tsx              # Stack + tag chips
│   │   └── Console.tsx           # Hero JSON console
│   └── admin/
│       ├── ImportPanel.tsx       # URL → Fetch → Preview → Publish
│       ├── ProjectsList.tsx      # Reorder, publish toggle, resync, delete
│       └── CodingStatsPanel.tsx  # Last synced, Sync Now button
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server-side client (RSC / API routes)
│   │   └── middleware.ts         # Session refresh middleware
│   └── utils.ts                  # slugify, humanize repo name, etc.
├── supabase/
│   ├── migrations/
│   │   └── 001_initial.sql       # Full schema + RLS + pg_cron schedule
│   └── functions/
│       ├── import-project/
│       │   └── index.ts          # GitHub URL → preview payload
│       ├── save-project/
│       │   └── index.ts          # Save/publish project to DB
│       ├── sync-coding-stats/
│       │   └── index.ts          # LeetCode + Codeforces → cache
│       └── resync-project/
│           └── index.ts          # Re-pull GitHub metadata for one project
├── middleware.ts                  # Auth protection for /admin routes
├── next.config.ts
├── tailwind.config.ts
└── README.md                     # Setup guide
```

---

## Proposed Changes

### Design System

#### [NEW] `app/globals.css`
- Imports Tailwind v4
- Re-declares all v1 CSS custom properties (`--ink`, `--panel`, `--amber`, `--teal`, etc.) so every component uses the exact same palette
- Global base styles (scrollbar, selection color, body background, grid overlay)

#### [NEW] `tailwind.config.ts`
- Maps v1 palette into Tailwind tokens: `colors.ink`, `colors.panel`, `colors.amber`, `colors.teal`
- Custom fonts: `Space Grotesk` (display), `JetBrains Mono` (mono), `Inter` (body)

---

### Public Pages

#### [NEW] `app/page.tsx`
Server component — renders all sections in order. Projects and CodingProfile sections are async and fetch from Supabase directly on the server (no client waterfall).

#### [NEW] `components/sections/Projects.tsx`
- Server component — calls Supabase to get `published=true` projects ordered by `sort_order`
- Renders into `ProjCard` components
- If DB has 0 projects, renders a subtle "no projects yet" state (owner only sees this before first import)

#### [NEW] `components/sections/CodingProfile.tsx`
`GET /coding-profile` section:
- Server component — reads `coding_stats_cache` from Supabase
- Renders two `CodingCard` components side by side (stacks vertically below 760px)
- "synced Xh ago" status line reusing the hero's `200 OK · 38ms` typographic treatment
- If cache is empty → renders graceful placeholder cards with dashed borders

#### [NEW] `components/ui/CodingCard.tsx`
- **LeetCode card**: username, total solved, easy/medium/hard progress bars (teal/amber/rose), acceptance rate, "View profile ↗" link
- **Codeforces card**: username, rating, rank title, max rating, contests, "View profile ↗" link
- Difficulty bars use the same fill-dot treatment from the product doc wireframe

---

### API Routes (Next.js — serverless, Vercel free)

#### [NEW] `app/api/projects/route.ts`
`GET /api/projects` — public, reads `published=true` from Supabase using the server client (anon key, RLS restricts to published rows).

#### [NEW] `app/api/coding-profile/route.ts`
`GET /api/coding-profile` — public, reads `coding_stats_cache` from Supabase.

---

### Admin Panel

#### [NEW] `middleware.ts`
Protects `/admin/**` routes — checks Supabase session cookie; redirects unauthenticated users to `/admin` login screen.

#### [NEW] `app/admin/page.tsx`
Login screen — email + password form using `@supabase/ssr` client. Same dark design, styled as a `POST /auth/login` console panel. On success → redirects to `/admin/dashboard`.

#### [NEW] `app/admin/dashboard/page.tsx`
Three-tab dashboard — styled as a console window:
- **Tab 1 — Import**: `components/admin/ImportPanel.tsx`
- **Tab 2 — Projects**: `components/admin/ProjectsList.tsx`  
- **Tab 3 — Coding Stats**: `components/admin/CodingStatsPanel.tsx`

#### [NEW] `components/admin/ImportPanel.tsx`
`POST /admin/projects/import` panel:
1. URL input + Fetch button → calls Supabase Edge Function `import-project`
2. Preview pane (editable): title, description, tags (chip input), stars, last pushed
3. Live `ProjCard` preview updates as owner edits
4. Discard / Publish buttons → on Publish, calls `save-project` Edge Function

#### [NEW] `components/admin/ProjectsList.tsx`
- Lists all projects (including unpublished)
- Toggle publish/unpublish
- Re-sync (calls `resync-project` Edge Function)
- Soft delete (sets `published=false`, marks `deleted=true`)
- Drag-to-reorder (updates `sort_order` in DB) using `@dnd-kit/core` (free, MIT)

#### [NEW] `components/admin/CodingStatsPanel.tsx`
- Shows current cached LeetCode + Codeforces stats
- "Last synced: X hours ago" 
- "Sync Now" button → calls `sync-coding-stats` Edge Function directly

---

### Supabase Edge Functions

#### [NEW] `supabase/functions/import-project/index.ts`
- Auth-gated (validates Supabase JWT)
- Validates repo URL format
- Fetches `api.github.com/repos/{owner}/{repo}` with `GITHUB_PAT` env var
- Falls back to README first paragraph if description is empty
- Returns preview JSON — **does not write to DB**

#### [NEW] `supabase/functions/save-project/index.ts`
- Auth-gated
- Upserts into `projects` table
- Auto-generates slug (kebab-case, uniqueness check)
- Writes `sync_log`

#### [NEW] `supabase/functions/sync-coding-stats/index.ts`
- Called by pg_cron every 12h **and** by admin "Sync Now"
- Codeforces: `codeforces.com/api/user.info` + `user.rating`
- LeetCode: POST to `leetcode.com/graphql` (unofficial) with `userProfile` + `userSolvedProblems` queries
- Each source wrapped in independent try/catch — partial success is fine
- Upserts `coding_stats_cache` per platform, writes `sync_log`

#### [NEW] `supabase/functions/resync-project/index.ts`
- Auth-gated
- Re-fetches GitHub metadata for a single project, updates `stars`, `description`, `tags`, `last_synced_at`

---

### Schema + Migrations

#### [NEW] `supabase/migrations/001_initial.sql`
Full schema from PRD §4 + RLS policies + pg_cron schedule:
```sql
-- Runs every 12 hours — keeps Supabase project active (anti-pause keepalive)
select cron.schedule(
  'sync-coding-stats',
  '0 */12 * * *',
  $$ select net.http_post(
       url    := current_setting('app.function_url') || '/sync-coding-stats',
       headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.service_role_key'))
     ) $$
);
```

---

### Setup Guide

#### [NEW] `README.md`
Step-by-step for zero-to-live:
1. Create Supabase project (free) → copy URL + anon key + service role key
2. `supabase db push` to run migrations
3. `supabase functions deploy` for all 4 functions
4. Set env vars in Supabase dashboard and Vercel
5. `vercel deploy` → live URL
6. Open `/admin` → log in → import existing 2 projects → trigger first coding stats sync

---

## Verification Plan

### Build check
```bash
npm run build   # must pass with zero errors
```

### Manual smoke tests
1. Public site loads — Projects section renders 2 migrated cards from DB
2. Coding Profile section renders (after first sync) with real stats
3. `/admin` → login gate enforced (unauthenticated = redirect)
4. Admin: paste `https://github.com/vinit077/Enterprise-Employee-Management-Leave-Portal` → preview appears → Publish → card appears on public page
5. Admin: Sync Now → coding stats update, timestamp refreshes
6. Simulate LeetCode failure → Codeforces card still updates, LeetCode card shows last-known data

---

## Open Questions (no blocker — can default)

| Question | Default if not answered |
|---|---|
| LeetCode handle | `vinitmahale77` (same as Codeforces, per product doc) |
| GitHub PAT | README will include instructions to create one (takes 2 min, free) |
| Vercel account | README will cover signup; if not preferred, Netlify is identical |
| `vinit.dev` domain | Not included — custom domain setup is optional, free to point to Vercel |
