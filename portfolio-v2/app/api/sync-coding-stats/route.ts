import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const LC_HANDLE = process.env.LEETCODE_HANDLE ?? "vinitmahale77";
const CF_HANDLE = process.env.CF_HANDLE ?? "vinitmahale77";

async function fetchLeetCode() {
  try {
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
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({ query, variables: { username: LC_HANDLE } }),
    });

    if (res.ok) {
      const data = await res.json();
      const user = data?.data?.matchedUser;
      if (user) {
        const ac = user.submitStats?.acSubmissionNum ?? [];
        const allQ = data?.data?.allQuestionsCount ?? [];

        const getCount = (diff: string, arr: { difficulty: string; count: number }[]) =>
          arr.find((x) => x.difficulty === diff)?.count ?? 0;

        const solved = getCount("All", ac);
        const easy = getCount("Easy", ac);
        const medium = getCount("Medium", ac);
        const hard = getCount("Hard", ac);
        const totalEasy = getCount("Easy", allQ) || 820;
        const totalMedium = getCount("Medium", allQ) || 1700;
        const totalHard = getCount("Hard", allQ) || 750;

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
    }
  } catch {
    // Primary GraphQL failed, proceed to fallback
  }

  // Fallback API if primary LeetCode GraphQL endpoint is rate-limited or blocked
  const fallbackRes = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${LC_HANDLE}`);
  if (!fallbackRes.ok) throw new Error("Failed to fetch LeetCode profile");
  const fb = await fallbackRes.json();
  if (fb.status === "error" || fb.totalSolved === undefined) throw new Error(fb.message || "LeetCode user not found");

  return {
    solved: fb.totalSolved ?? 0,
    easy: [fb.easySolved ?? 0, fb.totalEasy ?? 820],
    medium: [fb.mediumSolved ?? 0, fb.totalMedium ?? 1700],
    hard: [fb.hardSolved ?? 0, fb.totalHard ?? 750],
    acceptance_rate: fb.acceptanceRate ?? 0,
  };
}

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

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const results: { platform: string; success: boolean; error?: string }[] = [];

    // LeetCode
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
    } catch (err: unknown) {
      const lcError = err instanceof Error ? err.message : String(err);
      // Upsert a clean initial state (0 solved) so card displays on homepage
      const defaultStats = {
        solved: 0,
        easy: [0, 960],
        medium: [0, 2100],
        hard: [0, 967],
        acceptance_rate: 0,
      };
      await supabase.from("coding_stats_cache").upsert({
        platform: "leetcode",
        handle: LC_HANDLE,
        profile_url: `https://leetcode.com/u/${LC_HANDLE}`,
        stats: defaultStats,
        last_synced_at: new Date().toISOString(),
        last_error: lcError,
      });
      await supabase.from("sync_log").insert({ source: "leetcode-sync", target_id: "leetcode", success: false, message: lcError });
      results.push({ platform: "leetcode", success: false, error: lcError });
    }

    // Codeforces
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
    } catch (err: unknown) {
      const cfError = err instanceof Error ? err.message : String(err);
      const defaultStats = {
        rating: 0,
        max_rating: 0,
        rank: "unranked",
        contests: 0,
      };
      await supabase.from("coding_stats_cache").upsert({
        platform: "codeforces",
        handle: CF_HANDLE,
        profile_url: `https://codeforces.com/profile/${CF_HANDLE}`,
        stats: defaultStats,
        last_synced_at: new Date().toISOString(),
        last_error: cfError,
      });
      await supabase.from("sync_log").insert({ source: "codeforces-sync", target_id: "codeforces", success: false, message: cfError });
      results.push({ platform: "codeforces", success: false, error: cfError });
    }

    const allOk = results.every((r) => r.success);
    return NextResponse.json({
      message: allOk ? "All sources synced" : "Partial sync — see results",
      results,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
