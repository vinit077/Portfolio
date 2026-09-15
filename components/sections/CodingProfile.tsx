import React from "react";
import { MethodBadge } from "@/components/ui/MethodBadge";
import { CodingCard, EmptyCard } from "@/components/ui/CodingCard";
import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/utils";
import type { CodingStatsRow } from "@/lib/utils";

export async function CodingProfile() {
  let lc: CodingStatsRow | null = null;
  let cf: CodingStatsRow | null = null;
  let syncedAt: string | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("coding_stats_cache")
      .select("*");

    if (data) {
      lc = (data.find((r: CodingStatsRow) => r.platform === "leetcode") ?? null) as CodingStatsRow | null;
      cf = (data.find((r: CodingStatsRow) => r.platform === "codeforces") ?? null) as CodingStatsRow | null;

      const ts = lc?.last_synced_at ?? cf?.last_synced_at ?? null;
      if (ts) syncedAt = timeAgo(ts);
    }
  } catch {
    // Supabase not configured yet — show empty state
  }

  const hasData = lc || cf;

  return (
    <section id="coding-profile" className="section-wrap">
      <div className="wrap">
        <div className="section-head reveal">
          <div className="eyebrow">endpoint</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <MethodBadge method="GET" />
            <span className="path">/coding-profile</span>
          </div>
          <div className="status-line">
            <span style={{ color: "var(--teal)" }}>200 OK</span>
            {syncedAt && (
              <span> · synced {syncedAt}</span>
            )}
            {!hasData && (
              <span> · awaiting first sync</span>
            )}
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
          {lc ? <CodingCard row={lc} /> : <EmptyCard platform="leetcode" />}
          {cf ? <CodingCard row={cf} /> : <EmptyCard platform="codeforces" />}
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          #coding-profile .reveal[style*="grid"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
