"use client";

import { useEffect, useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import Link from "next/link";
import ScrollytellingRenderer from "@/components/tribute/ScrollytellingRenderer";
import { mockCreation } from "@/lib/mock/tribute-data";

const occasions = [
  { label: "For Dad", emoji: "🤍", href: "/create?for=dad", badge: "Father's Day — June 15" },
  { label: "For Mom", emoji: "🤍", href: "/create?for=mom" },
  { label: "For My Partner", emoji: "🤍", href: "/create?for=partner" },
  { label: "A Gift Reveal", emoji: "✨", href: "/create?type=gift_reveal" },
  { label: "For My Pet", emoji: "🐾", href: "/create?for=pet" },
  { label: "Something Else", emoji: "🤍", href: "/create" },
];

const socialProof = [
  {
    quote: "I cried for twenty minutes. My mom called me four times after she opened it.",
    author: "Priya, gifted to her mother",
  },
  {
    quote: "He doesn't cry. He cried.",
    author: "Megan, gifted to her husband",
  },
  {
    quote: "I've never felt so seen. It was like she'd saved every memory I thought I'd forgotten.",
    author: "Thomas, received from his daughter",
  },
];

const pricingPlans = [
  {
    tier: "Free",
    price: "$0",
    desc: "Try it out",
    features: ["5 photos", "7-day link", "Scrollytelling format", "Chère watermark"],
    highlight: false,
  },
  {
    tier: "Standard",
    price: "$19",
    desc: "Most popular",
    features: ["Unlimited photos", "1-year link", "All 3 formats", "No watermark"],
    highlight: true,
  },
  {
    tier: "Premium",
    price: "$39",
    desc: "Forever",
    features: ["Unlimited photos", "Permanent link", "All formats", "Storybook"],
    highlight: false,
  },
  {
    tier: "Deluxe",
    price: "$79",
    desc: "Everything",
    features: ["Everything in Premium", "Background music", "Multiple recipients", "Priority support"],
    highlight: false,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  }),
};

const DEMO_TMPL = { bg: "#F5F0EB", accent: "#C4A97D" };
const FATHERS_DAY = new Date("2026-06-15");

export default function HomePage() {
  const [daysUntil, setDaysUntil] = useState<number | null>(null);

  useEffect(() => {
    const today = new Date();
    const diff = Math.ceil((FATHERS_DAY.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff > 0 && diff <= 45) setDaysUntil(diff);
  }, []);

  return (
    <main className="min-h-screen bg-linen texture-linen">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/chere-favicon.svg" alt="" aria-hidden="true" width={32} height={32} className="rounded-full" />
          <span className="font-serif text-2xl text-espresso tracking-wide">Chère</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="#pricing" className="text-sm text-stone hover:text-espresso transition-colors duration-300">
            Pricing
          </Link>
          <Link href="/login" className="text-sm text-stone hover:text-espresso transition-colors duration-300">
            Sign in
          </Link>
        </div>
      </nav>

      {/* Father's Day urgency banner */}
      {daysUntil !== null && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-2.5 px-6 py-2.5"
          style={{ backgroundColor: "var(--color-cream)", borderBottom: "1px solid var(--color-parchment)" }}
        >
          <motion.span
            animate={{ opacity: [1, 0.35, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "var(--color-muted-gold)",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          <p className="text-sm" style={{ color: "var(--color-muted-gold)" }}>
            Father&apos;s Day is June 15 — {daysUntil} day{daysUntil !== 1 ? "s" : ""} to make something he&apos;ll never forget.{" "}
            <Link href="/create?for=dad" style={{ textDecoration: "underline", textUnderlineOffset: "3px" }}>
              Start now →
            </Link>
          </p>
        </motion.div>
      )}

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 pt-16 pb-24 md:pt-24 md:pb-32 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-sm text-muted-gold font-sans tracking-[0.2em] uppercase mb-6"
        >
          A gift they&apos;ll cherish forever
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="font-serif text-4xl md:text-5xl lg:text-6xl text-espresso max-w-3xl leading-[1.15] mb-8"
        >
          Turn your love into
          <br />
          something they can open
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-stone text-lg md:text-xl max-w-xl mb-12 leading-relaxed"
        >
          Upload photos, answer a few heartfelt questions, and we&apos;ll craft a
          beautiful digital gift they&apos;ll keep forever.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Link href="/create" className="btn-gold text-base px-8 py-4">
            Create a Chère
          </Link>
        </motion.div>
      </section>

      {/* Demo tribute section */}
      <section className="bg-cream px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">
          {/* Phone frame */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="flex-shrink-0"
            style={{ width: "260px" }}
          >
            <div
              className="rounded-[2.5rem] overflow-hidden"
              style={{
                padding: "3px",
                background: "linear-gradient(135deg, #D4B896 0%, #C4A97D 50%, #A08060 100%)",
                boxShadow: "0 32px 64px rgba(42,36,32,0.2), 0 8px 16px rgba(42,36,32,0.1)",
              }}
            >
              <div className="rounded-[2.25rem] overflow-hidden" style={{ backgroundColor: DEMO_TMPL.bg }}>
                {/* Status bar stub */}
                <div
                  className="flex items-center justify-between px-5 pt-4 pb-2"
                  style={{ backgroundColor: DEMO_TMPL.bg }}
                >
                  <span style={{ fontSize: "9px", color: DEMO_TMPL.accent, fontVariantNumeric: "tabular-nums" }}>9:41</span>
                  <div className="rounded-full" style={{ width: "70px", height: "16px", backgroundColor: `${DEMO_TMPL.accent}15` }} />
                  <div className="flex gap-0.5 items-end">
                    {[3, 5, 7].map((h, i) => (
                      <div key={i} className="rounded-sm" style={{ width: "3px", height: `${h}px`, backgroundColor: DEMO_TMPL.accent }} />
                    ))}
                  </div>
                </div>
                {/* Scaled renderer */}
                <div style={{ overflow: "hidden", height: "460px", position: "relative", backgroundColor: DEMO_TMPL.bg }}>
                  <MotionConfig reducedMotion="always">
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "154%",
                        transform: "scale(0.65)",
                        transformOrigin: "top left",
                      }}
                    >
                      <ScrollytellingRenderer creation={mockCreation} />
                    </div>
                  </MotionConfig>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Text */}
          <div className="flex flex-col gap-5 text-center md:text-left">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-sm text-muted-gold font-sans tracking-[0.18em] uppercase"
            >
              See it in action
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-serif text-3xl md:text-4xl text-espresso leading-snug"
            >
              A tribute so personal,
              <br />
              it reads like a love letter
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-stone leading-relaxed max-w-md"
            >
              Your memories, your words, your photos — woven into a beautiful experience
              they can open on any device. Not a card. Not a slideshow. Something that
              feels like you.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link href="/create" className="btn-gold text-sm px-7 py-3.5 inline-block">
                Make yours free
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="divider" />

      {/* Occasions */}
      <section className="px-6 md:px-12 pb-24 md:pb-32 pt-16">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center text-sm text-stone tracking-[0.15em] uppercase mb-12"
        >
          Who is this for?
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {occasions.map((occasion, i) => (
            <motion.div
              key={occasion.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <Link
                href={occasion.href}
                className="card flex flex-col items-center justify-center py-8 px-4 text-center group cursor-pointer relative"
              >
                {occasion.badge && (
                  <span
                    className="absolute top-3 right-3 rounded-full px-2 py-0.5"
                    style={{
                      backgroundColor: "var(--color-muted-gold)",
                      color: "white",
                      fontSize: "0.625rem",
                      fontFamily: "var(--font-sans)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {occasion.badge}
                  </span>
                )}
                <span className="text-2xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {occasion.emoji}
                </span>
                <span className="font-serif text-lg text-charcoal">{occasion.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-cream px-6 md:px-12 py-24 md:py-32">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-serif text-3xl md:text-4xl text-espresso text-center mb-16"
        >
          Three steps. One gift they&apos;ll never forget.
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
          {[
            {
              step: "01",
              title: "Share your memories",
              description:
                "Answer a few warm, guided questions about your loved one. We'll ask about the meals, the moments, the inside jokes — the things that make your bond yours.",
            },
            {
              step: "02",
              title: "Add your photos",
              description:
                "Upload the pictures that tell your story. Birthday mornings, kitchen chaos, that one vacation photo everyone argues about — the real ones.",
            },
            {
              step: "03",
              title: "Send your gift",
              description:
                "We'll weave your words and photos into a beautiful, immersive digital experience. Send it by email, text, or QR code — and watch them open it.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center"
            >
              <span className="text-sm text-muted-gold font-sans tracking-[0.2em]">{item.step}</span>
              <h3 className="font-serif text-xl text-espresso mt-3 mb-4">{item.title}</h3>
              <p className="text-stone leading-relaxed text-sm">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="px-6 md:px-12 py-24 md:py-32">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center text-sm text-stone tracking-[0.15em] uppercase mb-12"
        >
          What people are saying
        </motion.p>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {socialProof.map((item, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="rounded-2xl p-7"
              style={{
                backgroundColor: "var(--color-cream)",
                border: "1px solid var(--color-parchment)",
              }}
            >
              <p
                className="font-serif italic leading-relaxed mb-4"
                style={{ fontSize: "1.0625rem", color: "var(--color-charcoal)" }}
              >
                &ldquo;{item.quote}&rdquo;
              </p>
              <p className="text-xs" style={{ color: "var(--color-warm-gray)" }}>
                — {item.author}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-cream px-6 md:px-12 py-24 md:py-32">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-serif text-3xl md:text-4xl text-espresso text-center mb-4"
        >
          Simple, honest pricing
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-stone text-center mb-16 max-w-sm mx-auto leading-relaxed"
        >
          Start free. Upgrade when it matters.
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {pricingPlans.map((plan, i) => (
            <motion.div
              key={plan.tier}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="rounded-2xl p-6 flex flex-col"
              style={{
                backgroundColor: plan.highlight ? "var(--color-espresso)" : "var(--color-linen)",
                border: plan.highlight ? "none" : "1px solid var(--color-parchment)",
                boxShadow: plan.highlight ? "0 16px 40px rgba(42,36,32,0.18)" : undefined,
              }}
            >
              <p
                className="text-xs font-sans tracking-[0.12em] uppercase mb-1"
                style={{ color: plan.highlight ? "var(--color-muted-gold)" : "var(--color-warm-gray)" }}
              >
                {plan.tier}
              </p>
              <p
                className="font-serif text-3xl mb-1"
                style={{ color: plan.highlight ? "var(--color-cream)" : "var(--color-espresso)" }}
              >
                {plan.price}
              </p>
              <p
                className="text-xs mb-5"
                style={{ color: plan.highlight ? "var(--color-parchment)" : "var(--color-stone)" }}
              >
                {plan.desc}
              </p>
              <ul className="flex flex-col gap-2 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="text-sm flex items-start gap-2"
                    style={{ color: plan.highlight ? "var(--color-cream)" : "var(--color-charcoal)" }}
                  >
                    <span style={{ color: "var(--color-muted-gold)", flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/create"
                className="text-center text-sm py-2.5 rounded-xl transition-all duration-200"
                style={
                  plan.highlight
                    ? { backgroundColor: "var(--color-muted-gold)", color: "white" }
                    : { backgroundColor: "var(--color-parchment)", color: "var(--color-espresso)" }
                }
              >
                {plan.tier === "Free" ? "Start free" : `Choose ${plan.tier}`}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Emotional pull */}
      <section className="px-6 md:px-12 py-24 md:py-32 text-center">
        <motion.blockquote
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="font-serif text-2xl md:text-3xl text-charcoal max-w-2xl mx-auto italic leading-relaxed"
        >
          &ldquo;The best gift isn&apos;t something you buy.
          <br />
          It&apos;s something you remember.&rdquo;
        </motion.blockquote>
        <div className="divider" />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Link href="/create" className="btn-primary text-base px-8 py-4">
            Start creating
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-parchment px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-serif text-lg text-charcoal">Chère</span>
        <div className="flex items-center gap-6">
          <Link href="#" className="text-xs text-warm-gray hover:text-stone transition-colors duration-300">
            About
          </Link>
          <Link href="#pricing" className="text-xs text-warm-gray hover:text-stone transition-colors duration-300">
            Pricing
          </Link>
          <Link
            href="mailto:hello@chere.app"
            className="text-xs text-warm-gray hover:text-stone transition-colors duration-300"
          >
            Contact
          </Link>
        </div>
        <p className="text-xs text-warm-gray">Made with love. © {new Date().getFullYear()} Studio Nord LLC.</p>
      </footer>
    </main>
  );
}
