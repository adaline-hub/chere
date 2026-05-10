import Link from "next/link";

export default function DashboardPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: "var(--color-linen)" }}
    >
      <div className="text-center max-w-sm">
        <h1
          className="font-serif text-4xl mb-4"
          style={{ color: "var(--color-espresso)" }}
        >
          Your Chères
        </h1>
        <p className="text-stone mb-10 leading-relaxed">
          Nothing here yet — but soon.
        </p>
        <Link href="/create" className="btn-gold text-base px-8 py-4">
          Create your first Chère
        </Link>
      </div>
    </main>
  );
}
