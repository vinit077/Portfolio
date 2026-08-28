"use client";

import React from "react";
import { MethodBadge } from "./MethodBadge";
import type { Project } from "@/lib/utils";

interface ProjCardProps {
  project: Pick<
    Project,
    | "title"
    | "description"
    | "tags"
    | "stars"
    | "slug"
    | "method_badge"
    | "status_code"
    | "repo_url"
    | "last_synced_at"
  >;
  /** When true, shows a GitHub link footer */
  showRepoLink?: boolean;
}

export function ProjCard({ project, showRepoLink = true }: ProjCardProps) {
  const {
    title,
    description,
    tags,
    stars,
    slug,
    method_badge,
    status_code,
    repo_url,
    last_synced_at,
  } = project;

  return (
    <div className="proj-card">
      {/* Card top row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <MethodBadge method={method_badge || "GET"} />
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "12.5px",
            color: "var(--text-muted)",
          }}
        >
          /projects/{slug}
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "var(--mono)",
            fontSize: "11px",
            color: "var(--teal)",
          }}
        >
          {status_code} ·{" "}
          {last_synced_at
            ? new Date(last_synced_at).getFullYear()
            : new Date().getFullYear()}
        </span>
      </div>

      {/* Title */}
      <div
        style={{
          fontFamily: "var(--display)",
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 10,
        }}
      >
        {title}
      </div>

      {/* Description */}
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: 14,
          marginBottom: 16,
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>

      {/* Tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: showRepoLink && repo_url ? 16 : 0 }}>
        {tags.map((t) => (
          <span key={t} className="tag">
            {t}
          </span>
        ))}
        {stars > 0 && (
          <span className="tag" style={{ color: "var(--amber)" }}>
            ★ {stars}
          </span>
        )}
      </div>

      {/* GitHub link */}
      {showRepoLink && repo_url && (
        <div
          style={{
            marginTop: 16,
            fontFamily: "var(--mono)",
            fontSize: "12.5px",
            color: "var(--text-dim)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <MethodBadge method="GET" />
          <a
            href={repo_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--teal)",
              borderBottom: "1px solid var(--teal-dim)",
              transition: "border-color 0.15s ease",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.borderColor = "var(--teal)")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.borderColor = "var(--teal-dim)")
            }
          >
            View on GitHub ↗
          </a>
        </div>
      )}
    </div>
  );
}
