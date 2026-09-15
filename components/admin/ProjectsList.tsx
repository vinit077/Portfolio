"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/utils";
import type { Project } from "@/lib/utils";

export function ProjectsList({ refreshKey }: { refreshKey: number }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDemoUrl, setEditDemoUrl] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const fetchProjects = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch");
      setProjects(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [refreshKey]);

  const togglePublish = async (p: Project) => {
    try {
      const res = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, published: !p.published }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update publish state");
      fetchProjects();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const deleteProject = async (p: Project) => {
    if (!confirm(`Are you sure you want to delete "${p.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/projects?id=${encodeURIComponent(p.id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete project");
      fetchProjects();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete project");
    }
  };

  const resync = async (p: Project) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    try {
      const res = await fetch("/api/resync-project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ projectId: p.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to resync");
      fetchProjects();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Resync failed");
    }
  };

  const moveOrder = async (p: Project, direction: -1 | 1) => {
    const sorted = [...projects].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((x) => x.id === p.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const swapProject = sorted[swapIdx];

    try {
      await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, sort_order: swapProject.sort_order }),
      });
      await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: swapProject.id, sort_order: p.sort_order }),
      });
      fetchProjects();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to reorder");
    }
  };

  const startEdit = (p: Project) => {
    setEditingId(p.id);
    setEditTitle(p.title);
    setEditDesc(p.description);
    setEditDemoUrl(p.demo_url || "");
    setEditTags(p.tags || []);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTagInput("");
  };

  const saveEdit = async (p: Project) => {
    setSaving(true);
    try {
      const res = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: p.id,
          title: editTitle,
          description: editDesc,
          demo_url: editDemoUrl || null,
          tags: editTags,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save project");
      setEditingId(null);
      fetchProjects();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !editTags.includes(t)) {
      setEditTags([...editTags, t]);
      setTagInput("");
    }
  };

  const removeTag = (t: string) => {
    setEditTags(editTags.filter((x) => x !== t));
  };

  if (loading) {
    return (
      <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--text-dim)", padding: 24 }}>
        loading projects…
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ padding: 20, background: "rgba(224,112,112,0.08)", border: "1px solid var(--rose-dim)", borderRadius: "var(--radius)", color: "var(--rose)", fontFamily: "var(--mono)", fontSize: 13 }}>
        {errorMsg}
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
        .map((p, idx) => {
          const isEditing = editingId === p.id;
          return (
            <div
              key={p.id}
              style={{
                background: "var(--panel)",
                border: `1px solid ${p.published ? "var(--border-soft)" : "var(--border)"}`,
                borderRadius: "var(--radius)",
                padding: "18px 20px",
                opacity: p.published ? 1 : 0.6,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
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

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                    {p.tags.slice(0, 5).map((t) => (
                      <span key={t} className="tag" style={{ fontSize: 10 }}>{t}</span>
                    ))}
                  </div>

                  {/* Links display */}
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, fontFamily: "var(--mono)", marginBottom: 4 }}>
                    {p.demo_url ? (
                      <a
                        href={p.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--amber)", textDecoration: "underline" }}
                      >
                        Live: {p.demo_url} ↗
                      </a>
                    ) : (
                      <span style={{ color: "var(--text-dim)" }}>No live demo URL set</span>
                    )}
                    {p.repo_url && (
                      <a
                        href={p.repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--teal)" }}
                      >
                        GitHub ↗
                      </a>
                    )}
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
                    className="btn btn-ghost"
                    style={{ padding: "6px 12px", fontSize: 11 }}
                    onClick={() => (isEditing ? cancelEdit() : startEdit(p))}
                  >
                    {isEditing ? "Close" : "✏️ Edit"}
                  </button>
                  <button
                    className="btn btn-teal"
                    style={{ padding: "6px 12px", fontSize: 11 }}
                    onClick={() => resync(p)}
                    title="Re-sync from GitHub"
                  >
                    ↻ sync
                  </button>
                  <button
                    className="btn"
                    style={{ padding: "6px 12px", fontSize: 11 }}
                    onClick={() => togglePublish(p)}
                  >
                    {p.published ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ padding: "6px 12px", fontSize: 11 }}
                    onClick={() => deleteProject(p)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Inline Edit Form */}
              {isEditing && (
                <div
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    marginTop: 6,
                  }}
                >
                  <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--teal)", fontWeight: 600 }}>
                    Editing: {p.title}
                  </div>

                  <div>
                    <label className="field-label">Live Demo / Vercel URL</label>
                    <input
                      className="field-input"
                      type="url"
                      value={editDemoUrl}
                      onChange={(e) => setEditDemoUrl(e.target.value)}
                      placeholder="https://your-app.vercel.app"
                    />
                  </div>

                  <div>
                    <label className="field-label">Title</label>
                    <input
                      className="field-input"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="field-label">Description</label>
                    <textarea
                      className="field-input"
                      rows={3}
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="field-label">Tags</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                      {editTags.map((t) => (
                        <span
                          key={t}
                          className="tag"
                          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                          onClick={() => removeTag(t)}
                        >
                          {t} <span style={{ color: "var(--rose)", fontSize: 11 }}>×</span>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        className="field-input"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add tag…"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <button className="btn btn-teal" onClick={addTag} type="button">
                        + Add
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                    <button className="btn btn-ghost" onClick={cancelEdit} type="button">
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => saveEdit(p)}
                      disabled={saving}
                      type="button"
                    >
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}

