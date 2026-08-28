"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProjCard } from "@/components/ui/ProjCard";
import { slugify, humanizeRepoName } from "@/lib/utils";
import type { Project } from "@/lib/utils";

const SUPABASE_FUNCTION_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(
  ".supabase.co",
  ".functions.supabase.co"
);

type PreviewData = {
  title: string;
  description: string;
  tags: string[];
  stars: number;
  slug: string;
  repo_url: string;
  repo_owner: string;
  repo_name: string;
  primary_lang: string | null;
  last_synced_at: string;
};

export function ImportPanel({ onPublish }: { onPublish: () => void }) {
  const [repoUrl, setRepoUrl] = useState("");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const supabase = createClient();

  const handleFetch = async () => {
    setFetchLoading(true);
    setFetchError(null);
    setPreview(null);
    setPublished(false);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setFetchError("Not authenticated"); setFetchLoading(false); return; }

    try {
      const res = await fetch(
        `${SUPABASE_FUNCTION_URL}/functions/v1/import-project`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ repoUrl }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to fetch repo");

      setPreview(json);
      setEditTitle(json.title);
      setEditDesc(json.description);
      setEditTags(json.tags);
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setFetchLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!preview) return;
    setPublishLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setPublishLoading(false); return; }

    try {
      const res = await fetch(
        `${SUPABASE_FUNCTION_URL}/functions/v1/save-project`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            ...preview,
            title: editTitle,
            description: editDesc,
            tags: editTags,
            slug: slugify(editTitle),
            published: true,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to publish");
      setPublished(true);
      onPublish();
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setPublishLoading(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !editTags.includes(t)) {
      setEditTags((prev) => [...prev, t]);
      setTagInput("");
    }
  };

  const removeTag = (t: string) =>
    setEditTags((prev) => prev.filter((x) => x !== t));

  return (
    <div>
      {/* URL input panel */}
      <div className="console" style={{ marginBottom: 24 }}>
        <div className="console-bar" style={{ gap: 10 }}>
          <span className="method method-post" style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", padding: "3px 8px", borderRadius: 5 }}>
            POST
          </span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-muted)" }}>
            /admin/projects/import
          </span>
        </div>
        <div style={{ padding: "20px 20px 18px" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label className="field-label">repo url</label>
              <input
                className="field-input"
                type="url"
                id="repo-url-input"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/vinit077/..."
                onKeyDown={(e) => e.key === "Enter" && handleFetch()}
              />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                className="btn btn-primary"
                onClick={handleFetch}
                disabled={fetchLoading || !repoUrl}
                id="fetch-repo-btn"
              >
                {fetchLoading ? "Fetching…" : "Fetch"}
              </button>
            </div>
          </div>

          {fetchError && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 14px",
                background: "rgba(224,112,112,0.08)",
                border: "1px solid var(--rose-dim)",
                borderRadius: 7,
                fontFamily: "var(--mono)",
                fontSize: 12,
                color: "var(--rose)",
              }}
            >
              {fetchError}
            </div>
          )}
        </div>
      </div>

      {/* Preview panel */}
      {preview && !published && (
        <div>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              color: "var(--text-dim)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--amber)",
                display: "inline-block",
              }}
            />
            preview (editable)
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
            }}
          >
            {/* Edit form */}
            <div
              style={{
                background: "var(--panel)",
                border: "1px solid var(--border-soft)",
                borderRadius: "var(--radius)",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div>
                <label className="field-label">title</label>
                <input
                  className="field-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  id="edit-title"
                />
              </div>
              <div>
                <label className="field-label">description</label>
                <textarea
                  className="field-input"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  id="edit-desc"
                />
              </div>
              <div>
                <label className="field-label">tags</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 }}>
                  {editTags.map((t) => (
                    <span
                      key={t}
                      className="tag"
                      style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}
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
                    placeholder="add tag…"
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    style={{ flex: 1 }}
                    id="tag-input"
                  />
                  <button className="btn btn-teal" onClick={addTag} style={{ flexShrink: 0 }}>
                    + add
                  </button>
                </div>
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 12,
                  color: "var(--text-dim)",
                  display: "flex",
                  gap: 16,
                }}
              >
                <span>★ {preview.stars}</span>
                {preview.primary_lang && <span>lang: {preview.primary_lang}</span>}
              </div>
            </div>

            {/* Live preview */}
            <div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  color: "var(--text-dim)",
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                card preview
              </div>
              <ProjCard
                project={{
                  title: editTitle,
                  description: editDesc,
                  tags: editTags,
                  stars: preview.stars,
                  slug: slugify(editTitle),
                  method_badge: "GET",
                  status_code: 200,
                  repo_url: preview.repo_url,
                  last_synced_at: preview.last_synced_at,
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
            <button
              className="btn btn-ghost"
              onClick={() => { setPreview(null); setRepoUrl(""); }}
              id="discard-btn"
            >
              Discard
            </button>
            <button
              className="btn btn-primary"
              onClick={handlePublish}
              disabled={publishLoading || !editTitle || !editDesc}
              id="publish-btn"
            >
              {publishLoading ? "Publishing…" : "Publish →"}
            </button>
          </div>
        </div>
      )}

      {/* Success state */}
      {published && (
        <div
          style={{
            background: "rgba(79,209,197,0.06)",
            border: "1px solid var(--teal-dim)",
            borderRadius: "var(--radius)",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 12,
              color: "var(--teal)",
              marginBottom: 12,
            }}
          >
            201 Created
          </div>
          <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
            Project published successfully.
          </p>
          <button
            className="btn btn-teal"
            onClick={() => { setPublished(false); setPreview(null); setRepoUrl(""); }}
            id="import-another-btn"
          >
            Import another →
          </button>
        </div>
      )}
    </div>
  );
}
