import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "var(--color-linen)" }}
    >
      <p
        className="font-serif mb-2"
        style={{ fontSize: "5rem", color: "var(--color-parchment)", lineHeight: 1 }}
      >
        404
      </p>
      <h1
        className="font-serif text-2xl mb-3"
        style={{ color: "var(--color-espresso)" }}
      >
        This page doesn&apos;t exist.
      </h1>
      <p className="mb-10 leading-relaxed" style={{ color: "var(--color-stone)" }}>
        But you could make something that does.
      </p>
      <Link href="/create" className="btn-gold px-8 py-3">
        Create a Chère
      </Link>
    </main>
  );
}
