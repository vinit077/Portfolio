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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, 401);

  const anonClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: { user }, error: userErr } = await anonClient.auth.getUser();
  if (userErr || !user) return json({ error: "Unauthorized" }, 401);

  let projectId: string;
  try {
    const body = await req.json();
    projectId = body.projectId;
    if (!projectId) throw new Error("Missing projectId");
  } catch {
    return json({ error: "Invalid request body — expected { projectId }" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: project } = await supabase
    .from("projects")
    .select("repo_owner, repo_name")
    .eq("id", projectId)
    .single();

  if (!project) return json({ error: "Project not found" }, 404);

  const { repo_owner, repo_name } = project;
  const GITHUB_PAT = Deno.env.get("GITHUB_PAT");
  const headers: Record<string, string> = {
    "User-Agent": "vinit-portfolio-v2",
    Accept: "application/vnd.github+json",
  };
  if (GITHUB_PAT) headers["Authorization"] = `token ${GITHUB_PAT}`;

  const ghRes = await fetch(
    `https://api.github.com/repos/${repo_owner}/${repo_name}`,
    { headers }
  );
  if (!ghRes.ok) return json({ error: `GitHub API error: ${ghRes.status}` }, 502);

  const ghData = await ghRes.json();

  // Fetch topics
  const topicsRes = await fetch(
    `https://api.github.com/repos/${repo_owner}/${repo_name}/topics`,
    { headers: { ...headers, Accept: "application/vnd.github.mercy-preview+json" } }
  );
  const topicsData = topicsRes.ok ? await topicsRes.json() : { names: [] };

  const tags: string[] = [];
  if (ghData.language) tags.push(ghData.language);
  tags.push(...(topicsData.names ?? []).slice(0, 5));

  const { error } = await supabase
    .from("projects")
    .update({
      stars: ghData.stargazers_count ?? 0,
      description: ghData.description || undefined,
      tags: tags.length > 0 ? tags : undefined,
      primary_lang: ghData.language ?? null,
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) return json({ error: error.message }, 500);

  await supabase.from("sync_log").insert({
    source: "github-import",
    target_id: projectId,
    success: true,
    message: `Re-synced ${repo_owner}/${repo_name}`,
  });

  return json({ success: true });
});
