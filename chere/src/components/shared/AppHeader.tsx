"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCreationStore } from "@/stores/creation-store";

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isWizardPage = pathname?.startsWith("/create");
  const saveStatus = useCreationStore((s) => s.saveStatus);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setDisplayName(
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          user.email?.split("@")[0] ??
          null
        );
      }
    });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  const saveLabel =
    saveStatus === "saving" ? "Saving..." :
    saveStatus === "saved" ? "Saved ✓" :
    saveStatus === "error" ? "Save failed" :
    null;

  const saveLabelColor =
    saveStatus === "saved" ? "var(--color-sage-green)" :
    saveStatus === "error" ? "var(--color-error)" :
    "var(--color-warm-gray)";

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: "56px",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          backgroundColor: "rgba(245, 240, 235, 0.92)",
          borderBottom: "1px solid var(--color-parchment)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.5rem",
        }}
      >
        {/* Left: Logo + save indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link
            href="/dashboard"
            className="font-serif text-xl"
            style={{ color: "var(--color-espresso)" }}
          >
            Chère
          </Link>
          {isWizardPage && saveLabel && (
            <span style={{ fontSize: "0.75rem", color: saveLabelColor, transition: "color 0.3s" }}>
              {saveLabel}
            </span>
          )}
        </div>

        {/* Right: Desktop */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }} className="hidden md:flex">
          {!isWizardPage && (
            <Link
              href="/create"
              className="btn-gold text-sm"
              style={{ padding: "0.4rem 1rem" }}
            >
              Create
            </Link>
          )}

          {/* Profile dropdown */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.875rem",
                color: "var(--color-stone)",
                cursor: "pointer",
              }}
            >
              <span>{displayName ?? "Account"}</span>
              <span style={{ fontSize: "0.55rem", opacity: 0.6 }}>{dropdownOpen ? "▲" : "▼"}</span>
            </button>

            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 0.625rem)",
                  right: 0,
                  minWidth: "180px",
                  backgroundColor: "var(--color-cream)",
                  border: "1px solid var(--color-parchment)",
                  borderRadius: "0.75rem",
                  boxShadow: "0 8px 24px rgba(42,36,32,0.14)",
                  overflow: "hidden",
                  zIndex: 60,
                }}
              >
                {[
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "Occasions", href: "/dashboard/occasions" },
                  { label: "Settings", href: "/dashboard/settings" },
                ].map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: "block",
                      padding: "0.625rem 1rem",
                      fontSize: "0.875rem",
                      color: "var(--color-espresso)",
                    }}
                    className="hover:bg-parchment transition-colors duration-150"
                  >
                    {label}
                  </Link>
                ))}
                <div style={{ height: "1px", backgroundColor: "var(--color-parchment)", margin: "0.25rem 0" }} />
                <button
                  onClick={handleSignOut}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "0.625rem 1rem",
                    fontSize: "0.875rem",
                    color: "var(--color-warm-gray)",
                  }}
                  className="hover:text-espresso transition-colors duration-150"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen((o) => !o)}
          aria-label="Open menu"
          style={{ color: "var(--color-espresso)", fontSize: "1.25rem", lineHeight: 1 }}
        >
          ☰
        </button>
      </header>

      {/* Mobile slide-out menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 70,
              backgroundColor: "rgba(42,36,32,0.3)",
            }}
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Panel */}
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "260px",
              backgroundColor: "var(--color-cream)",
              borderLeft: "1px solid var(--color-parchment)",
              boxShadow: "-4px 0 24px rgba(42,36,32,0.14)",
              zIndex: 80,
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
            }}
          >
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{ alignSelf: "flex-end", fontSize: "1.25rem", color: "var(--color-stone)" }}
              aria-label="Close menu"
            >
              ✕
            </button>
            {[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Create", href: "/create" },
              { label: "Occasions", href: "/dashboard/occasions" },
              { label: "Settings", href: "/dashboard/settings" },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: "1.125rem",
                  fontFamily: "var(--font-serif)",
                  color: "var(--color-espresso)",
                }}
              >
                {label}
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              style={{
                marginTop: "auto",
                fontSize: "0.875rem",
                color: "var(--color-warm-gray)",
                textAlign: "left",
              }}
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </>
  );
}
