import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { projectId } = await req.json();
    if (!projectId) return NextResponse.json({ error: "projectId is required" }, { status: 400 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: project, error: fetchErr } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (fetchErr || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const GITHUB_PAT = process.env.GITHUB_PAT;
    const headers: Record<string, string> = {
      "User-Agent": "vinit-portfolio-v2",
      Accept: "application/vnd.github+json",
    };
    if (GITHUB_PAT && GITHUB_PAT !== "your-github-personal-access-token") {
      headers["Authorization"] = `token ${GITHUB_PAT}`;
    }

    const ghRes = await fetch(
      `https://api.github.com/repos/${project.repo_owner}/${project.repo_name}`,
      { headers }
    );
    if (!ghRes.ok) {
      return NextResponse.json({ error: `GitHub API error: ${ghRes.status}` }, { status: 502 });
    }

    const ghData = await ghRes.json();
    const demo_url = ghData.homepage && ghData.homepage.trim().length > 0 ? ghData.homepage.trim() : project.demo_url;

    const { data: updated, error: updateErr } = await supabase
      .from("projects")
      .update({
        stars: ghData.stargazers_count ?? project.stars,
        primary_lang: ghData.language ?? project.primary_lang,
        demo_url,
        last_synced_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, project: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Resync failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
