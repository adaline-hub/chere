"use client";

import Link from "next/link";
import type { Creation, CreationStatus } from "@/lib/supabase/types";

const TEMPLATE_ACCENT: Record<string, string> = {
  "warm-linen": "#C4A97D",
  "soft-sage": "#A8B5A0",
  "midnight-gold": "#C4A97D",
};

const STATUS_LABEL: Record<CreationStatus, string> = {
  draft: "Draft",
  generating: "Generating",
  ready: "Ready to send",
  sent: "Sent",
  opened: "Opened",
  expired: "Expired",
};

const STATUS_COLOR: Record<CreationStatus, { bg: string; text: string }> = {
  draft: { bg: "rgba(139,115,91,0.12)", text: "var(--color-stone)" },
  generating: { bg: "rgba(196,169,125,0.18)", text: "var(--color-muted-gold)" },
  ready: { bg: "rgba(168,181,160,0.2)", text: "#6B8F65" },
  sent: { bg: "rgba(139,165,181,0.18)", text: "#5B82A0" },
  opened: { bg: "rgba(42,36,32,0.1)", text: "var(--color-espresso)" },
  expired: { bg: "rgba(180,80,70,0.1)", text: "#B44046" },
};

const TYPE_LABEL: Record<string, string> = {
  tribute: "Tribute",
  gift_reveal: "Gift Reveal",
  combined: "Combined",
};

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? "s" : ""} ago`;
}

function ActionLink({ creation }: { creation: Creation }) {
  const { status, id, share_token } = creation;

  if (status === "draft") {
    return (
      <Link
        href={`/create/${id}`}
        className="text-xs font-medium"
        style={{ color: "var(--color-muted-gold)" }}
      >
        Continue →
      </Link>
    );
  }
  if (status === "generating") {
    return (
      <span className="text-xs" style={{ color: "var(--color-warm-gray)" }}>
        Generating...
      </span>
    );
  }
  if (status === "ready") {
    return (
      <Link
        href={`/create/${id}`}
        className="text-xs font-medium"
        style={{ color: "var(--color-muted-gold)" }}
      >
        Send now →
      </Link>
    );
  }
  if (status === "sent" || status === "opened") {
    return (
      <Link
        href={`/g/${share_token}`}
        className="text-xs font-medium"
        style={{ color: "var(--color-muted-gold)" }}
      >
        View →
      </Link>
    );
  }
  return null;
}

export default function CreationCard({ creation }: { creation: Creation }) {
  const accent = TEMPLATE_ACCENT[creation.template_id] ?? "#C4A97D";
  const statusStyle = STATUS_COLOR[creation.status] ?? STATUS_COLOR.draft;

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{
        backgroundColor: "var(--color-cream)",
        boxShadow: "var(--shadow-card)",
        borderLeft: `4px solid ${accent}`,
      }}
    >
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p
              className="font-serif text-lg leading-snug truncate"
              style={{ color: "var(--color-espresso)" }}
            >
              {creation.recipient_name || "Untitled"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-warm-gray)" }}>
              {TYPE_LABEL[creation.type] ?? creation.type}
            </p>
          </div>
          <span
            className="text-xs px-2 py-1 rounded-full flex-shrink-0"
            style={{
              backgroundColor: statusStyle.bg,
              color: statusStyle.text,
            }}
          >
            {STATUS_LABEL[creation.status]}
          </span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-xs" style={{ color: "var(--color-warm-gray)" }}>
            {formatRelativeDate(creation.created_at)}
          </span>
          <ActionLink creation={creation} />
        </div>
      </div>
    </div>
  );
}
