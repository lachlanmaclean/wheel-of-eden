import CurrentIdeaWidget from "@/components/CurrentIdeaWidget";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-10 text-neutral-100">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <header>
          <h1 className="text-3xl font-bold">Wheel of Eden</h1>
          <p className="mt-1 text-neutral-500">Minecraft server dashboard</p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CurrentIdeaWidget />
        </div>
      </div>
    </main>
  );
}
