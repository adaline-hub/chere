"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const occasions = [
  { label: "For Mom", emoji: "🤍", href: "/create?for=mom" },
  { label: "For Dad", emoji: "🤍", href: "/create?for=dad" },
  { label: "For My Partner", emoji: "🤍", href: "/create?for=partner" },
  { label: "For My Pet", emoji: "🐾", href: "/create?for=pet" },
  { label: "A Gift Reveal", emoji: "✨", href: "/create?type=gift_reveal" },
  { label: "Something Else", emoji: "🤍", href: "/create" },
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

export default function HomePage() {
  return (
    <main className="min-h-screen bg-linen texture-linen">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6">
        <Link href="/" className="font-serif text-2xl text-espresso tracking-wide">
          Chère
        </Link>
        <Link
          href="/login"
          className="text-sm text-stone hover:text-espresso transition-colors duration-300"
        >
          Sign in
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 pt-16 pb-24 md:pt-24 md:pb-32 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-sm text-muted-gold font-sans tracking-[0.2em] uppercase mb-6"
        >
          A gift they&apos;ll never forget
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

      {/* Divider */}
      <div className="divider" />

      {/* Occasions */}
      <section className="px-6 md:px-12 pb-24 md:pb-32">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center text-sm text-stone tracking-[0.15em] uppercase mb-12"
        >
          Who is this for?
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
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
                className="card flex flex-col items-center justify-center py-8 px-4
                           text-center group cursor-pointer"
              >
                <span className="text-2xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {occasion.emoji}
                </span>
                <span className="font-serif text-lg text-charcoal">
                  {occasion.label}
                </span>
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
              <span className="text-sm text-muted-gold font-sans tracking-[0.2em]">
                {item.step}
              </span>
              <h3 className="font-serif text-xl text-espresso mt-3 mb-4">
                {item.title}
              </h3>
              <p className="text-stone leading-relaxed text-sm">
                {item.description}
              </p>
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
        <p className="text-xs text-warm-gray">
          Made with love. © {new Date().getFullYear()} Studio Nord LLC.
        </p>
      </footer>
    </main>
  );
}
