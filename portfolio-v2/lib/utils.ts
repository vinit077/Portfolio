/** Convert a repo name like "enterprise-leave-portal" → "Enterprise Leave Portal" */
export function humanizeRepoName(name: string): string {
  return name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Kebab-case a string for use as a URL slug */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Format a relative time string: "3h ago", "2d ago" */
export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 2) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

/** Extract the first meaningful paragraph from a README (strip markdown) */
export function extractReadmeExcerpt(raw: string): string {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.length > 20 &&
        !l.startsWith("#") &&
        !l.startsWith("!") &&
        !l.startsWith("|") &&
        !l.startsWith("```") &&
        !l.startsWith("<!--")
    );
  const first = lines[0] ?? "";
  // Strip inline markdown: **bold**, _italic_, `code`, [link](url)
  return first
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .slice(0, 200);
}

export type LeetCodeStats = {
  solved: number;
  easy: [number, number];
  medium: [number, number];
  hard: [number, number];
  acceptance_rate: number;
};

export type CodeforcesStats = {
  rating: number;
  max_rating: number;
  rank: string;
  contests: number;
};

export type CodingStatsRow = {
  platform: "leetcode" | "codeforces";
  handle: string;
  profile_url: string;
  stats: LeetCodeStats | CodeforcesStats;
  last_synced_at: string;
  last_error: string | null;
};

export type Project = {
  id: string;
  slug: string;
  repo_url: string;
  repo_owner: string;
  repo_name: string;
  title: string;
  description: string;
  tags: string[];
  stars: number;
  primary_lang: string | null;
  method_badge: string;
  status_code: number;
  sort_order: number;
  published: boolean;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
};
