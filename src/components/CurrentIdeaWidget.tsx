"use client";

import { useEffect, useState } from "react";
import type { Idea } from "@/lib/supabase";

export default function CurrentIdeaWidget() {
  const [idea, setIdea] = useState<Idea | null>(null);
  const [spunAt, setSpunAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/current-idea")
      .then((res) => res.json())
      .then((data) => {
        setIdea(data.idea);
        setSpunAt(data.spunAt);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-neutral-500">
        Current Build Idea
      </h2>
      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : idea ? (
        <>
          <p className="text-xl font-semibold text-emerald-400">{idea.text}</p>
          {spunAt && (
            <p className="mt-2 text-xs text-neutral-500">
              Spun on {new Date(spunAt).toLocaleDateString()}
            </p>
          )}
        </>
      ) : (
        <p className="text-neutral-500">No idea has been spun yet.</p>
      )}
    </div>
  );
}
