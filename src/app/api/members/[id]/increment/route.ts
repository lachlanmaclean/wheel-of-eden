import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Public — anyone at the village hall can log a pineapple, no PIN needed.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabaseAdmin.rpc("increment_pineapple", {
    member_id: id,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Member not found" }, { status: 404 });
  return NextResponse.json({ member: data });
}
