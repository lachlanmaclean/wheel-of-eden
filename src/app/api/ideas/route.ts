import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Admin-only (gated by middleware) — lists all ideas for the manage page.
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("ideas")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ideas: data });
}

// POST is gated by middleware (admin-only).
export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Idea text is required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("ideas")
    .insert({ text: text.trim() })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ idea: data });
}
