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
            <h1 className="font-pixel text-sm text-parchment sm:text-base">Eden</h1>
            <p className="text-xs text-parchment-dark">minecraft homepage</p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-8 lg:grid-cols-2">
        <PublicWheel />
        <PineappleLeaderboard />
      </div>

      <footer className="border-t-4 border-wood-darker bg-wood-dark px-4 py-3 text-center text-xs text-parchment-dark">
        &ldquo;The LORD God took the man and put him in the Garden of Eden to work it and take care of it.&rdquo; · Genesis 2:15
      </footer>
    </main>
  );
}
