import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}
