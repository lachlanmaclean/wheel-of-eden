import { NextResponse } from "next/server";
import { supabasePublic } from "@/lib/supabase";

// Public — powers the read-only dashboard wheel: the full active idea list
// plus which one is currently picked, so everyone sees the same result the
// admin last spun.
export async function GET() {
  const { data: ideas, error: ideasError } = await supabasePublic
    .from("ideas")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (ideasError) return NextResponse.json({ error: ideasError.message }, { status: 500 });

  const { data: settings, error: settingsError } = await supabasePublic
    .from("settings")
    .select("current_idea_id")
    .eq("id", 1)
    .single();

  if (settingsError) return NextResponse.json({ error: settingsError.message }, { status: 500 });

  return NextResponse.json({ ideas, currentIdeaId: settings?.current_idea_id ?? null });
}
