import { createAdminClient } from "./admin";
import { createClient as createBrowserClient } from "./client";

const BUCKET = "creations";

// ─── Client-side upload ───────────────────────────────────

export async function uploadPhoto(
  creationId: string,
  file: File,
  photoId: string,
  sortOrder = 0
): Promise<{ storagePath: string }> {
  const supabase = createBrowserClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const storagePath = `${creationId}/originals/${photoId}.${ext}`;

  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { upsert: true });

  if (storageError) throw new Error(storageError.message);

  const { error: dbError } = await supabase.from("photos").upsert({
    id: photoId,
    creation_id: creationId,
    storage_path: storagePath,
    original_filename: file.name,
    sort_order: sortOrder,
  }, { onConflict: "id" });

  if (dbError) console.error("[uploadPhoto] photos insert error:", dbError);

  return { storagePath };
}

export async function deletePhoto(storagePath: string): Promise<void> {
  const supabase = createBrowserClient();
  await supabase.storage.from(BUCKET).remove([storagePath]);
}

// ─── Server-side signed URL (admin, no RLS) ───────────────

export async function getPhotoUrl(storagePath: string): Promise<string> {
  const admin = createAdminClient();
  const { data } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 3600); // 1-hour expiry
  return data?.signedUrl ?? "";
}
