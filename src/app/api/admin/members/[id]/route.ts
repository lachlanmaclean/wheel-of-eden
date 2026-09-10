import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Admin-only (gated by proxy).
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await supabaseAdmin.from("members").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { pineapple_count } = await req.json();

  if (typeof pineapple_count !== "number" || pineapple_count < 0) {
    return NextResponse.json({ error: "Invalid pineapple_count" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("members")
    .update({ pineapple_count })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ member: data });
}
