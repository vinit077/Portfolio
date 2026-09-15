import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600; // Cache for 1 hour (stats change slowly)

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("coding_stats_cache")
      .select("*");

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch coding stats" },
      { status: 500 }
    );
  }
}
