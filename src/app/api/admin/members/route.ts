import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Admin-only (gated by proxy). Adds a new village member.
export async function POST(req: NextRequest) {
  const { name, color } = await req.json();

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("members")
    .insert({ name: name.trim(), color: typeof color === "string" ? color : "#a8a29e" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ member: data });
}
