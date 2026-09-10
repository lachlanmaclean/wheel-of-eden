import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Admin-only (gated by middleware). Clears the current idea from the
// dashboard widget without touching the ideas list or spin history.
export async function POST() {
  const { error } = await supabaseAdmin
    .from("settings")
    .update({ current_idea_id: null })
    .eq("id", 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
