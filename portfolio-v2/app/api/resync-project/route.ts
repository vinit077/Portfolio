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

    const owner = project.repo_owner;
    const repo = project.repo_name;

    const [ghRes, deploymentsRes, readmeRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/deployments?per_page=5`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers }),
    ]);

    if (!ghRes.ok) {
      return NextResponse.json({ error: `GitHub API error: ${ghRes.status}` }, { status: 502 });
    }

    const ghData = await ghRes.json();
    let detectedDemoUrl: string | null = null;

    // 1. Check repository homepage (e.g. set in GitHub repo settings)
    if (ghData.homepage && ghData.homepage.trim().length > 0) {
      detectedDemoUrl = ghData.homepage.trim();
    }

    // 2. Check GitHub Deployments API (e.g. Vercel, Netlify, GitHub Pages)
    if (!detectedDemoUrl && deploymentsRes.ok) {
      try {
        const deployments = await deploymentsRes.json();
        if (Array.isArray(deployments) && deployments.length > 0) {
          const firstDeployment = deployments[0];
          const statusesRes = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/deployments/${firstDeployment.id}/statuses`,
            { headers }
          );
          if (statusesRes.ok) {
            const statuses = await statusesRes.json();
            const successStatus = statuses.find((s: any) => s.state === "success" && s.environment_url);
            if (successStatus?.environment_url) {
              detectedDemoUrl = successStatus.environment_url;
            }
          }
        }
      } catch {
        // Fallback continues
      }
    }

    // 3. Scan README for live demo links if not found yet
    if (!detectedDemoUrl && readmeRes.ok) {
      try {
        const readmeData = await readmeRes.json();
        const rawReadme = Buffer.from(readmeData.content, "base64").toString("utf-8");
        const linkMatch = rawReadme.match(/\[(?:live\s*demo|demo|live|website|app|preview|site)\]\((https?:\/\/[^\s\)]+)\)/i);
        if (linkMatch) {
          detectedDemoUrl = linkMatch[1];
        } else {
          const hostMatch = rawReadme.match(/https?:\/\/[a-zA-Z0-9-]+\.(?:vercel\.app|netlify\.app|github\.io|render\.com|pages\.dev|railway\.app|herokuapp\.com)[^\s\)]*/i);
          if (hostMatch) {
            detectedDemoUrl = hostMatch[0];
          }
        }
      } catch {
        // Ignore parsing errors
      }
    }

    const demo_url = detectedDemoUrl || project.demo_url || null;

    const updatePayload: Record<string, any> = {
      stars: ghData.stargazers_count ?? project.stars,
      primary_lang: ghData.language ?? project.primary_lang,
      last_synced_at: new Date().toISOString(),
    };

    if (demo_url) {
      updatePayload.demo_url = demo_url;
    }

    let { data: updated, error: updateErr } = await supabase
      .from("projects")
      .update(updatePayload)
      .eq("id", projectId)
      .select()
      .single();

    if (updateErr && updateErr.message.includes("demo_url")) {
      delete updatePayload.demo_url;
      const retry = await supabase
        .from("projects")
        .update(updatePayload)
        .eq("id", projectId)
        .select()
        .single();
      updated = retry.data;
      updateErr = retry.error;
    }

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      project: updated,
      detectedDemoUrl,
      message: detectedDemoUrl ? `Detected live deployment: ${detectedDemoUrl}` : "Project synced",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Resync failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
