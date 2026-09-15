import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

const LC_HANDLE = Deno.env.get("LEETCODE_HANDLE") ?? "vinitmahale77";
const CF_HANDLE = Deno.env.get("CF_HANDLE") ?? "vinitmahale77";

// ─── LeetCode (unofficial GraphQL) ───────────────────────────────────────────
async function fetchLeetCode() {
  const query = `
    query userProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        profile { reputation ranking }
      }
      allQuestionsCount { difficulty count }
    }
  `;

  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://leetcode.com",
      "User-Agent": "Mozilla/5.0",
    },
    body: JSON.stringify({ query, variables: { username: LC_HANDLE } }),
  });

  if (!res.ok) throw new Error(`LeetCode API error: ${res.status}`);
  const data = await res.json();

  const user = data?.data?.matchedUser;
  if (!user) throw new Error("LeetCode user not found");

  const ac = user.submitStats?.acSubmissionNum ?? [];
  const allQ = data?.data?.allQuestionsCount ?? [];

  const getCount = (diff: string, arr: { difficulty: string; count: number }[]) =>
    arr.find((x) => x.difficulty === diff)?.count ?? 0;

  const solved = getCount("All", ac);
  const easy = getCount("Easy", ac);
  const medium = getCount("Medium", ac);
  const hard = getCount("Hard", ac);
  const totalEasy = getCount("Easy", allQ);
  const totalMedium = getCount("Medium", allQ);
  const totalHard = getCount("Hard", allQ);

  // Estimate acceptance rate from submission counts
  const totalSubs = ac.reduce(
    (s: number, x: { difficulty: string; submissions: number }) =>
      x.difficulty === "All" ? s + x.submissions : s,
    0
  );
  const acceptanceRate = totalSubs > 0 ? Math.round((solved / totalSubs) * 1000) / 10 : 0;

  return {
    solved,
    easy: [easy, totalEasy],
    medium: [medium, totalMedium],
    hard: [hard, totalHard],
    acceptance_rate: acceptanceRate,
  };
}

// ─── Codeforces ───────────────────────────────────────────────────────────────
async function fetchCodeforces() {
  const [infoRes, ratingRes] = await Promise.all([
    fetch(`https://codeforces.com/api/user.info?handles=${CF_HANDLE}`),
    fetch(`https://codeforces.com/api/user.rating?handle=${CF_HANDLE}`),
  ]);

  if (!infoRes.ok) throw new Error(`Codeforces info API error: ${infoRes.status}`);
  const infoData = await infoRes.json();
  if (infoData.status !== "OK") throw new Error(infoData.comment ?? "Codeforces error");

  const u = infoData.result[0];
  let contests = 0;
  if (ratingRes.ok) {
    const ratingData = await ratingRes.json();
    contests = ratingData.status === "OK" ? ratingData.result.length : 0;
  }

  return {
    rating: u.rating ?? 0,
    max_rating: u.maxRating ?? 0,
    rank: u.rank ?? "unranked",
    contests,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  // This endpoint is called by pg_cron (service role) OR by owner (session JWT)
  // Accept both cases
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const results: { platform: string; success: boolean; error?: string }[] = [];

  // ── LeetCode sync ──
  let lcError: string | null = null;
  try {
    const stats = await fetchLeetCode();
    await supabase.from("coding_stats_cache").upsert({
      platform: "leetcode",
      handle: LC_HANDLE,
      profile_url: `https://leetcode.com/u/${LC_HANDLE}`,
      stats,
      last_synced_at: new Date().toISOString(),
      last_error: null,
    });
    await supabase.from("sync_log").insert({ source: "leetcode-sync", target_id: "leetcode", success: true });
    results.push({ platform: "leetcode", success: true });
  } catch (err) {
    lcError = err instanceof Error ? err.message : String(err);
    // Update last_error but keep old stats
    await supabase
      .from("coding_stats_cache")
      .update({ last_error: lcError })
      .eq("platform", "leetcode");
    await supabase.from("sync_log").insert({
      source: "leetcode-sync",
      target_id: "leetcode",
      success: false,
      message: lcError,
    });
    results.push({ platform: "leetcode", success: false, error: lcError });
  }

  // ── Codeforces sync ──
  let cfError: string | null = null;
  try {
    const stats = await fetchCodeforces();
    await supabase.from("coding_stats_cache").upsert({
      platform: "codeforces",
      handle: CF_HANDLE,
      profile_url: `https://codeforces.com/profile/${CF_HANDLE}`,
      stats,
      last_synced_at: new Date().toISOString(),
      last_error: null,
    });
    await supabase.from("sync_log").insert({ source: "codeforces-sync", target_id: "codeforces", success: true });
    results.push({ platform: "codeforces", success: true });
  } catch (err) {
    cfError = err instanceof Error ? err.message : String(err);
    await supabase
      .from("coding_stats_cache")
      .update({ last_error: cfError })
      .eq("platform", "codeforces");
    await supabase.from("sync_log").insert({
      source: "codeforces-sync",
      target_id: "codeforces",
      success: false,
      message: cfError,
    });
    results.push({ platform: "codeforces", success: false, error: cfError });
  }

  const allOk = results.every((r) => r.success);
  return json({
    message: allOk ? "All sources synced" : "Partial sync — see results",
    results,
  });
});
