import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Admin-only (gated by middleware). Picks a random active idea, sets it as
// the current idea, and logs the spin.
export async function POST() {
  const { data: activeIdeas, error: fetchError } = await supabaseAdmin
    .from("ideas")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (!activeIdeas || activeIdeas.length === 0) {
    return NextResponse.json({ error: "No active ideas to spin" }, { status: 400 });
  }

  const winner = activeIdeas[Math.floor(Math.random() * activeIdeas.length)];

  const { error: settingsError } = await supabaseAdmin
    .from("settings")
    .update({ current_idea_id: winner.id })
    .eq("id", 1);

  if (settingsError) return NextResponse.json({ error: settingsError.message }, { status: 500 });

  const { error: spinError } = await supabaseAdmin
    .from("spins")
    .insert({ idea_id: winner.id });

  if (spinError) return NextResponse.json({ error: spinError.message }, { status: 500 });

  // Return the full active list (in the order the wheel should render them)
  // plus the winner, so the client can animate to the correct wedge.
  return NextResponse.json({ ideas: activeIdeas, winner });
}
