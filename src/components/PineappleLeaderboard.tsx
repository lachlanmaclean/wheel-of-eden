"use client";

import { useEffect, useState } from "react";
import type { Member } from "@/lib/supabase";

export default function PineappleLeaderboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const res = await fetch("/api/members");
    const data = await res.json();
    if (res.ok) setMembers(data.members);
    setLoading(false);
  }

  async function increment(id: string) {
    if (pendingId) return;
    setPendingId(id);
    setMembers((prev) =>
      prev
        .map((m) => (m.id === id ? { ...m, pineapple_count: m.pineapple_count + 1 } : m))
        .sort((a, b) => b.pineapple_count - a.pineapple_count || a.name.localeCompare(b.name))
    );
    await fetch(`/api/members/${id}/increment`, { method: "POST" });
    setPendingId(null);
    refresh();
  }

  const total = members.reduce((sum, m) => sum + m.pineapple_count, 0);

  return (
    <div className="rounded-2xl border-4 border-wood-darker bg-wood p-5 shadow-lg sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🍍</span>
          <h2 className="font-pixel text-xs text-parchment sm:text-sm">Pineapple Leaderboard</h2>
        </div>
        <span className="rounded-full border-2 border-wood-darker bg-parchment px-3 py-1 text-xs font-semibold text-ink">
          {total} total
        </span>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-parchment-dark">Loading...</p>
      ) : members.length === 0 ? (
        <p className="py-8 text-center text-sm text-parchment-dark">No members yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {members.map((member, i) => (
            <li
              key={member.id}
              className="flex items-center gap-3 rounded-lg border-2 border-wood-darker bg-parchment px-3 py-2.5"
            >
              <span className="w-4 text-sm text-ink/50">{i + 1}</span>
              <span
                className="h-5 w-5 flex-shrink-0 rounded border-2 border-wood-darker"
                style={{ backgroundColor: member.color }}
              />
              <span className="flex-1 font-medium text-ink">{member.name}</span>
              <span className="text-sm font-semibold text-wood-dark">×{member.pineapple_count}</span>
              <button
                onClick={() => increment(member.id)}
                disabled={pendingId === member.id}
                className="rounded-md border-2 border-wood-darker bg-gold px-3 py-1 text-sm font-bold text-ink transition hover:brightness-105 disabled:opacity-50"
              >
                +1
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
