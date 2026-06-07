import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { mockCreation, type TributeCreation, type TributeAudio } from "@/lib/mock/tribute-data";
import { getCreationByShareToken } from "@/lib/supabase/creations";
import { getPhotoUrl, getSignedAssetUrl } from "@/lib/supabase/storage";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { listRecipes, isCoAuthor } from "@/lib/recipes/queries";
import RecipeBookRenderer from "@/components/tribute/RecipeBookRenderer";
import TributeExperience from "./_experience";

async function loadCreation(shareToken: string): Promise<TributeCreation | null> {
  const configured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!configured) return mockCreation;

  try {
    const creation = await getCreationByShareToken(shareToken);
    if (!creation) return null;

    const admin = createAdminClient();
    const { data: photoRows, error: photoError } = await admin
      .from("photos")
      .select("*")
      .eq("creation_id", creation.id)
      .order("sort_order");
    if (photoError) console.error("[tribute] photos query error:", photoError);

    const photos = await Promise.all(
      (photoRows ?? []).map(async (p) => ({
        id: p.id as string,
        url: p.storage_path ? await getPhotoUrl(p.storage_path as string) : "",
        caption: (p.caption as string) ?? "",
      }))
    );

    // Audio clips — dedication + per-memory voice.
    const { data: audioRows } = await admin
      .from("audio_clips")
      .select("kind, storage_path, transcript, memory_slot_id")
      .eq("creation_id", creation.id)
      .in("kind", ["dedication", "memory"]);

    const dedicationRow = audioRows?.find((r) => r.kind === "dedication");
    const memoryRows = (audioRows ?? []).filter((r) => r.kind === "memory" && !!r.memory_slot_id && !!r.storage_path);
    const memoriesEntries = await Promise.all(
      memoryRows.map(async (row) => [
        row.memory_slot_id as string,
        {
          url: await getSignedAssetUrl(row.storage_path as string),
          transcript: (row.transcript as string | null) ?? null,
        },
      ] as const)
    );

    const audio: TributeAudio = {
      dedicationUrl: dedicationRow?.storage_path
        ? await getSignedAssetUrl(dedicationRow.storage_path as string)
        : null,
      dedicationTranscript: (dedicationRow?.transcript as string | null) ?? null,
      memories: Object.fromEntries(memoriesEntries),
    };

    return {
      id: creation.id,
      recipientName: creation.recipient_name,
      creatorName: "Someone who loves you",
      type: creation.type,
      relationshipType: creation.relationship_type,
      outputFormat: creation.output_format as TributeCreation["outputFormat"],
      templateId: (creation.template_id ?? "warm-linen") as TributeCreation["templateId"],
      tier: creation.tier,
      generatedText: creation.generated_text_edited ?? creation.generated_text ?? "",
      dedicationMessage: creation.dedication_message ?? "",
      recipe_book_cover_path: creation.recipe_book_cover_path ?? null,
      recipe_book_intro: creation.recipe_book_intro ?? null,
      banner_header: creation.banner_header ?? null,
      banner_subheader: creation.banner_subheader ?? null,
      access_mode: creation.access_mode ?? "invited",
      photos,
      giftMoment: null,
      musicTrackId: creation.music_track_id,
      reactionCamEnabled: creation.reaction_cam_enabled ?? false,
      audio,
    };
  } catch (err) {
    console.error("[tribute] loadCreation threw:", err);
    return null;
  }
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

  if (!creation) notFound();

  // Recipe book: bypass TributeExperience — load recipes + permissions server-side
  if (creation.outputFormat === "recipe_book") {
    const configured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    let initialRecipes: Awaited<ReturnType<typeof listRecipes>> = [];
    let canEdit = false;
    let isOwnerFlag = false;
    let coverPhotoUrl: string | null = null;
    let currentUserId: string | null = null;
    const intro = creation.recipe_book_intro ?? null;

    if (configured) {
      // Access gate — must be signed in for all recipe books
      const serverClient = await createServerClient();
      const { data: { user } } = await serverClient.auth.getUser();
      if (!user) {
        redirect(`/login?next=/g/${shareToken}`);
      }

      currentUserId = user.id;

      try {
        initialRecipes = await listRecipes(creation.id);
      } catch (e) {
        console.error("[tribute] listRecipes failed:", e);
      }
      try {
        canEdit = await isCoAuthor(creation.id, user.id);
        const admin = createAdminClient();
        const { data: raw } = await admin
          .from("creations")
          .select("creator_id")
          .eq("id", creation.id)
          .single();
        isOwnerFlag = (raw as { creator_id?: string } | null)?.creator_id === user.id;
      } catch (e) {
        console.error("[tribute] recipe permission check failed:", e);
      }

      // Invited-only gate: user must already be a collaborator or creator
      const accessMode = creation.access_mode ?? "invited";
      if (accessMode === "invited" && !canEdit && !isOwnerFlag) {
        return (
          <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: "#F5F0EB" }}>
            <p className="font-serif text-2xl" style={{ color: "#2A2420" }}>You&rsquo;re not on the invite list.</p>
            <p className="text-sm mt-3 max-w-xs leading-relaxed" style={{ color: "#8B7D72" }}>
              The person who made this needs to invite you before you can view it.
            </p>
          </main>
        );
      }

      // open_link: auto-claim collaborator row so they appear in the audience list
      if (accessMode === "open_link" && !canEdit && !isOwnerFlag) {
        try {
          const admin = createAdminClient();
          await admin.from("recipe_collaborators").upsert(
            { creation_id: creation.id, profile_id: user.id, role: "co_author" },
            { onConflict: "creation_id,profile_id", ignoreDuplicates: true }
          );
          canEdit = true;
        } catch (e) {
          console.error("[tribute] open_link auto-claim failed:", e);
        }
      }

      if (creation.recipe_book_cover_path) {
        try {
          coverPhotoUrl = await getSignedAssetUrl(creation.recipe_book_cover_path);
        } catch (e) {
          console.error("[tribute] cover url signing failed:", e);
        }
      }
    }

    return (
      <div className="tribute-page">
        <RecipeBookRenderer
          creation={creation!}
          initialRecipes={initialRecipes}
          canEdit={canEdit}
          isOwner={isOwnerFlag}
          coverPhotoUrl={coverPhotoUrl}
          intro={intro}
          bannerHeader={creation!.banner_header ?? null}
          bannerSubheader={creation!.banner_subheader ?? null}
          currentUserId={currentUserId}
        />
      </div>
    );
  }

  // Expired
  if ("expires_at" in creation) {
    const raw = creation as unknown as { expires_at?: string | null };
    if (raw.expires_at && new Date(raw.expires_at) < new Date()) {
      return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: "#F5F0EB" }}>
          <p className="font-serif text-2xl" style={{ color: "#2A2420" }}>
            This gift has expired.
          </p>
          <p className="text-sm mt-3 max-w-xs leading-relaxed" style={{ color: "#8B7D72" }}>
            The person who made this can restore it by upgrading.
          </p>
          <p className="text-sm mt-5" style={{ color: "#8B7D72" }}>
            Were you the creator?{" "}
            <a href="/login" style={{ color: "#C4A97D", textDecoration: "underline" }}>
              Sign in to restore this gift →
            </a>
          </p>
        </main>
      );
    }
  }

  return (
    <div className="tribute-page">
      <TributeExperience creation={creation!} creationId={creation!.id} />
    </div>
  );
}
