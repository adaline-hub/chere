"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV_LINKS = [
  { href: "/dashboard", label: "My Chères", exact: true },
  { href: "/dashboard/occasions", label: "Occasions", exact: false },
  { href: "/dashboard/settings", label: "Settings", exact: false },
];

export default function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10"
      style={{
        height: "56px",
        backgroundColor: "var(--color-linen)",
        borderBottom: "1px solid var(--color-parchment)",
      }}
    >
      {/* Logo */}
      <Link
        href="/dashboard"
        className="font-serif text-xl"
        style={{ color: "var(--color-espresso)" }}
      >
        Chère
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-6">
        {NAV_LINKS.map(({ href, label, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className="text-sm relative pb-0.5 transition-colors duration-200"
              style={{
                color: active ? "var(--color-espresso)" : "var(--color-stone)",
                borderBottom: active ? "1px solid var(--color-muted-gold)" : "1px solid transparent",
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="text-xs transition-colors duration-200"
        style={{ color: "var(--color-warm-gray)" }}
        onMouseOver={(e) => (e.currentTarget.style.color = "var(--color-espresso)")}
        onMouseOut={(e) => (e.currentTarget.style.color = "var(--color-warm-gray)")}
      >
        Sign out
      </button>
    </nav>
  );
}
