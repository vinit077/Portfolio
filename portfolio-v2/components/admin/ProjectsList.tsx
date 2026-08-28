"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/utils";
import type { Project } from "@/lib/utils";

const SUPABASE_FUNCTION_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(
  ".supabase.co",
  ".functions.supabase.co"
);

export function ProjectsList({ refreshKey }: { refreshKey: number }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchProjects = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true });
    setProjects((data as Project[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, [refreshKey]);

  const togglePublish = async (p: Project) => {
    await supabase
      .from("projects")
      .update({ published: !p.published })
      .eq("id", p.id);
    fetchProjects();
  };

  const deleteProject = async (p: Project) => {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    await supabase.from("projects").delete().eq("id", p.id);
    fetchProjects();
  };

  const resync = async (p: Project) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await fetch(`${SUPABASE_FUNCTION_URL}/functions/v1/resync-project`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ projectId: p.id }),
    });
    fetchProjects();
  };

  const moveOrder = async (p: Project, direction: -1 | 1) => {
    const sorted = [...projects].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((x) => x.id === p.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const swapProject = sorted[swapIdx];
    await supabase
      .from("projects")
      .update({ sort_order: swapProject.sort_order })
      .eq("id", p.id);
    await supabase
      .from("projects")
      .update({ sort_order: p.sort_order })
      .eq("id", swapProject.id);
    fetchProjects();
  };

  if (loading) {
    return (
      <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--text-dim)", padding: 24 }}>
        loading projects…
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div
        style={{
          background: "transparent",
          border: "1px dashed var(--border)",
          borderRadius: "var(--radius)",
          padding: 40,
          textAlign: "center",
          fontFamily: "var(--mono)",
          fontSize: 13,
          color: "var(--text-dim)",
        }}
      >
        No projects yet. Import one from the Import tab.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {projects
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((p, idx) => (
          <div
            key={p.id}
            style={{
              background: "var(--panel)",
              border: `1px solid ${p.published ? "var(--border-soft)" : "var(--border)"}`,
              borderRadius: "var(--radius)",
              padding: "18px 20px",
              opacity: p.published ? 1 : 0.55,
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
            }}
          >
            {/* Order controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
              <button
                className="btn"
                style={{ padding: "4px 8px", fontSize: 12 }}
                onClick={() => moveOrder(p, -1)}
                disabled={idx === 0}
                title="Move up"
              >
                ↑
              </button>
              <button
                className="btn"
                style={{ padding: "4px 8px", fontSize: 12 }}
                onClick={() => moveOrder(p, 1)}
                disabled={idx === projects.length - 1}
                title="Move down"
              >
                ↓
              </button>
            </div>

            {/* Project info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                <span
                  style={{
                    fontFamily: "var(--display)",
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--text)",
                  }}
                >
                  {p.title}
                </span>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 4,
                    background: p.published
                      ? "rgba(79,209,197,0.1)"
                      : "rgba(93,105,125,0.15)",
                    color: p.published ? "var(--teal)" : "var(--text-dim)",
                    border: `1px solid ${p.published ? "var(--teal-dim)" : "var(--border)"}`,
                  }}
                >
                  {p.published ? "published" : "draft"}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                {p.tags.slice(0, 4).map((t) => (
                  <span key={t} className="tag" style={{ fontSize: 10 }}>{t}</span>
                ))}
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  color: "var(--text-dim)",
                  marginTop: 4,
                }}
              >
                {p.last_synced_at ? `synced ${timeAgo(p.last_synced_at)}` : "never synced"}
                {" · "}★ {p.stars}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
              <button
                className="btn btn-teal"
                style={{ padding: "6px 12px", fontSize: 11 }}
                onClick={() => resync(p)}
                title="Re-sync from GitHub"
                id={`resync-${p.id}`}
              >
                ↻ sync
              </button>
              <button
                className="btn"
                style={{ padding: "6px 12px", fontSize: 11 }}
                onClick={() => togglePublish(p)}
                id={`toggle-${p.id}`}
              >
                {p.published ? "Unpublish" : "Publish"}
              </button>
              <button
                className="btn btn-danger"
                style={{ padding: "6px 12px", fontSize: 11 }}
                onClick={() => deleteProject(p)}
                id={`delete-${p.id}`}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
