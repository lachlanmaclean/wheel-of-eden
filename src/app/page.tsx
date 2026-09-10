import PublicWheel from "@/components/PublicWheel";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-neutral-950 px-4 py-10 text-neutral-100">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold">Wheel of Eden</h1>
        <p className="mt-1 text-neutral-500">Minecraft server dashboard</p>
      </header>

      <PublicWheel />
    </main>
  );
}
