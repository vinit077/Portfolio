import React from "react";
import { MethodBadge } from "@/components/ui/MethodBadge";
import { ProjCard } from "@/components/ui/ProjCard";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/utils";

// Fallback projects shown if DB has no data yet (first deploy before admin import)
const FALLBACK_PROJECTS: Project[] = [
  {
    id: "fallback-1",
    slug: "employee-leave-portal",
    repo_url: "https://github.com/vinit077",
    repo_owner: "vinit077",
    repo_name: "employee-leave-portal",
    title: "Enterprise Employee Management & Leave Portal",
    description:
      "A full-stack HR system with JWT authentication and role-based authorization, covering employee records, leave requests, and attendance in one layered application. RESTful APIs built with Hibernate (JPA), documented and tested through Swagger, behind a responsive React frontend.",
    tags: ["Spring Boot", "React", "MySQL", "JWT", "Hibernate"],
    stars: 0,
    primary_lang: "Java",
    method_badge: "GET",
    status_code: 200,
    sort_order: 0,
    published: true,
    last_synced_at: "2026-01-01T00:00:00Z",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "fallback-2",
    slug: "ai-expense-splitter",
    repo_url: "https://github.com/vinit077",
    repo_owner: "vinit077",
    repo_name: "ai-expense-splitter",
    title: "AI Expense Splitter",
    description:
      "A group expense manager with secure authentication, shared expense tracking, and automatic settlement calculations, so groups always know who owes what. Dashboard views and backend services built for fast, reliable everyday use.",
    tags: ["Full Stack", "Auth", "Dashboards", "REST API"],
    stars: 0,
    primary_lang: "Java",
    method_badge: "GET",
    status_code: 200,
    sort_order: 1,
    published: true,
    last_synced_at: "2025-01-01T00:00:00Z",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
];

export async function Projects() {
  let projects: Project[] = [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true });

    if (!error && data && data.length > 0) {
      projects = data as Project[];
    } else {
      projects = FALLBACK_PROJECTS;
    }
  } catch {
    projects = FALLBACK_PROJECTS;
  }

  return (
    <section id="projects" className="section-wrap">
      <div className="wrap">
        <div className="section-head reveal">
          <div className="eyebrow">endpoint</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <MethodBadge method="GET" />
            <span className="path">/projects</span>
          </div>
        </div>

        <div
          className="reveal"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 22,
          }}
        >
          {projects.map((p) => (
            <ProjCard key={p.id} project={p} />
          ))}
        </div>

        <div
          className="reveal"
          style={{
            marginTop: 22,
            fontFamily: "var(--mono)",
            fontSize: "12.5px",
            color: "var(--text-dim)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <MethodBadge method="GET" />
          more builds live on{" "}
          <a
            href="https://github.com/vinit077"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--teal)",
              borderBottom: "1px solid var(--teal-dim)",
            }}
          >
            github.com/vinit077
          </a>{" "}
          — 22 repositories and counting.
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          #projects .reveal[style*="grid"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
