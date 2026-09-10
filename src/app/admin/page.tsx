"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Idea } from "@/lib/supabase";
import IdeaWheel from "@/components/IdeaWheel";

export default function AdminPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [newIdea, setNewIdea] = useState("");
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [pendingWinner, setPendingWinner] = useState<Idea | null>(null);
  const [winner, setWinner] = useState<Idea | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeIdeas = ideas.filter((i) => i.status === "active");

  useEffect(() => {
    loadIdeas();
  }, []);

  async function loadIdeas() {
    setLoading(true);
    const res = await fetch("/api/ideas");
    const data = await res.json();
    if (res.ok) setIdeas(data.ideas);
    setLoading(false);
  }

  async function addIdea(e: React.FormEvent) {
    e.preventDefault();
    if (!newIdea.trim()) return;
    const res = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newIdea.trim() }),
    });
    if (res.ok) {
      setNewIdea("");
      loadIdeas();
    }
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/ideas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadIdeas();
  }

  async function deleteIdea(id: string) {
    await fetch(`/api/ideas/${id}`, { method: "DELETE" });
    loadIdeas();
  }

  async function spin() {
    if (spinning || activeIdeas.length === 0) return;
    setError(null);
    setWinner(null);
    const res = await fetch("/api/spin", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Spin failed");
      return;
    }
    const idx = data.ideas.findIndex((i: Idea) => i.id === data.winner.id);
    setPendingWinner(data.winner);
    setTargetIndex(idx);
    setSpinning(true);
  }

  function handleDoneAnimating() {
    setSpinning(false);
    setTargetIndex(null);
    setWinner(pendingWinner);
    setPendingWinner(null);
    loadIdeas();
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-10 text-neutral-100">
      <div className="mx-auto flex max-w-4xl flex-col gap-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Idea Wheel — Admin</h1>
          <button
            onClick={logout}
            className="text-sm text-neutral-400 underline hover:text-neutral-200"
          >
            Log out
          </button>
        </div>

        <section className="flex flex-col items-center gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-8">
          {activeIdeas.length > 0 ? (
            <IdeaWheel
              ideas={activeIdeas}
              spinning={spinning}
              targetIndex={targetIndex}
              onDoneAnimating={handleDoneAnimating}
            />
          ) : (
            <p className="py-16 text-neutral-500">Add at least one active idea to spin.</p>
          )}
          <button
            onClick={spin}
            disabled={spinning || activeIdeas.length === 0}
            className="rounded-lg bg-emerald-600 px-6 py-2.5 font-medium transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {spinning ? "Spinning..." : "Spin the Wheel"}
          </button>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {winner && (
            <p className="text-center text-lg">
              🎉 Winner: <span className="font-semibold text-emerald-400">{winner.text}</span>
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="mb-4 text-lg font-semibold">Manage Ideas</h2>
          <form onSubmit={addIdea} className="mb-6 flex gap-2">
            <input
              value={newIdea}
              onChange={(e) => setNewIdea(e.target.value)}
              placeholder="New build idea..."
              className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-neutral-700 px-4 py-2 font-medium hover:bg-neutral-600"
            >
              Add
            </button>
          </form>

          <ul className="flex flex-col gap-2">
            {ideas.map((idea) => (
              <li
                key={idea.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2.5"
              >
                <span
                  className={
                    idea.status === "active" ? "text-neutral-100" : "text-neutral-500 line-through"
                  }
                >
                  {idea.text}
                </span>
                <div className="flex items-center gap-2 text-sm">
                  <select
                    value={idea.status}
                    onChange={(e) => updateStatus(idea.id, e.target.value)}
                    className="rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                  <button
                    onClick={() => deleteIdea(idea.id)}
                    className="text-neutral-500 hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {ideas.length === 0 && (
              <p className="text-sm text-neutral-500">No ideas yet — add one above.</p>
            )}
          </ul>
        </section>
      </div>
    </main>
  );
}
