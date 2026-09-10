import { NextResponse } from "next/server";
import { supabasePublic } from "@/lib/supabase";

// Public — used by the homepage widget.
export async function GET() {
  const { data: settings, error: settingsError } = await supabasePublic
    .from("settings")
    .select("current_idea_id")
    .eq("id", 1)
    .single();

  if (settingsError) return NextResponse.json({ error: settingsError.message }, { status: 500 });

  if (!settings?.current_idea_id) {
    return NextResponse.json({ idea: null });
  }

  const { data: idea, error: ideaError } = await supabasePublic
    .from("ideas")
    .select("*")
    .eq("id", settings.current_idea_id)
    .single();

  if (ideaError) return NextResponse.json({ error: ideaError.message }, { status: 500 });

  const { data: lastSpin } = await supabasePublic
    .from("spins")
    .select("spun_at")
    .eq("idea_id", idea.id)
    .order("spun_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ idea, spunAt: lastSpin?.spun_at ?? null });
}
