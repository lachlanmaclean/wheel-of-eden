"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import type { Idea, Member } from "@/lib/supabase";
import IdeaWheel from "@/components/IdeaWheel";

const MEMBER_COLORS = [
  "#8fc1d1", "#e0b23c", "#a8a8a4", "#9dc36b",
  "#6a8f3d", "#c9926a", "#8a8580", "#8a5a34",
];

export default function AdminPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [newIdea, setNewIdea] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [newMember, setNewMember] = useState("");
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [resultIndex, setResultIndex] = useState<number | null>(null);
  const [pendingWinner, setPendingWinner] = useState<Idea | null>(null);
  const [winner, setWinner] = useState<Idea | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentIdea, setCurrentIdea] = useState<Idea | null>(null);
  const [clearing, setClearing] = useState(false);

  const activeIdeas = ideas.filter((i) => i.status === "active");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [ideasData, currentData, membersData] = await Promise.all([
        fetch("/api/ideas").then((r) => r.json()),
        fetch("/api/current-idea").then((r) => r.json()),
        fetch("/api/members").then((r) => r.json()),
      ]);
      const allIdeas: Idea[] = ideasData.ideas ?? [];
      setIdeas(allIdeas);
      setCurrentIdea(currentData.idea ?? null);
      setMembers(membersData.members ?? []);
      if (currentData.idea) {
        const active = allIdeas.filter((i) => i.status === "active");
        const idx = active.findIndex((i) => i.id === currentData.idea.id);
        setResultIndex(idx === -1 ? null : idx);
      }
      setLoading(false);
    })();
  }, []);

  async function refreshIdeas() {
    const res = await fetch("/api/ideas");
    const data = await res.json();
    if (res.ok) setIdeas(data.ideas);
  }

  async function clearCurrentIdea() {
    setClearing(true);
    await fetch("/api/current-idea/clear", { method: "POST" });
    setCurrentIdea(null);
    setResultIndex(null);
    setWinner(null);
    setClearing(false);
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
      refreshIdeas();
    }
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/ideas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    refreshIdeas();
  }

  async function deleteIdea(id: string) {
    await fetch(`/api/ideas/${id}`, { method: "DELETE" });
    refreshIdeas();
  }

  async function refreshMembers() {
    const res = await fetch("/api/members");
    const data = await res.json();
    if (res.ok) setMembers(data.members);
  }

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    if (!newMember.trim()) return;
    const color = MEMBER_COLORS[members.length % MEMBER_COLORS.length];
    const res = await fetch("/api/admin/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newMember.trim(), color }),
    });
    if (res.ok) {
      setNewMember("");
      refreshMembers();
    }
  }

  async function deleteMember(id: string) {
    await fetch(`/api/admin/members/${id}`, { method: "DELETE" });
    refreshMembers();
  }

  async function adjustPineappleCount(member: Member, delta: number) {
    const pineapple_count = Math.max(0, member.pineapple_count + delta);
    setMembers((prev) =>
      prev.map((m) => (m.id === member.id ? { ...m, pineapple_count } : m))
    );
    await fetch(`/api/admin/members/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pineapple_count }),
    });
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
    const idx = activeIdeas.findIndex((i) => i.id === data.winner.id);
    setPendingWinner(data.winner);
    setResultIndex(idx === -1 ? 0 : idx);
    setSpinning(true);
  }

  function handleDoneAnimating() {
    setSpinning(false);
    setWinner(pendingWinner);
    setCurrentIdea(pendingWinner);
    setPendingWinner(null);
    refreshIdeas();
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
    });
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-sky text-ink">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-sky">
      <header className="border-b-4 border-wood-darker bg-wood px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-parchment-dark underline hover:text-parchment">
              ← Dashboard
            </Link>
            <h1 className="font-pixel text-xs text-parchment sm:text-sm">Eden — Admin</h1>
          </div>
          <button
            onClick={logout}
            className="text-sm text-parchment-dark underline hover:text-parchment"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-8">
        <section className="flex items-center justify-between gap-4 rounded-2xl border-4 border-wood-darker bg-wood p-6 shadow-lg">
          <div>
            <h2 className="text-xs font-medium uppercase tracking-wide text-parchment-dark">
              Current Dashboard Idea
            </h2>
            <p className="mt-1 text-lg font-semibold text-parchment">
              {currentIdea ? currentIdea.text : "None"}
            </p>
          </div>
          <button
            onClick={clearCurrentIdea}
            disabled={!currentIdea || clearing}
            className="rounded-lg border-2 border-wood-darker bg-parchment px-4 py-2 text-sm font-medium text-ink transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {clearing ? "Clearing..." : "Clear"}
          </button>
        </section>

        <section className="flex flex-col items-center gap-4 rounded-2xl border-4 border-wood-darker bg-wood p-8 shadow-lg">
          {activeIdeas.length > 0 ? (
            <IdeaWheel
              ideas={activeIdeas}
              spinning={spinning}
              resultIndex={resultIndex}
              onDoneAnimating={handleDoneAnimating}
            />
          ) : (
            <p className="py-16 text-parchment-dark">Add at least one active idea to spin.</p>
          )}
          <button
            onClick={spin}
            disabled={spinning || activeIdeas.length === 0}
            className="rounded-lg border-2 border-wood-darker bg-navy px-6 py-2.5 font-semibold text-parchment transition hover:brightness-125 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {spinning ? "Spinning..." : "Spin the Wheel"}
          </button>
          {error && <p className="text-sm text-red-200">{error}</p>}
          {winner && (
            <p className="text-center text-lg text-parchment">
              🎉 Winner: <span className="font-semibold">{winner.text}</span>
            </p>
          )}
        </section>

        <section className="rounded-2xl border-4 border-wood-darker bg-wood p-6 shadow-lg">
          <h2 className="mb-4 font-pixel text-xs text-parchment">Manage Ideas</h2>
          <form onSubmit={addIdea} className="mb-6 flex gap-2">
            <input
              value={newIdea}
              onChange={(e) => setNewIdea(e.target.value)}
              placeholder="New build idea..."
              className="flex-1 rounded-lg border-2 border-wood-darker bg-parchment px-3 py-2 text-ink outline-none placeholder:text-ink/40 focus:brightness-95"
            />
            <button
              type="submit"
              className="rounded-lg border-2 border-wood-darker bg-gold px-4 py-2 font-semibold text-ink hover:brightness-105"
            >
              Add
            </button>
          </form>

          <ul className="flex flex-col gap-2">
            {ideas.map((idea) => (
              <li
                key={idea.id}
                className="flex items-center justify-between gap-3 rounded-lg border-2 border-wood-darker bg-parchment px-4 py-2.5"
              >
                <span
                  className={idea.status === "active" ? "text-ink" : "text-ink/40 line-through"}
                >
                  {idea.text}
                </span>
                <div className="flex items-center gap-2 text-sm">
                  <select
                    value={idea.status}
                    onChange={(e) => updateStatus(idea.id, e.target.value)}
                    className="rounded-md border-2 border-wood-darker bg-parchment-dark px-2 py-1 text-xs text-ink"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                  <button
                    onClick={() => deleteIdea(idea.id)}
                    className="text-ink/50 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {ideas.length === 0 && (
              <p className="text-sm text-parchment-dark">No ideas yet — add one above.</p>
            )}
          </ul>
        </section>

        <section className="rounded-2xl border-4 border-wood-darker bg-wood p-6 shadow-lg">
          <h2 className="mb-4 font-pixel text-xs text-parchment">Manage Members</h2>
          <form onSubmit={addMember} className="mb-6 flex gap-2">
            <input
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              placeholder="New member name..."
              className="flex-1 rounded-lg border-2 border-wood-darker bg-parchment px-3 py-2 text-ink outline-none placeholder:text-ink/40 focus:brightness-95"
            />
            <button
              type="submit"
              className="rounded-lg border-2 border-wood-darker bg-gold px-4 py-2 font-semibold text-ink hover:brightness-105"
            >
              Add
            </button>
          </form>

          <ul className="flex flex-col gap-2">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between gap-3 rounded-lg border-2 border-wood-darker bg-parchment px-4 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-4 w-4 rounded-full border-2 border-wood-darker"
                    style={{ backgroundColor: member.color }}
                  />
                  <span className="text-ink">{member.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjustPineappleCount(member, -1)}
                    disabled={member.pineapple_count === 0}
                    className="h-7 w-7 rounded-md border-2 border-wood-darker bg-parchment-dark font-bold text-ink hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-wood-dark">
                    ×{member.pineapple_count}
                  </span>
                  <button
                    onClick={() => adjustPineappleCount(member, 1)}
                    className="h-7 w-7 rounded-md border-2 border-wood-darker bg-gold font-bold text-ink hover:brightness-105"
                  >
                    +
                  </button>
                  <button
                    onClick={() => deleteMember(member.id)}
                    className="ml-2 text-sm text-ink/50 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {members.length === 0 && (
              <p className="text-sm text-parchment-dark">No members yet — add one above.</p>
            )}
          </ul>
        </section>
      </div>
    </main>
  );
}
