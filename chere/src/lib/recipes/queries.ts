import { createAdminClient } from "@/lib/supabase/admin";
import { getSignedAssetUrl } from "@/lib/supabase/storage";
import type { Recipe } from "./types";

function toRecipe(row: Record<string, unknown>, photoUrl: string | null): Recipe {
  const profile = row.profiles as { display_name?: string | null } | null;
  return {
    id: row.id as string,
    creationId: row.creation_id as string,
    authorProfileId: (row.author_profile_id as string | null) ?? null,
    authorDisplayName: profile?.display_name ?? null,
    title: row.title as string,
    ingredients: (row.ingredients as string[]) ?? [],
    instructions: (row.instructions as string) ?? "",
    notes: (row.notes as string | null) ?? null,
    photoUrl,
    sortOrder: (row.sort_order as number) ?? 0,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function listRecipes(creationId: string): Promise<Recipe[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("recipes")
    .select("*, profiles(display_name)")
    .eq("creation_id", creationId)
    .order("sort_order");
  if (error) throw error;

  return Promise.all(
    (data ?? []).map(async (row) => {
      const photoUrl = row.photo_path
        ? await getSignedAssetUrl(row.photo_path as string)
        : null;
      return toRecipe(row as Record<string, unknown>, photoUrl);
    })
  );
}

export async function createRecipe(input: {
  creationId: string;
  authorProfileId: string | null;
  title: string;
  ingredients: string[];
  instructions: string;
  notes?: string;
}): Promise<Recipe> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("recipes")
    .insert({
      creation_id: input.creationId,
      author_profile_id: input.authorProfileId,
      title: input.title,
      ingredients: input.ingredients,
      instructions: input.instructions,
      notes: input.notes ?? null,
    })
    .select("*, profiles(display_name)")
    .single();
  if (error) throw error;
  return toRecipe(data as Record<string, unknown>, null);
}

export async function updateRecipe(
  id: string,
  patch: Partial<Pick<Recipe, "title" | "ingredients" | "instructions" | "notes" | "sortOrder">>
): Promise<Recipe> {
  const admin = createAdminClient();
  const dbPatch: Record<string, unknown> = {};
  if (patch.title !== undefined) dbPatch.title = patch.title;
  if (patch.ingredients !== undefined) dbPatch.ingredients = patch.ingredients;
  if (patch.instructions !== undefined) dbPatch.instructions = patch.instructions;
  if (patch.notes !== undefined) dbPatch.notes = patch.notes;
  if (patch.sortOrder !== undefined) dbPatch.sort_order = patch.sortOrder;

  const { data, error } = await admin
    .from("recipes")
    .update(dbPatch)
    .eq("id", id)
    .select("*, profiles(display_name)")
    .single();
  if (error) throw error;
  const row = data as Record<string, unknown>;
  const photoUrl = row.photo_path ? await getSignedAssetUrl(row.photo_path as string) : null;
  return toRecipe(row, photoUrl);
}

export async function deleteRecipe(id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("recipes").delete().eq("id", id);
  if (error) throw error;
}

export async function isCoAuthor(creationId: string, profileId: string): Promise<boolean> {
  const admin = createAdminClient();
  // Check creator
  const { data: creation } = await admin
    .from("creations")
    .select("creator_id")
    .eq("id", creationId)
    .single();
  if (creation?.creator_id === profileId) return true;

  // Check collaborator
  const { data: collab } = await admin
    .from("recipe_collaborators")
    .select("id")
    .eq("creation_id", creationId)
    .eq("profile_id", profileId)
    .maybeSingle();
  return !!collab;
}
