import { NextResponse } from "next/server";
import { supabasePublic } from "@/lib/supabase";

// Public — powers the Pineapple Leaderboard.
export async function GET() {
  const { data, error } = await supabasePublic
    .from("members")
    .select("*")
    .order("pineapple_count", { ascending: false })
    .order("name", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ members: data });
}
