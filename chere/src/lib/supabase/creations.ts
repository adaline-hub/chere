import { createAdminClient } from "./admin";
import { createClient as createBrowserClient } from "./client";
import { generateShareToken } from "@/lib/utils/share-token";
import type { Creation, CreationType, RelationshipType } from "./types";

// ─── Server-side (admin / no RLS) ────────────────────────

export async function getCreationByShareToken(shareToken: string): Promise<Creation | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("creations")
    .select("*")
    .eq("share_token", shareToken)
    .single();
  if (error || !data) return null;
  return data as Creation;
}

export async function getCreationById(creationId: string): Promise<Creation | null> {
  const client = createBrowserClient();
  const { data, error } = await client
    .from("creations")
    .select("*")
    .eq("id", creationId)
    .single();
  if (error || !data) return null;
  return data as Creation;
}

export async function adminUpdateCreation(
  creationId: string,
  patch: Partial<Creation>
): Promise<void> {
  const admin = createAdminClient();
  await admin.from("creations").update(patch).eq("id", creationId);
}

// ─── Client-side (authenticated user) ────────────────────

export async function createCreation(data: {
  creatorId: string;
  type: CreationType;
  relationshipType: RelationshipType;
  recipientName: string;
}): Promise<Creation> {
  const supabase = createBrowserClient();
  const shareToken = generateShareToken();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const insertPayload = {
    creator_id: data.creatorId,
    type: data.type,
    relationship_type: data.relationshipType,
    recipient_name: data.recipientName,
    share_token: shareToken,
    status: "draft",
    output_format: "scrollytelling",
    template_id: "warm-linen",
    tier: "free",
    expires_at: expiresAt.toISOString(),
  };

  console.log("createCreation: inserting row into Supabase", insertPayload);
  const { data: row, error } = await supabase
    .from("creations")
    .insert(insertPayload)
    .select()
    .single();

  console.log("createCreation: Supabase insert response", { row, error });
  if (error) throw error;
  if (!row) throw new Error("Failed to create creation: insert returned no row");
  return row as Creation;
}

export async function updateCreation(
  creationId: string,
  patch: Partial<Creation>
): Promise<void> {
  const supabase = createBrowserClient();
  const { error } = await supabase.from("creations").update(patch).eq("id", creationId);
  if (error) throw new Error(error.message);
}

export function tierExpiresAt(tier: string): string | null {
  if (tier === "free") {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString();
  }
  if (tier === "standard") {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString();
  }
  return null; // premium / deluxe = permanent
}

export async function getUserCreations(userId: string): Promise<Creation[]> {
  const supabase = createBrowserClient();
  const { data } = await supabase
    .from("creations")
    .select("*")
    .eq("creator_id", userId)
    .order("created_at", { ascending: false });
  return (data as Creation[]) ?? [];
}
