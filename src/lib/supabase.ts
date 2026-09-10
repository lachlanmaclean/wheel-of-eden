import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-safe, read-only (RLS enforces public select-only access).
export const supabasePublic = createClient(supabaseUrl, publishableKey);

// Server-only. Bypasses RLS — never import this from client components.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export type Idea = {
  id: string;
  text: string;
  status: "active" | "completed" | "archived";
  created_at: string;
};
