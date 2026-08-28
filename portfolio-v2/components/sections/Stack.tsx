"use client";

import React from "react";
import { MethodBadge } from "@/components/ui/MethodBadge";

// SVG icons from v1 — original monoline glyphs
const ICONS: Record<string, string> = {
  Java: `<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z"/><path d="M17 9h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 3c-.5 1 .5 1.5 0 2.5M12 3c-.5 1 .5 1.5 0 2.5"/>`,
  SQL: `<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>`,
  JavaScript: `<path d="M8 4c-2 0-3 1-3 3v3c0 1-.5 2-2 2 1.5 0 2 1 2 2v3c0 2 1 3 3 3"/><path d="M16 4c2 0 3 1 3 3v3c0 1 .5 2 2 2-1.5 0-2 1-2 2v3c0 2-1 3-3 3"/>`,
  Dart: `<path d="M12 3 4 12l8 9 8-9-8-9Z"/><path d="M4 12h16"/>`,
  HTML5: `<path d="m9 6-6 6 6 6"/><path d="m15 6 6 6-6 6"/>`,
  CSS3: `<path d="M9 3 7 21M17 3l-2 18M4 8h16M3 16h16"/>`,
  "React.js": `<circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/>`,
  "Next.js": `<path d="M6 4v16M6 4l12 16M18 4v10"/>`,
  "Spring Boot": `<path d="M20 4C10 4 4 10 4 20c10 0 16-6 16-16Z"/><path d="M6 18c4-4 8-8 12-12"/>`,
  "Spring Security": `<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/>`,
  "Spring MVC": `<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>`,
  "Node.js": `<path d="M12 2 21 7v10l-9 5-9-5V7l9-5Z"/>`,
  "Express.js": `<path d="M5 12h14M13 6l6 6-6 6"/>`,
  MySQL: `<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>`,
  MongoDB: `<path d="M12 2c4 5 7 9 7 13a7 7 0 0 1-14 0c0-4 3-8 7-13Z"/>`,
  PostgreSQL: `<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>`,
  Firebase: `<path d="M12 2c1 4-3 5-3 9a3 3 0 0 0 6 0c1 2 0 4-1 5 4-1 6-4 6-8 0-5-4-8-4-8s1 3-1 5c-1-4-3-3-3-3Z"/>`,
  Supabase: `<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>`,
  Git: `<circle cx="6" cy="6" r="2.2"/><circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="10" r="2.2"/><path d="M6 8.2V15.8M6 8.2C6 12 12 12 12 12M12 12c2 0 4-.5 6-2"/>`,
  GitHub: `<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 4v16M9 9h7M9 13h5"/>`,
  Docker: `<rect x="3" y="10" width="5" height="5"/><rect x="9.5" y="10" width="5" height="5"/><rect x="9.5" y="4" width="5" height="5"/><rect x="16" y="10" width="5" height="5"/><path d="M2 17c1 2 3 3 6 3h9c2.5 0 4.5-1 5.5-3"/>`,
  Swagger: `<path d="M7 3h7l4 4v14H7Z"/><path d="M14 3v4h4"/><path d="m10 13-2 2 2 2M13 13l2 2-2 2"/>`,
  "VS Code": `<path d="m9 6-6 6 6 6"/><path d="m15 6 6 6-6 6"/>`,
  "Android Studio": `<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 19h2"/>`,
  OOP: `<path d="m12 2 8 4.5v11L12 22l-8-4.5v-11L12 2Z"/><path d="M12 2v20M4 6.5 12 11l8-4.5M4 17.5 12 13l8 4.5"/>`,
  DSA: `<circle cx="12" cy="4" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="12" r="2"/><circle cx="4" cy="20" r="2"/><circle cx="9" cy="20" r="2"/><path d="M12 6v3M11 8 7 11M13 8l4 3M6 14v3M5 17l-1 1M7 17l1 1"/>`,
  "REST APIs": `<path d="M4 8h13M13 4l4 4-4 4"/><path d="M20 16H7M11 12l-4 4 4 4"/>`,
  "JWT Auth": `<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M14 9l2 2"/>`,
  Hibernate: `<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>`,
  CRUD: `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>`,
};

type ChipCategory = "lang" | "front" | "back" | "data" | "tool" | "concept";
const categoryHover: Record<ChipCategory, string> = {
  lang: "var(--amber)",
  front: "var(--teal)",
  back: "var(--amber)",
  data: "#9C8CF2",
  tool: "var(--teal)",
  concept: "var(--text-muted)",
};

interface ChipData {
  label: string;
  category: ChipCategory;
}

function Chip({ label, category }: ChipData) {
  const hoverColor = categoryHover[category];
  const icon = ICONS[label];
  const isConcept = category === "concept";

  return (
    <span
      className={`chip ${isConcept ? "c-concept" : ""}`}
      style={isConcept ? { background: "transparent", borderStyle: "dashed" } : {}}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = hoverColor;
        (e.currentTarget as HTMLElement).style.color = hoverColor;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "";
        (e.currentTarget as HTMLElement).style.color = "";
      }}
    >
      {icon && (
        <svg
          viewBox="0 0 24 24"
          style={{
            width: 16,
            height: 16,
            flexShrink: 0,
            stroke: "currentColor",
            fill: "none",
            strokeWidth: 1.6,
            strokeLinecap: "round",
            strokeLinejoin: "round",
          }}
          dangerouslySetInnerHTML={{ __html: icon }}
        />
      )}
      {label}
    </span>
  );
}

const groups: { label: string; count: string; category: ChipCategory; chips: string[] }[] = [
  { label: "languages", count: "06", category: "lang", chips: ["Java", "SQL", "JavaScript", "Dart", "HTML5", "CSS3"] },
  { label: "frontend", count: "02", category: "front", chips: ["React.js", "Next.js"] },
  { label: "backend", count: "05", category: "back", chips: ["Spring Boot", "Spring Security", "Spring MVC", "Node.js", "Express.js"] },
  { label: "data", count: "05", category: "data", chips: ["MySQL", "MongoDB", "PostgreSQL", "Firebase", "Supabase"] },
  { label: "tooling", count: "06", category: "tool", chips: ["Git", "GitHub", "Docker", "Swagger", "VS Code", "Android Studio"] },
  { label: "concepts", count: "06", category: "concept", chips: ["OOP", "DSA", "REST APIs", "JWT Auth", "Hibernate", "CRUD"] },
];

export function Stack() {
  return (
    <section id="stack" className="section-wrap">
      <div className="wrap">
        <div className="section-head reveal">
          <div className="eyebrow">endpoint</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <MethodBadge method="GET" />
            <span className="path">/stack</span>
          </div>
        </div>
        <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {groups.map((g) => (
            <div
              key={g.label}
              style={{
                background: "var(--panel)",
                border: "1px solid var(--border-soft)",
                borderRadius: "var(--radius)",
                padding: "20px 22px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 16,
                  fontFamily: "var(--mono)",
                  fontSize: "11.5px",
                  color: "var(--text-dim)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {g.label}
                <span style={{ marginLeft: "auto", color: "var(--border)", fontSize: 11 }}>
                  {g.count}
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {g.chips.map((label) => (
                  <Chip key={label} label={label} category={g.category} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
