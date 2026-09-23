"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div><h1 className="font-serif text-4xl">Algo salió mal.</h1><p className="mt-4">Intenta de nuevo en un momento.</p><button className="mt-6 rounded-full bg-neutral-900 px-6 py-3 text-white" onClick={reset}>Reintentar</button></div>
    </main>
  );
}
