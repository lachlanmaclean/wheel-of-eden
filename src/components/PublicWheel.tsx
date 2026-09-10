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

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center text-neutral-500">
        Loading wheel...
      </div>
    );
  }

  if (ideas.length === 0) {
    return (
      <div className="flex min-h-[420px] items-center justify-center text-neutral-500">
        No active build ideas yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <IdeaWheel ideas={ideas} resultIndex={resultIndex} size={380} />
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Current Build Idea
        </p>
        <p className="mt-1 text-2xl font-bold text-emerald-400">
          {currentIdea ? currentIdea.text : "Not spun yet"}
        </p>
      </div>
    </div>
  );
}
