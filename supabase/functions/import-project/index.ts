import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function humanize(name: string): string {
  return name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function extractExcerpt(raw: string): string {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.length > 20 &&
        !l.startsWith("#") &&
        !l.startsWith("!") &&
        !l.startsWith("|") &&
        !l.startsWith("```") &&
        !l.startsWith("<!--")
    );
  return (lines[0] ?? "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .slice(0, 300);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  // Auth check
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return json({ error: "Unauthorized" }, 401);

  // Parse body
  let repoUrl: string;
  try {
    const body = await req.json();
    repoUrl = body.repoUrl;
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  // Validate URL format
  const match = repoUrl.match(
    /^https:\/\/github\.com\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)\/?$/
  );
  if (!match) {
    return json({ error: "Invalid GitHub URL. Must be https://github.com/{owner}/{repo}" }, 400);
  }

  const [, owner, repo] = match;
  const GITHUB_PAT = Deno.env.get("GITHUB_PAT");
  const headers: Record<string, string> = {
    "User-Agent": "vinit-portfolio-v2",
    Accept: "application/vnd.github+json",
  };
  if (GITHUB_PAT) headers["Authorization"] = `token ${GITHUB_PAT}`;

  // Fetch repo metadata from GitHub
  const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (ghRes.status === 404) return json({ error: "Repository not found or is private." }, 404);
  if (!ghRes.ok) return json({ error: `GitHub API error: ${ghRes.status}` }, 502);

  const ghData = await ghRes.json();

  // Topics
  const topicsRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/topics`,
    { headers: { ...headers, Accept: "application/vnd.github.mercy-preview+json" } }
  );
  const topicsData = topicsRes.ok ? await topicsRes.json() : { names: [] };

  // Build tags
  const tags: string[] = [];
  if (ghData.language) tags.push(ghData.language);
  tags.push(...(topicsData.names ?? []).slice(0, 5));

  // Get description — fall back to README if empty
  let description: string = ghData.description ?? "";
  if (!description) {
    const readmeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      { headers }
    );
    if (readmeRes.ok) {
      const readmeData = await readmeRes.json();
      const raw = atob(readmeData.content.replace(/\n/g, ""));
      description = extractExcerpt(raw);
    }
  }
  if (!description) description = `A project by ${owner}.`;

  const title = humanize(ghData.name);
  const slug = slugify(title);

  return json({
    title,
    description,
    tags,
    stars: ghData.stargazers_count ?? 0,
    slug,
    repo_url: ghData.html_url,
    repo_owner: owner,
    repo_name: repo,
    primary_lang: ghData.language ?? null,
    last_synced_at: new Date().toISOString(),
  });
});
