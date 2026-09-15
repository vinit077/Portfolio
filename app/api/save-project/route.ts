import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const {
      title, description, tags, stars, repo_url, repo_owner, repo_name,
      primary_lang, demo_url, method_badge = "GET", status_code = 200,
    } = payload as Record<string, any>;

    if (!title || !description || !repo_url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let slug = slugify(title);
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

    const { data: maxRow } = await supabase
      .from("projects")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);
    const sortOrder = maxRow && maxRow.length > 0 ? (maxRow[0].sort_order as number) + 1 : 0;

    const upsertObj: Record<string, any> = {
      slug,
      repo_url,
      repo_owner: repo_owner || "vinit077",
      repo_name: repo_name || slug,
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
    };

    if (demo_url) {
      upsertObj.demo_url = demo_url;
    }

    let { data, error } = await supabase
      .from("projects")
      .upsert(upsertObj)
      .select()
      .single();

    // If demo_url column does not exist in user's DB yet, retry without demo_url
    if (error && error.message.includes("demo_url")) {
      delete upsertObj.demo_url;
      const retry = await supabase
        .from("projects")
        .upsert(upsertObj)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      await supabase.from("sync_log").insert({
        source: "github-import",
        target_id: slug,
        success: false,
        message: error.message,
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("sync_log").insert({
      source: "github-import",
      target_id: data.id,
      success: true,
      message: `Imported ${repo_url}`,
    });

    return NextResponse.json({ success: true, project: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Save failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
