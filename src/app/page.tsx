import PublicWheel from "@/components/PublicWheel";
import PineappleLeaderboard from "@/components/PineappleLeaderboard";

export default function Home() {
  return (
    <main className="min-h-screen bg-sky">
      <header className="border-b-4 border-wood-darker bg-wood px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-wood-darker bg-grass text-lg">
            🌰
          </div>
          <div>
            <h1 className="font-pixel text-sm text-parchment sm:text-base">Acorn Hollow</h1>
            <p className="text-xs text-parchment-dark">village hall</p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-8 lg:grid-cols-2">
        <PublicWheel />
        <PineappleLeaderboard />
      </div>

      <footer className="border-t-4 border-wood-darker bg-wood-dark px-4 py-3 text-center text-xs text-parchment-dark">
        The Acorn Hollow · a private village · keep it cozy
      </footer>
    </main>
  );
}
