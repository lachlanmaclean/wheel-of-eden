"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import type { Idea } from "@/lib/supabase";
import IdeaWheel from "@/components/IdeaWheel";

const POLL_MS = 5000;

export default function PublicWheel() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [currentIdeaId, setCurrentIdeaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const loadedOnce = useRef(false);
  const prevIdeaId = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/wheel-state");
        const data = await res.json();
        if (cancelled || !res.ok) return;
        setIdeas(data.ideas ?? []);
        const nextId: string | null = data.currentIdeaId ?? null;
        // Only celebrate when the winner actually changes after the first
        // load — not on the initial fetch, which just reflects the last spin.
        if (loadedOnce.current && nextId && nextId !== prevIdeaId.current) {
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        }
        prevIdeaId.current = nextId;
        setCurrentIdeaId(nextId);
      } finally {
        if (!cancelled && !loadedOnce.current) {
          loadedOnce.current = true;
          setLoading(false);
        }
      }
    }

    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const resultIndex = currentIdeaId
    ? (() => {
        const idx = ideas.findIndex((i) => i.id === currentIdeaId);
        return idx === -1 ? null : idx;
      })()
    : null;
  const currentIdea = resultIndex !== null ? ideas[resultIndex] : null;

  return (
    <div className="rounded-2xl border-4 border-wood-darker bg-wood p-5 shadow-lg sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-pixel text-xs text-parchment sm:text-sm">Wheel of Builds</h2>
        <span className="rounded-full border-2 border-wood-darker bg-grass px-3 py-1 text-xs font-semibold text-parchment">
          spin day
        </span>
      </div>

      {loading ? (
        <div className="flex min-h-[340px] items-center justify-center text-parchment-dark">
          Loading wheel...
        </div>
      ) : ideas.length === 0 ? (
        <div className="flex min-h-[340px] items-center justify-center text-parchment-dark">
          No active build ideas yet.
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5">
          <IdeaWheel ideas={ideas} resultIndex={resultIndex} size={280} />
          <div className="flex w-full items-center justify-between rounded-lg border-2 border-wood-darker bg-parchment px-4 py-2.5">
            <span className="text-sm text-ink/60">Current build</span>
            <span className="font-semibold text-ink">
              {currentIdea ? currentIdea.text : "Not spun yet"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
