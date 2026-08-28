import { NextResponse } from "next/server";

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

const KNOWN_TECH_MAP: Record<string, string> = {
  "next.js": "Next.js",
  "nextjs": "Next.js",
  "react": "React",
  "react.js": "React",
  "typescript": "TypeScript",
  "javascript": "JavaScript",
  "tailwind": "Tailwind CSS",
  "tailwindcss": "Tailwind CSS",
  "vanilla css": "Vanilla CSS",
  "spring boot": "Spring Boot",
  "springboot": "Spring Boot",
  "spring": "Spring",
  "hibernate": "Hibernate",
  "jwt": "JWT",
  "mysql": "MySQL",
  "postgresql": "PostgreSQL",
  "postgres": "PostgreSQL",
  "supabase": "Supabase",
  "firebase": "Firebase",
  "mongodb": "MongoDB",
  "redis": "Redis",
  "prisma": "Prisma",
  "drizzle": "Drizzle ORM",
  "docker": "Docker",
  "kubernetes": "Kubernetes",
  "fastapi": "FastAPI",
  "django": "Django",
  "flask": "Flask",
  "vite": "Vite",
  "lucide-react": "Lucide React",
  "lucide react": "Lucide React",
  "redux": "Redux",
  "zustand": "Zustand",
  "graphql": "GraphQL",
  "rest api": "REST API",
  "restful api": "REST API",
  "swagger": "Swagger",
  "html5": "HTML5",
  "css3": "CSS3",
  "node.js": "Node.js",
  "nodejs": "Node.js",
  "express": "Express",
  "expressjs": "Express",
  "python": "Python",
  "java": "Java",
  "kotlin": "Kotlin",
  "swift": "Swift",
  "flutter": "Flutter",
  "react native": "React Native",
  "golang": "Go",
  "rust": "Rust",
};

function extractTechStack(rawReadme: string): string[] {
  const found = new Set<string>();

  // 1. Check section headers: ## Tech Stack, ## Built With, etc.
  const sectionRegex = /##+\s*(?:tech\s*stack|built\s*with|technologies|stack|tools\s*used|built\s*using)[^\n]*\n([\s\S]*?)(?=\n##+ |\n# |\n$)/i;
  const sectionMatch = rawReadme.match(sectionRegex);
  if (sectionMatch && sectionMatch[1]) {
    const lines = sectionMatch[1].split("\n");
    for (const line of lines) {
      const cleaned = line
        .replace(/^[\s*\-•>]+/, "")
        .replace(/!\[.*?\]\(.*?\)/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .trim();
      if (cleaned && cleaned.length > 1 && cleaned.length < 35) {
        found.add(cleaned);
      }
    }
  }

  // 2. Scan full README for known technology keywords
  const lowerReadme = rawReadme.toLowerCase();
  for (const [key, canonical] of Object.entries(KNOWN_TECH_MAP)) {
    const escapedKey = key.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const regex = new RegExp(`\\b${escapedKey}\\b`, "i");
    if (regex.test(lowerReadme)) {
      found.add(canonical);
    }
  }

  return Array.from(found);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const repoUrl: string = body.repoUrl ?? "";

    // Clean trailing .git and whitespace
    const cleanUrl = repoUrl.trim().replace(/\.git\/?$/, "");
    const match = cleanUrl.match(
      /^https:\/\/github\.com\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)\/?$/
    );

    if (!match) {
      return NextResponse.json(
        { error: "Invalid GitHub URL. Must be https://github.com/{owner}/{repo}" },
        { status: 400 }
      );
    }

    const [, owner, repo] = match;
    const GITHUB_PAT = process.env.GITHUB_PAT;
    const headers: Record<string, string> = {
      "User-Agent": "vinit-portfolio-v2",
      Accept: "application/vnd.github+json",
    };
    if (GITHUB_PAT && GITHUB_PAT !== "your-github-personal-access-token") {
      headers["Authorization"] = `token ${GITHUB_PAT}`;
    }

    const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (ghRes.status === 404) {
      return NextResponse.json({ error: "Repository not found or is private." }, { status: 404 });
    }
    if (!ghRes.ok) {
      return NextResponse.json({ error: `GitHub API error: ${ghRes.status}` }, { status: 502 });
    }

    const ghData = await ghRes.json();

    // Topics from GitHub API
    const topicsRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/topics`,
      { headers: { ...headers, Accept: "application/vnd.github.mercy-preview+json" } }
    );
    const topicsData = topicsRes.ok ? await topicsRes.json() : { names: [] };

    let description: string = ghData.description ?? "";
    let demo_url: string | null = ghData.homepage && ghData.homepage.trim().length > 0 ? ghData.homepage.trim() : null;
    let readmeTechStack: string[] = [];

    const readmeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      { headers }
    );
    if (readmeRes.ok) {
      const readmeData = await readmeRes.json();
      const rawReadme = Buffer.from(readmeData.content, "base64").toString("utf-8");
      if (!description) {
        description = extractExcerpt(rawReadme);
      }
      if (!demo_url) {
        const linkMatch = rawReadme.match(/\[(?:live\s*demo|demo|live|website|app|preview|site)\]\((https?:\/\/[^\s\)]+)\)/i);
        if (linkMatch) {
          demo_url = linkMatch[1];
        } else {
          const hostMatch = rawReadme.match(/https?:\/\/[a-zA-Z0-9-]+\.(?:vercel\.app|netlify\.app|github\.io|render\.com|pages\.dev|railway\.app|herokuapp\.com)[^\s\)]*/i);
          if (hostMatch) {
            demo_url = hostMatch[0];
          }
        }
      }
      readmeTechStack = extractTechStack(rawReadme);
    }
    if (!description) description = `A project by ${owner}.`;

    // Combine and deduplicate tags
    const rawTagList: string[] = [];
    if (ghData.language) rawTagList.push(ghData.language);
    rawTagList.push(...(topicsData.names ?? []));
    rawTagList.push(...readmeTechStack);

    // Case-insensitive deduplication, preserving canonical capitalization
    const seenLower = new Set<string>();
    const tags: string[] = [];
    for (const tag of rawTagList) {
      const lower = tag.toLowerCase().trim();
      if (lower && !seenLower.has(lower)) {
        seenLower.add(lower);
        // Capitalize single words if lowercase
        const displayTag = tag.length > 0 ? tag.charAt(0).toUpperCase() + tag.slice(1) : tag;
        tags.push(displayTag);
      }
    }

    const title = humanize(ghData.name);
    const slug = slugify(title);

    return NextResponse.json({
      title,
      description,
      tags: tags.slice(0, 10), // Limit to top 10 relevant tags
      stars: ghData.stargazers_count ?? 0,
      slug,
      repo_url: ghData.html_url,
      repo_owner: owner,
      repo_name: repo,
      demo_url,
      primary_lang: ghData.language ?? null,
      last_synced_at: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to import project";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
