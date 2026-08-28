# Portfolio v2 — Product Documentation
**Product:** vinit.dev — personal developer portfolio
**Owner:** Vinit A. Mahale
**Doc set:** PRD · TRD · UI Brief · Backend Schema · Implementation Plan
**Status:** Draft v1

---

## 0. Context

v1 is a static, single-file HTML portfolio (API-console visual concept: every section reads as a REST endpoint — `GET /about`, `GET /stack`, `POST /contact`). It ships with hardcoded content sourced from the resume.

v2 turns two sections from hardcoded into **live, self-updating** ones, without losing the static site's speed or the design language:

1. **Add a project by pasting a GitHub link** — no manual re-editing of HTML per new project.
2. **Competitive-programming profile widget** — pulls live LeetCode + Codeforces stats.

Everything else (About, Stack, Experience, Education, Contact) stays static content, hand-edited, per your request to keep phone number private and education trimmed to course + college only.

---

## 1. PRD — Product Requirements

### 1.1 Goals
- Let Vinit publish a new project to the live site in under 60 seconds, with just a repo URL.
- Show real-time competitive programming credibility (LeetCode / Codeforces) without manual updates.
- Keep the public site static-fast and keep all "admin" actions behind auth — visitors never see write access.
- Preserve the existing design language (console/endpoint metaphor); new features must feel native to it, not bolted on.

### 1.2 Non-goals
- No multi-user / multi-tenant system — this is a single-owner portfolio.
- No CMS-style rich text editor — project descriptions are auto-derived from the repo, with light manual override.
- No real-time collaboration, comments, or visitor accounts.
- No support for private repos in v2 (public repos only, to avoid token-scope risk on a public-facing site).

### 1.3 Users
| User | Access | Needs |
|---|---|---|
| Visitor (recruiter, engineer, peer) | Public, read-only | Fast load, accurate/current info, easy contact |
| Vinit (owner) | Authenticated admin | Add/edit/remove projects fast, trust that stats stay fresh |

### 1.4 Feature: Add Project via Git Link
**User story:** As the owner, I paste a GitHub repo URL into an admin panel and the project card appears on the public site, populated automatically.

**Requirements:**
- Accept a GitHub repo URL (`https://github.com/{owner}/{repo}`), validate format client-side before submit.
- On submit, fetch repo metadata (name, description, primary language, topics/tags, stars, last-pushed date, README excerpt) via the GitHub REST API.
- Auto-generate: project title (from repo name, humanized), description (from repo description, or first meaningful README paragraph if description is empty), tag list (from language + topics), and a `GET /projects/{slug}` path matching the site's existing card style.
- Show a **preview** of the generated card before it's published (owner can edit title/description/tags inline before confirming) — auto-fill, not auto-publish blind.
- Support reordering and un-publishing (soft delete) projects from the same panel.
- Re-sync button per project to pull fresh stars/description on demand (not constant polling — public repos change slowly).
- Graceful failure: invalid URL, repo not found, or repo private → clear inline error, nothing published.

**Acceptance criteria:**
- Submitting a valid public repo URL produces a published card matching existing `.proj-card` styling within one request/response cycle.
- No GitHub token or credential is ever exposed to the browser.
- Unauthenticated requests cannot create, edit, or delete projects (enforced server-side, not just hidden UI).

### 1.5 Feature: Competitive Programming Profile Widget
**User story:** As a visitor, I want to see Vinit's LeetCode and Codeforces standing at a glance, so I can gauge problem-solving strength without leaving the site.

**Requirements:**
- New section, styled consistent with the endpoint metaphor: `GET /coding-profile`.
- LeetCode card: total solved (easy/medium/hard breakdown), acceptance rate, current streak or ranking if available.
- Codeforces card: current rating, rank title (e.g. "Pupil", "Specialist"), max rating, contests participated.
- Each card links out to the real profile (`leetcode.com/u/{handle}`, `codeforces.com/profile/{handle}`).
- Data refreshes on a schedule (not on every page load) — target freshness: within 24 hours.
- If a data source is unreachable, show the last-cached value with a subtle "last synced" timestamp rather than breaking the section.

**Acceptance criteria:**
- Widget renders from cached data — page load never blocks on a live LeetCode/Codeforces call.
- Handles are configured once (owner-side), not visitor input.
- Visual style (status badges, mono labels) matches existing hero console treatment.

### 1.6 Content/privacy changes (v1 → v2, already applied to the static markup)
- Phone number removed from the Contact section entirely (email + LinkedIn + GitHub only).
- Education card reduced to course name + college name (CGPA and dates removed).
- Stack section restyled as icon-labeled chips grouped by category (languages, frontend, backend, data, tooling, concepts).

### 1.7 Success metrics
- Time to publish a new project: < 60 seconds, zero HTML edits.
- Coding profile section reflects reality within 24h of a rating/solve-count change.
- Zero unauthorized writes (monitored via auth logs).

---

## 2. TRD — Technical Requirements

### 2.1 Why this needs a backend now
v1's "hardcode and redeploy" model breaks once content changes independent of a code push (new project, refreshed coding stats). v2 introduces a minimal backend: an API layer + a small database + one authenticated admin surface. Everything public stays read-only and cacheable.

### 2.2 Recommended stack
Given Vinit's existing, resume-verified experience (Supabase used at Saral Events; Spring Boot elsewhere), two viable paths — pick one:

**Option A — Supabase (recommended, fastest to ship):**
- **Auth:** Supabase Auth, single owner account (email/password or magic link). No public sign-up.
- **DB:** Supabase Postgres — `projects`, `coding_stats_cache`, `sync_log` tables (see §4).
- **API:** Supabase auto-generated REST/PostgREST for reads (public, RLS-scoped to `published = true`); a small set of **Edge Functions** (Deno) for writes and external calls:
  - `import-project` — takes a GitHub URL, calls GitHub API, upserts into `projects`.
  - `sync-coding-stats` — scheduled (Supabase Cron) job that refreshes LeetCode + Codeforces caches.
- **Hosting:** static frontend (current HTML, or migrated to a lightweight framework) on Vercel/Netlify/GitHub Pages; Supabase handles data + functions.

**Option B — Spring Boot + MySQL (matches primary resume stack):**
- Spring Boot REST API (`/api/projects`, `/api/coding-profile`) with Spring Security (JWT) protecting `POST/PUT/DELETE`.
- MySQL for `projects`, `coding_stats_cache`.
- A `@Scheduled` job (or external cron hitting a protected endpoint) refreshes coding stats.
- Deployed on Railway/Render, DB on the same platform or PlanetScale.

Either is fine architecturally; Option A ships faster for a single-owner static site, Option B better demonstrates the Spring Boot skill set if this project is also meant as a portfolio piece in itself (recommended if the goal is "show Spring Boot in production," since the backend becomes another thing to point to).

### 2.3 External integrations

**GitHub REST API** (`api.github.com/repos/{owner}/{repo}`)
- Public, CORS-enabled, works unauthenticated at 60 req/hr — fine for on-demand imports, but use a personal access token (server-side only, read-only `public_repo` scope) to raise the limit to 5,000 req/hr and avoid rate-limit failures during bursts.
- Fields pulled: `name`, `description`, `language`, `topics`, `stargazers_count`, `pushed_at`, `html_url`. README pulled from `GET /repos/{owner}/{repo}/readme` (base64-decoded) only if `description` is empty.

**Codeforces API** (`codeforces.com/api/user.info?handles={handle}` and `user.rating`)
- Public, no auth required, CORS-enabled — can be called directly, but route it through the backend anyway so caching and the LeetCode call share one code path and one cache table.

**LeetCode**
- No official public API. Use the unofficial GraphQL endpoint (`leetcode.com/graphql`) from the **backend only** (browser calls are blocked by CORS/anti-bot measures) — this is exactly why the sync job must be server-side, not client-side. Cache aggressively (this is also a resilience measure: unofficial endpoints can change without notice, and cached-last-known-good data means the widget never goes blank).

### 2.4 API design (Option A shown; Option B is the same shape under `/api`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/projects` | Public | List published projects, ordered by `sort_order` |
| `POST` | `/admin/projects/import` | Owner only | `{ repoUrl }` → fetch GitHub metadata, return a **preview** (not yet saved) |
| `POST` | `/admin/projects` | Owner only | Save/publish a project (from preview, possibly edited) |
| `PATCH` | `/admin/projects/:id` | Owner only | Edit title/description/tags, reorder, publish/unpublish |
| `DELETE` | `/admin/projects/:id` | Owner only | Soft delete |
| `POST` | `/admin/projects/:id/resync` | Owner only | Re-pull GitHub metadata for one project |
| `GET` | `/coding-profile` | Public | Cached LeetCode + Codeforces stats |
| `POST` | `/admin/coding-profile/sync` | Owner only (or cron) | Force-refresh both sources now |

### 2.5 Caching & freshness
- `coding_stats_cache` always serves reads — the public endpoint never calls LeetCode/Codeforces live.
- Scheduled sync every 12–24h; manual "sync now" button in the admin panel for immediate refresh after a contest.
- `projects` reads are also cacheable at the CDN/edge level (short TTL, e.g. 5 min) since writes are rare and owner-only.

### 2.6 Security
- All write endpoints require a valid session/JWT tied to the single owner account — enforced in the database layer (Row Level Security if Supabase) as well as the API layer, so a leaked frontend route never becomes a write hole.
- GitHub PAT and any LeetCode/Codeforces credentials live only in server-side environment variables, never shipped to the client bundle.
- Rate-limit the import endpoint (e.g. 10 imports/hour) — it's owner-only, but this bounds damage from a leaked session token.
- Input validation on `repoUrl`: must match `github.com/{owner}/{repo}` pattern, reject anything else before it reaches the GitHub API call.

### 2.7 Migration path for the current static HTML
The current single-file site can stay mostly as-is: the Projects and Coding Profile sections switch from hardcoded HTML to a small client-side fetch against the new public `GET /projects` and `GET /coding-profile` endpoints, rendered into the existing `.proj-card` / new `.coding-card` markup with plain JS (no framework required). Everything else (About, Stack, Experience, Contact) stays static — it changes rarely enough that hand-editing remains the simplest path.

---

## 3. UI Brief

### 3.1 Design continuity
Both new pieces must read as endpoints, matching the rest of the site:
- Projects section already uses `GET /projects/{slug}` cards — no visual change needed for the list itself, only its data source.
- New section: `GET /coding-profile`, positioned after Projects and before Credentials.
- New admin surface: framed as a request builder / API playground, consistent with the `POST /contact` panel's field styling, but private (not linked from public nav — reached via a direct `/admin` route, gated by login).

### 3.2 Admin — Add Project panel
```
┌─ POST /admin/projects/import ───────────────────────┐
│  repo url                                            │
│  [ https://github.com/vinit077/...            ] [Fetch] │
│                                                        │
│  ── preview (editable) ──────────────────────────────│
│  title        [ Enterprise Employee Leave Portal ]   │
│  description  [ textarea, pre-filled              ]  │
│  tags         [ Spring Boot ×][ MySQL ×][ + add ]    │
│  stars ★ 4     last pushed: 3 days ago                │
│                                                        │
│              [ Discard ]        [ Publish → ]         │
└────────────────────────────────────────────────────┘
```
- Fetch is a distinct step from Publish — nothing goes live without the owner seeing the generated card first.
- Tag chips reuse the exact chip component from the public Stack section (same icon system where a tag matches a known tech; unmatched tags render as plain text chips).
- Success state: small `201 Created` badge, consistent with the console's status-code language.

### 3.3 Public — Coding Profile section
```
GET /coding-profile                                    200 · synced 6h ago

┌─ leetcode ───────────────┐   ┌─ codeforces ─────────────┐
│  vinitmahale77            │   │  vinitmahale77             │
│                            │   │                             │
│  312 solved                │   │  1,412 rating               │
│  ●●●●●●●●○○ easy  120/145  │   │  Pupil                     │
│  ●●●●●○○○○○ med   150/280  │   │  max 1,412 · 6 contests     │
│  ●●○○○○○○○○ hard   42/210  │   │                             │
│                            │   │                             │
│  [ View profile ↗ ]        │   │  [ View profile ↗ ]         │
└────────────────────────────┘   └─────────────────────────────┘
```
- Two cards side by side (stack vertically under 760px, matching existing project-grid breakpoint).
- Difficulty bars use the same amber/teal accent pair, not a third color — easy=teal, medium=amber, hard=a muted rose reserved only for this, so the palette stays disciplined.
- "synced Xh ago" in the section status line reuses the exact typographic treatment as the hero's `200 OK · 38ms` line — same device, different data.
- Empty/error state: if a source fails, the card shows its last cached numbers with "last synced" instead of a blank or spinner — never show a broken state to a visitor.

### 3.4 Stack section (already implemented in v1 HTML)
Icon chips, grouped by category (languages / frontend / backend / data / tooling / concepts), each chip a small custom-drawn monoline glyph + label, hover state tints to the category accent color. No third-party logo packs — icons are original abstract marks in the site's own stroke style, which keeps the visual language consistent and avoids trademark reproduction.

---

## 4. Backend Schema (optional — Option A / Supabase Postgres shown; trivially portable to MySQL for Option B)

```sql
-- Projects, sourced from GitHub imports, editable after import
create table projects (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,               -- e.g. "employee-leave-portal"
  repo_url      text not null,
  repo_owner    text not null,
  repo_name     text not null,
  title         text not null,
  description   text not null,
  tags          text[] not null default '{}',
  stars         int not null default 0,
  primary_lang  text,
  method_badge  text not null default 'GET',         -- GET/POST for the card's status line
  status_code   int not null default 200,
  sort_order    int not null default 0,
  published     boolean not null default false,
  last_synced_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- One row per external coding platform, always overwritten (not appended) on sync
create table coding_stats_cache (
  platform        text primary key,                  -- 'leetcode' | 'codeforces'
  handle          text not null,
  profile_url     text not null,
  stats           jsonb not null,                    -- shape below
  last_synced_at  timestamptz not null default now(),
  last_error      text                                -- last failure message, if any, for owner visibility
);
-- example stats jsonb for leetcode:
-- { "solved": 312, "easy": [120,145], "medium": [150,280], "hard": [42,210], "acceptance_rate": 61.2 }
-- example stats jsonb for codeforces:
-- { "rating": 1412, "max_rating": 1412, "rank": "pupil", "contests": 6 }

-- Audit trail for sync/import operations, useful for debugging silent failures
create table sync_log (
  id          uuid primary key default gen_random_uuid(),
  source      text not null,                          -- 'github-import' | 'leetcode-sync' | 'codeforces-sync'
  target_id   text,                                    -- project id or platform name
  success     boolean not null,
  message     text,
  created_at  timestamptz not null default now()
);

-- Row Level Security: public reads only see published rows; all writes require the owner's auth uid
alter table projects enable row level security;
create policy "public read published" on projects for select using (published = true);
create policy "owner full access" on projects for all using (auth.uid() = '<owner-uuid>');

alter table coding_stats_cache enable row level security;
create policy "public read" on coding_stats_cache for select using (true);
create policy "owner write" on coding_stats_cache for all using (auth.uid() = '<owner-uuid>');
```

**Notes**
- `slug` drives the `GET /projects/{slug}` path shown on each card — generated from `repo_name`, kebab-cased, checked for uniqueness on import.
- `method_badge`/`status_code` are kept as data (not hardcoded per card) so an owner could mark a project `POST` (e.g. something interactive) or a decommissioned project `410` for a "gone but shown" gag consistent with the API bit — optional flourish, not required.
- `coding_stats_cache` is intentionally a single-row-per-platform table (upsert on sync), not a time series — history isn't a product requirement here; keep it simple.

---

## 5. Implementation Plan

### Phase 0 — Current state (done)
Static single-file HTML site, hardcoded content, deployed as-is. No backend.

### Phase 1 — Backend foundation (½–1 day)
- Stand up Supabase project (or Spring Boot + MySQL if Option B).
- Create schema from §4, enable RLS.
- Set up owner auth (single account, no public sign-up).
- Deploy one protected "hello world" admin route to confirm auth works end to end.

### Phase 2 — Project import via Git link (1–2 days)
- Build `import-project` function: GitHub API call → parse → return preview payload.
- Build admin "Add Project" panel per §3.2 (preview → edit → publish flow).
- Build `GET /projects` public endpoint + wire the existing `.proj-card` rendering to fetch from it instead of static HTML.
- Migrate the two existing resume projects into the DB as the first two rows (so the site doesn't regress on launch).
- Add resync + unpublish/reorder actions.

### Phase 3 — Coding profile widget (1–2 days)
- Build `codeforces-sync` (direct API call, straightforward).
- Build `leetcode-sync` (GraphQL call, backend-only, more fragile — wrap in try/catch, always fall back to cached value).
- Schedule both on a cron (Supabase Scheduled Functions or platform cron) every 12–24h; add manual "sync now" in admin.
- Build the public `GET /coding-profile` endpoint and the UI from §3.3.

### Phase 4 — Polish & hardening (½–1 day)
- Rate-limit admin write endpoints.
- Confirm RLS blocks writes without a valid owner session (test with a raw unauthenticated request).
- Add "last synced" fallback states for both new sections so nothing ever renders blank.
- Lighthouse/perf pass — confirm the public site is still effectively static-fast (cached reads, no client-side waterfall blocking first paint).

### Phase 5 — Launch
- Point DNS/hosting at the updated build.
- Smoke-test: import one real repo live, confirm it appears correctly; confirm coding profile shows real current stats.

**Total estimate:** roughly 4–6 working days for one developer, most of it in Phase 2 and 3.
