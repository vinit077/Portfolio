# vinit.dev/v2 — Portfolio

Personal developer portfolio — Next.js 15 + Supabase + Vercel. 100% free tier.

## Stack

| Layer | Service | Cost |
|---|---|---|
| Framework | Next.js 15 (App Router) | Free |
| Styling | Tailwind CSS v4 | Free |
| Hosting | Vercel (hobby plan) | Free |
| Database + Auth | Supabase (free tier) | Free |
| Backend logic | Supabase Edge Functions | Free (500K/mo) |
| Scheduling | Supabase pg_cron | Free (built-in) |
| GitHub data | GitHub REST API + PAT | Free |
| Codeforces | Public API | Free |
| LeetCode | Unofficial GraphQL (server-side only) | Free |

---

## Setup (zero to live in ~30 min)

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project** → pick a name → free tier
2. Once created, go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon / public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` *(keep this secret)*

### 2. Create your owner account

1. Supabase Dashboard → **Authentication → Users → Invite user**
2. Use your email (`vinitmahale77@gmail.com`)
3. Accept the invite → set a password
4. Copy your **User UID** (shown in the Users table)
5. Open `supabase/migrations/001_initial.sql` and replace all three instances of `<YOUR-AUTH-UID>` with your UID

### 3. Run the schema

Option A — Supabase Dashboard SQL Editor:
- Open `supabase/migrations/001_initial.sql`
- Paste into SQL Editor → Run

Option B — Supabase CLI:
```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

### 4. Create a GitHub Personal Access Token (free)

1. [github.com/settings/tokens](https://github.com/settings/tokens) → **Generate new token (classic)**
2. Scopes: **`public_repo`** only (read access to public repos)
3. Copy the token → `GITHUB_PAT`

### 5. Deploy Edge Functions

Install Supabase CLI if you haven't:
```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

Set Edge Function secrets (these stay server-side, never exposed to browser):
```bash
supabase secrets set GITHUB_PAT=your_token
supabase secrets set LEETCODE_HANDLE=vinitmahale77
supabase secrets set CF_HANDLE=vinitmahale77
```

Deploy all 4 functions:
```bash
supabase functions deploy import-project
supabase functions deploy save-project
supabase functions deploy sync-coding-stats
supabase functions deploy resync-project
```

### 6. Enable pg_cron schedule (12h auto-sync)

After deploying the `sync-coding-stats` function:

1. Go to Supabase Dashboard → **SQL Editor**
2. Run the cron schedule (in `001_initial.sql`, the commented block at the bottom):

```sql
select cron.schedule(
  'sync-coding-stats',
  '0 */12 * * *',
  $$
    select net.http_post(
      url     := 'https://YOUR_PROJECT_REF.functions.supabase.co/sync-coding-stats',
      headers := jsonb_build_object(
                   'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY',
                   'Content-Type', 'application/json'
                 ),
      body    := '{}'::jsonb
    );
  $$
);
```

Replace `YOUR_PROJECT_REF` and `YOUR_SERVICE_ROLE_KEY` with real values.

### 7. Set up Next.js env + deploy to Vercel

Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Deploy to Vercel (free):
```bash
npm install -g vercel
vercel
```

In Vercel dashboard → **Project → Settings → Environment Variables**, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Then redeploy: `vercel --prod`

### 8. Trigger first coding stats sync

1. Open `https://your-vercel-url.vercel.app/admin`
2. Log in with your Supabase credentials
3. Go to **Coding Stats** tab → click **Sync Now**
4. LeetCode + Codeforces stats will appear on the public site

---

## Admin panel

Visit `/admin` (not linked publicly). Features:
- **Import tab**: paste a GitHub URL → preview the generated card → edit title/description/tags → publish
- **Projects tab**: reorder (↑↓), publish/unpublish toggle, re-sync from GitHub, delete
- **Coding Stats tab**: view current cache, Sync Now button

---

## Development

```bash
npm install
cp .env.example .env.local   # fill in Supabase keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Free tier limits (plenty of headroom for a portfolio)

| Resource | Limit | Expected usage |
|---|---|---|
| Supabase DB | 500 MB | ~1 MB |
| Supabase Auth MAU | 50,000 | 1 (owner) |
| Edge Function invocations | 500,000/mo | <100/mo |
| Vercel bandwidth | 100 GB/mo | <1 GB/mo |
| GitHub API requests | 5,000/hr (with PAT) | <50/day |
