"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/utils";
import type { CodingStatsRow } from "@/lib/utils";

const SUPABASE_FUNCTION_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(
  ".supabase.co",
  ".functions.supabase.co"
);

export function CodingStatsPanel() {
  const [stats, setStats] = useState<CodingStatsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const supabase = createClient();

  const fetchStats = async () => {
    setLoading(true);
    const { data } = await supabase.from("coding_stats_cache").select("*");
    setStats((data as CodingStatsRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchStats(); }, []);

  const syncNow = async () => {
    setSyncing(true);
    setSyncResult(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSyncing(false); return; }

    try {
      const res = await fetch("/api/sync-coding-stats", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setSyncResult(`✓ Sync complete — ${json.message ?? "stats updated"}`);
        fetchStats();
      } else {
        setSyncResult(`⚠ ${json.error ?? "Sync failed"}`);
      }
    } catch {
      setSyncResult("⚠ Network error during sync");
    } finally {
      setSyncing(false);
    }
  };

  const lc = stats.find((s) => s.platform === "leetcode");
  const cf = stats.find((s) => s.platform === "codeforces");

  return (
    <div>
      {/* Sync action bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          padding: "14px 18px",
          background: "var(--panel)",
          border: "1px solid var(--border-soft)",
          borderRadius: "var(--radius)",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              color: "var(--text-dim)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            GET /coding-profile
          </div>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 12,
              color: "var(--text-muted)",
              marginTop: 4,
            }}
          >
            auto-syncs every 12h via pg_cron
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={syncNow}
          disabled={syncing}
          id="sync-now-btn"
        >
          {syncing ? "Syncing…" : "↻ Sync Now"}
        </button>
      </div>

      {syncResult && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: 7,
            fontFamily: "var(--mono)",
            fontSize: 12,
            marginBottom: 20,
            background: syncResult.startsWith("✓")
              ? "rgba(79,209,197,0.06)"
              : "rgba(224,112,112,0.06)",
            border: `1px solid ${syncResult.startsWith("✓") ? "var(--teal-dim)" : "var(--rose-dim)"}`,
            color: syncResult.startsWith("✓") ? "var(--teal)" : "var(--rose)",
          }}
        >
          {syncResult}
        </div>
      )}

      {loading ? (
        <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--text-dim)", padding: 24 }}>
          loading stats…
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[lc, cf].map((row, i) => {
            const platform = i === 0 ? "leetcode" : "codeforces";
            return (
              <div
                key={platform}
                style={{
                  background: "var(--panel)",
                  border: `1px solid ${row ? "var(--border-soft)" : "var(--border)"}`,
                  borderRadius: "var(--radius)",
                  padding: "20px 22px",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                    color: "var(--text-dim)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: 12,
                  }}
                >
                  {platform}
                </div>
                {row ? (
                  <>
                    <pre
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 11,
                        color: "var(--text-muted)",
                        background: "var(--panel-raised)",
                        padding: "12px 14px",
                        borderRadius: 7,
                        border: "1px solid var(--border)",
                        overflow: "auto",
                        marginBottom: 12,
                        maxHeight: 180,
                      }}
                    >
                      {JSON.stringify(row.stats, null, 2)}
                    </pre>
                    <div
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 11,
                        color: "var(--text-dim)",
                      }}
                    >
                      last synced:{" "}
                      <span style={{ color: "var(--teal)" }}>
                        {timeAgo(row.last_synced_at)}
                      </span>
                      {row.last_error && (
                        <div style={{ color: "var(--rose)", marginTop: 4 }}>
                          last error: {row.last_error}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 12,
                      color: "var(--text-dim)",
                      fontStyle: "italic",
                    }}
                  >
                    not yet synced — hit Sync Now
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
