import { createAdminClient } from "@/lib/supabase/admin";

export interface RecipeComment {
  id: string;
  recipeId: string;
  creationId: string;
  authorProfileId: string | null;
  authorDisplayName: string | null;
  body: string;
  createdAt: string;
}

function toComment(row: Record<string, unknown>): RecipeComment {
  const profile = row.profiles as { display_name?: string | null } | null;
  return {
    id: row.id as string,
    recipeId: row.recipe_id as string,
    creationId: row.creation_id as string,
    authorProfileId: (row.author_profile_id as string | null) ?? null,
    authorDisplayName: profile?.display_name ?? null,
    body: row.body as string,
    createdAt: row.created_at as string,
  };
}

export async function listCommentsForRecipe(recipeId: string): Promise<RecipeComment[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("recipe_comments")
    .select("*, profiles(display_name)")
    .eq("recipe_id", recipeId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => toComment(row as Record<string, unknown>));
}

export async function createComment(input: {
  recipeId: string;
  creationId: string;
  authorProfileId: string | null;
  body: string;
}): Promise<RecipeComment> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("recipe_comments")
    .insert({
      recipe_id: input.recipeId,
      creation_id: input.creationId,
      author_profile_id: input.authorProfileId,
      body: input.body,
    })
    .select("*, profiles(display_name)")
    .single();
  if (error) throw error;
  return toComment(data as Record<string, unknown>);
}

export async function deleteComment(id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("recipe_comments").delete().eq("id", id);
  if (error) throw error;
}

export async function getCommentById(id: string): Promise<{ authorProfileId: string | null; creationId: string } | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("recipe_comments")
    .select("author_profile_id, creation_id")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return {
    authorProfileId: (data.author_profile_id as string | null) ?? null,
    creationId: data.creation_id as string,
  };
}
