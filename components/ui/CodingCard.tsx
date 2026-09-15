"use client";

import React from "react";
import type { CodingStatsRow, LeetCodeStats, CodeforcesStats } from "@/lib/utils";
import { timeAgo } from "@/lib/utils";

function DotBar({
  filled,
  total,
  color,
}: {
  filled: number;
  total: number;
  color: string;
}) {
  const dots = 10;
  const filledDots = Math.round((filled / Math.max(total, 1)) * dots);
  return (
    <span style={{ fontFamily: "var(--mono)", fontSize: 13, letterSpacing: 1 }}>
      {Array.from({ length: dots }).map((_, i) => (
        <span key={i} style={{ color: i < filledDots ? color : "var(--border)" }}>
          ●
        </span>
      ))}
    </span>
  );
}

function LeetCodeCard({ row }: { row: CodingStatsRow }) {
  const s = row.stats as LeetCodeStats;
  return (
    <div
      style={{
        background: "var(--panel)",
        border: "1px solid var(--border-soft)",
        borderRadius: "var(--radius)",
        padding: "26px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 11,
          color: "var(--text-dim)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 16,
        }}
      >
        leetcode
      </div>
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 13,
          color: "var(--text-muted)",
          marginBottom: 18,
        }}
      >
        {row.handle}
      </div>

      <div
        style={{
          fontFamily: "var(--display)",
          fontSize: 28,
          fontWeight: 700,
          color: "var(--text)",
          marginBottom: 20,
        }}
      >
        {s.solved}{" "}
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 13,
            fontWeight: 400,
            color: "var(--text-muted)",
          }}
        >
          solved
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {/* Easy */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: "var(--mono)",
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          <DotBar filled={s.easy[0]} total={s.easy[1]} color="var(--teal)" />
          <span style={{ color: "var(--teal)", minWidth: 36 }}>easy</span>
          <span style={{ marginLeft: "auto", color: "var(--text-dim)" }}>
            {s.easy[0]}/{s.easy[1]}
          </span>
        </div>
        {/* Medium */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: "var(--mono)",
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          <DotBar filled={s.medium[0]} total={s.medium[1]} color="var(--amber)" />
          <span style={{ color: "var(--amber)", minWidth: 36 }}>med</span>
          <span style={{ marginLeft: "auto", color: "var(--text-dim)" }}>
            {s.medium[0]}/{s.medium[1]}
          </span>
        </div>
        {/* Hard */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: "var(--mono)",
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          <DotBar filled={s.hard[0]} total={s.hard[1]} color="var(--rose)" />
          <span style={{ color: "var(--rose)", minWidth: 36 }}>hard</span>
          <span style={{ marginLeft: "auto", color: "var(--text-dim)" }}>
            {s.hard[0]}/{s.hard[1]}
          </span>
        </div>
      </div>

      {s.acceptance_rate > 0 && (
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 12,
            color: "var(--text-dim)",
            marginBottom: 20,
          }}
        >
          acceptance rate:{" "}
          <span style={{ color: "var(--text-muted)" }}>
            {s.acceptance_rate.toFixed(1)}%
          </span>
        </div>
      )}

      <a
        href={row.profile_url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-teal"
        style={{ alignSelf: "flex-start", marginTop: "auto" }}
      >
        View profile ↗
      </a>
    </div>
  );
}

function CodeforcesCard({ row }: { row: CodingStatsRow }) {
  const s = row.stats as CodeforcesStats;
  return (
    <div
      style={{
        background: "var(--panel)",
        border: "1px solid var(--border-soft)",
        borderRadius: "var(--radius)",
        padding: "26px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 11,
          color: "var(--text-dim)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 16,
        }}
      >
        codeforces
      </div>
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 13,
          color: "var(--text-muted)",
          marginBottom: 18,
        }}
      >
        {row.handle}
      </div>

      <div
        style={{
          fontFamily: "var(--display)",
          fontSize: 28,
          fontWeight: 700,
          color: "var(--text)",
          marginBottom: 6,
        }}
      >
        {s.rating.toLocaleString()}
      </div>
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 14,
          color: "var(--amber)",
          marginBottom: 20,
          textTransform: "capitalize",
        }}
      >
        {s.rank}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          fontFamily: "var(--mono)",
          fontSize: 12,
          color: "var(--text-dim)",
          marginBottom: 20,
        }}
      >
        <div>
          max rating:{" "}
          <span style={{ color: "var(--text-muted)" }}>
            {s.max_rating.toLocaleString()}
          </span>
        </div>
        <div>
          contests:{" "}
          <span style={{ color: "var(--text-muted)" }}>{s.contests}</span>
        </div>
      </div>

      <a
        href={row.profile_url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-teal"
        style={{ alignSelf: "flex-start", marginTop: "auto" }}
      >
        View profile ↗
      </a>
    </div>
  );
}

function EmptyCard({ platform }: { platform: string }) {
  return (
    <div
      style={{
        background: "transparent",
        border: "1px dashed var(--border)",
        borderRadius: "var(--radius)",
        padding: "26px 28px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 220,
        gap: 10,
      }}
    >
      <span
        style={{
          fontFamily: "var(--mono)",
          fontSize: 11,
          color: "var(--text-dim)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        {platform}
      </span>
      <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-dim)" }}>
        stats syncing…
      </span>
    </div>
  );
}

export function CodingCard({ row }: { row: CodingStatsRow | null }) {
  if (!row) return null;
  if (row.platform === "leetcode") return <LeetCodeCard row={row} />;
  if (row.platform === "codeforces") return <CodeforcesCard row={row} />;
  return null;
}

export { EmptyCard };
