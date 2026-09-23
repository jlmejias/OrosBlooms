import Link from "next/link";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center px-6 text-center"><div><h1 className="font-serif text-4xl">Página no encontrada.</h1><Link className="mt-6 inline-block underline" href="/">Volver al inicio</Link></div></main>;
}
