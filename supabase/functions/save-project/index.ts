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

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, 401);

  // Use service role to bypass RLS for writes
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Verify calling user is authenticated
  const anonClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: { user }, error: userErr } = await anonClient.auth.getUser();
  if (userErr || !user) return json({ error: "Unauthorized" }, 401);

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  const {
    title, description, tags, stars, repo_url, repo_owner, repo_name,
    primary_lang, method_badge = "GET", status_code = 200,
  } = payload as Record<string, unknown>;

  if (!title || !description || !repo_url) {
    return json({ error: "Missing required fields: title, description, repo_url" }, 400);
  }

  // Generate unique slug
  let slug = slugify(title as string);
  const { data: existing } = await supabase
    .from("projects")
    .select("slug")
    .like("slug", `${slug}%`);

  if (existing && existing.length > 0) {
    const taken = new Set(existing.map((r: { slug: string }) => r.slug));
    if (taken.has(slug)) {
      let i = 2;
      while (taken.has(`${slug}-${i}`)) i++;
      slug = `${slug}-${i}`;
    }
  }

  // Get max sort_order
  const { data: maxRow } = await supabase
    .from("projects")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  const sortOrder = maxRow && maxRow.length > 0 ? (maxRow[0].sort_order as number) + 1 : 0;

  const { data, error } = await supabase
    .from("projects")
    .upsert({
      slug,
      repo_url,
      repo_owner,
      repo_name,
      title,
      description,
      tags: tags ?? [],
      stars: stars ?? 0,
      primary_lang: primary_lang ?? null,
      method_badge,
      status_code,
      sort_order: sortOrder,
      published: true,
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    await supabase.from("sync_log").insert({
      source: "github-import",
      target_id: slug,
      success: false,
      message: error.message,
    });
    return json({ error: error.message }, 500);
  }

  await supabase.from("sync_log").insert({
    source: "github-import",
    target_id: data.id,
    success: true,
    message: `Imported ${repo_url}`,
  });

  return json({ success: true, project: data });
});
