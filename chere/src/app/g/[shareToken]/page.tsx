import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { mockCreation, type TributeCreation } from "@/lib/mock/tribute-data";
import { getCreationByShareToken } from "@/lib/supabase/creations";
import { getPhotoUrl } from "@/lib/supabase/storage";
import { createAdminClient } from "@/lib/supabase/admin";
import TributeExperience from "./_experience";

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

async function loadCreation(shareToken: string): Promise<TributeCreation | null> {
  if (!SUPABASE_CONFIGURED) return mockCreation;

  const creation = await getCreationByShareToken(shareToken);
  if (!creation) return null;

  // Fetch photos from Supabase Storage
  const admin = createAdminClient();
  const { data: photoRows } = await admin
    .from("photos")
    .select("*")
    .eq("creation_id", creation.id)
    .order("sort_order");

  const photos = await Promise.all(
    (photoRows ?? []).map(async (p) => ({
      id: p.id as string,
      url: p.storage_path ? await getPhotoUrl(p.storage_path as string) : "",
      caption: (p.caption as string) ?? "",
    }))
  );

  return {
    id: creation.id,
    recipientName: creation.recipient_name,
    creatorName: "Someone who loves you", // Phase 8: join profiles
    type: creation.type,
    relationshipType: creation.relationship_type,
    outputFormat: creation.output_format as TributeCreation["outputFormat"],
    templateId: (creation.template_id ?? "warm-linen") as TributeCreation["templateId"],
    tier: creation.tier,
    generatedText: creation.generated_text_edited ?? creation.generated_text ?? "",
    dedicationMessage: creation.dedication_message ?? "",
    photos,
    giftMoment: null, // Phase 8: load from gift_moments table
    musicTrackId: creation.music_track_id,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}): Promise<Metadata> {
  const { shareToken } = await params;
  const creation = await loadCreation(shareToken);
  const name = creation?.recipientName ?? "you";
  return {
    title: `A gift for you, ${name}`,
    description: "Someone made something beautiful for you.",
    openGraph: {
      title: `A gift for you, ${name}`,
      description: "Someone made something beautiful for you.",
    },
  };
}

export default async function TributePage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;
  const creation = await loadCreation(shareToken);

  if (!creation) {
    notFound();
  }

  // Expired
  if ("expires_at" in creation) {
    const raw = creation as unknown as { expires_at?: string | null };
    if (raw.expires_at && new Date(raw.expires_at) < new Date()) {
      return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: "#F5F0EB" }}>
          <p className="font-serif text-2xl text-center" style={{ color: "#2A2420" }}>
            This gift has expired.
          </p>
          <p className="text-sm mt-3 text-center" style={{ color: "#8B7D72" }}>
            The creator can upgrade to keep it forever.
          </p>
        </main>
      );
    }
  }

  return (
    <div className="tribute-page">
      <TributeExperience creation={creation} creationId={creation.id} />
    </div>
  );
}
