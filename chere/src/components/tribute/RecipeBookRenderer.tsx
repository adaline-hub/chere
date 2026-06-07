"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Recipe } from "@/lib/recipes/types";
import type { TributeCreation } from "@/lib/mock/tribute-data";
import type { RecipeComment } from "@/lib/recipes/comments";

interface Props {
  creation: TributeCreation;
  initialRecipes: Recipe[];
  canEdit: boolean;
  isOwner: boolean;
  coverPhotoUrl: string | null;
  intro: string | null;
  bannerHeader: string | null;
  bannerSubheader: string | null;
  currentUserId: string | null;
}

interface RecipeFormState {
  title: string;
  ingredients: string;
  instructions: string;
  notes: string;
}

const EMPTY_FORM: RecipeFormState = { title: "", ingredients: "", instructions: "", notes: "" };

function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 1209600) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function RecipeBookRenderer({ creation, initialRecipes, canEdit, isOwner, coverPhotoUrl, intro, bannerHeader, bannerSubheader, currentUserId }: Props) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RecipeFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Comments state: keyed by recipeId
  const [commentsCache, setCommentsCache] = useState<Record<string, RecipeComment[]>>({});
  const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});
  const [commentBody, setCommentBody] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentSaving, setCommentSaving] = useState(false);

  const selectedRecipe = recipes.find((r) => r.id === selectedId) ?? null;

  async function handleCreate() {
    if (!form.title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/recipes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: creation.id,
          title: form.title.trim(),
          ingredients: form.ingredients.split("\n").map((s) => s.trim()).filter(Boolean),
          instructions: form.instructions.trim(),
          notes: form.notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setRecipes((prev) => [...prev, data.recipe]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate() {
    if (!editingId || !form.title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/recipes/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          patch: {
            title: form.title.trim(),
            ingredients: form.ingredients.split("\n").map((s) => s.trim()).filter(Boolean),
            instructions: form.instructions.trim(),
            notes: form.notes.trim() || undefined,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setRecipes((prev) => prev.map((r) => r.id === editingId ? data.recipe : r));
      if (selectedId === editingId) setSelectedId(data.recipe.id);
      setEditingId(null);
      setForm(EMPTY_FORM);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/recipes/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed");
      }
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(recipe: Recipe) {
    setEditingId(recipe.id);
    setForm({
      title: recipe.title,
      ingredients: recipe.ingredients.join("\n"),
      instructions: recipe.instructions,
      notes: recipe.notes ?? "",
    });
    setSelectedId(null);
  }

  async function loadComments(recipeId: string, creationId: string) {
    if (commentsCache[recipeId] !== undefined || commentsLoading[recipeId]) return;
    setCommentsLoading((prev) => ({ ...prev, [recipeId]: true }));
    try {
      const res = await fetch("/api/recipes/comments/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe_id: recipeId, creation_id: creationId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCommentsCache((prev) => ({ ...prev, [recipeId]: data.comments ?? [] }));
      } else {
        setCommentsCache((prev) => ({ ...prev, [recipeId]: [] }));
      }
    } catch {
      setCommentsCache((prev) => ({ ...prev, [recipeId]: [] }));
    } finally {
      setCommentsLoading((prev) => ({ ...prev, [recipeId]: false }));
    }
  }

  async function handleCommentSubmit(recipe: Recipe) {
    const trimmed = commentBody.trim();
    if (!trimmed || trimmed.length > 2000) return;
    setCommentSaving(true);
    setCommentError(null);
    try {
      const res = await fetch("/api/recipes/comments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe_id: recipe.id, creation_id: recipe.creationId, body: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setCommentsCache((prev) => ({ ...prev, [recipe.id]: [...(prev[recipe.id] ?? []), data.comment] }));
      setCommentBody("");
    } catch (e) {
      setCommentError(e instanceof Error ? e.message : "Failed to post comment");
    } finally {
      setCommentSaving(false);
    }
  }

  async function handleCommentDelete(commentId: string, recipeId: string) {
    if (!confirm("Delete this comment?")) return;
    try {
      const res = await fetch("/api/recipes/comments/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: commentId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed");
      }
      setCommentsCache((prev) => ({ ...prev, [recipeId]: (prev[recipeId] ?? []).filter((c) => c.id !== commentId) }));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete comment");
    }
  }

  function openRecipe(id: string) {
    setSelectedId(id);
    setEditingId(null);
    setShowForm(false);
    setCommentBody("");
    setCommentError(null);
    const recipe = recipes.find((r) => r.id === id);
    if (recipe) loadComments(recipe.id, recipe.creationId);
  }

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  // Determine "other party" for comment placeholder
  const otherParty = isOwner ? creation.recipientName : creation.creatorName;
  const commentPlaceholder = otherParty ? `Leave a note for ${otherParty}…` : "Leave a note…";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FAF6EF", fontFamily: "var(--font-sans)", lineHeight: 1.65 }}>
      <div style={{ padding: "2.5rem 1.5rem 1rem", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "#2A2420", marginBottom: "0.5rem" }}>
          {creation.recipientName}&rsquo;s Recipe Book
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "#8B7D72" }}>
          {isOwner ? `A cookbook for ${creation.recipientName}` : `From ${creation.creatorName}`}
        </p>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 1.5rem 1.5rem" }}>
        {coverPhotoUrl && (
          <div style={{ position: "relative", height: "280px", overflow: "hidden", borderBottomLeftRadius: "1rem", borderBottomRightRadius: "1rem", marginBottom: "1.25rem" }}>
            <img src={coverPhotoUrl} alt="Recipe book cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.05) 36%, rgba(20,16,12,0.58) 100%)" }} />
            {creation.recipientName && (
              <p style={{ position: "absolute", left: "1.25rem", right: "1.25rem", bottom: "1rem", margin: 0, fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "#FCF8F2", textShadow: "0 2px 14px rgba(0,0,0,0.45)" }}>
                {creation.recipientName}&rsquo;s Recipe Book
              </p>
            )}
          </div>
        )}

        {!coverPhotoUrl && creation.recipientName && (
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "#2A2420", textAlign: "center", marginTop: 0, marginBottom: "0.75rem" }}>
            {creation.recipientName}&rsquo;s Recipe Book
          </h2>
        )}

        {intro && (
          <p style={{ maxWidth: "540px", margin: "0 auto 1.25rem", color: "#4A3F38", fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.9375rem", lineHeight: 1.7, textAlign: "center", whiteSpace: "pre-wrap" }}>
            {intro}
          </p>
        )}

        {(bannerHeader || bannerSubheader) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{ maxWidth: "540px", margin: "0 auto 1.5rem", textAlign: "center" }}
          >
            {bannerHeader && (
              <p style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "#2A2420", marginBottom: bannerSubheader ? "0.75rem" : 0, lineHeight: 1.2 }}>
                {bannerHeader}
              </p>
            )}
            {bannerSubheader && (
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9375rem", color: "#4A3F38", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                {bannerSubheader}
              </p>
            )}
          </motion.div>
        )}

        <div style={{ height: "1px", backgroundColor: "rgba(196,169,125,0.75)", margin: "0 auto 1.25rem", maxWidth: "320px" }} />
      </div>

      {!canEdit && (
        <div style={{ margin: "0 1.5rem 1.25rem", maxWidth: "640px", marginInline: "auto", padding: "1.1rem 1.25rem", backgroundColor: "#FFFFFF", border: "1px solid rgba(196,169,125,0.2)", borderRadius: "12px", textAlign: "center" }}>
          <p style={{ fontSize: "0.9375rem", color: "#6A5D56", marginBottom: "0.5rem", fontStyle: "italic" }}>
            Sign in to add your own recipes to this book.
          </p>
          <a
            href={`/login?next=${encodeURIComponent(currentUrl)}`}
            style={{ fontSize: "0.9375rem", color: "#A88856", textDecoration: "underline", textDecorationColor: "#C4A97D", textUnderlineOffset: "3px" }}
          >
            Sign in →
          </a>
        </div>
      )}

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "1.5rem" }}>
        {recipes.length === 0 && (
          <p style={{ textAlign: "center", color: "#8B7D72", fontSize: "0.9375rem", paddingTop: "2rem" }}>
            No recipes yet. {canEdit ? "Add the first one below." : ""}
          </p>
        )}

        {recipes.map((recipe) => (
          <button
            key={recipe.id}
            type="button"
            onClick={() => openRecipe(recipe.id)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              backgroundColor: selectedId === recipe.id ? "rgba(196,169,125,0.05)" : "#FFFFFF",
              border: "1px solid",
              borderColor: selectedId === recipe.id ? "rgba(196,169,125,0.48)" : "rgba(196,169,125,0.2)",
              borderRadius: "12px",
              padding: "1.25rem",
              marginBottom: "0.75rem",
              cursor: "pointer",
              boxShadow: selectedId === recipe.id ? "0 6px 18px rgba(74,63,56,0.12)" : "none",
              transition: "background-color 180ms ease, box-shadow 180ms ease",
            }}
            onMouseEnter={(e) => {
              if (selectedId !== recipe.id) {
                e.currentTarget.style.backgroundColor = "rgba(196,169,125,0.05)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(74,63,56,0.08)";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedId !== recipe.id) {
                e.currentTarget.style.backgroundColor = "#FFFFFF";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "#2A2420", marginBottom: "0.25rem" }}>{recipe.title}</p>
            {recipe.authorProfileId && (
              <p style={{ fontSize: "0.8125rem", color: "#8B7D72", fontStyle: "italic", marginBottom: "0.35rem" }}>
                Shared by {recipe.authorDisplayName ?? "a contributor"}
              </p>
            )}
            {recipe.ingredients[0] && (
              <p style={{ fontSize: "0.9375rem", color: "#8B7D72" }}>{recipe.ingredients[0]}{recipe.ingredients.length > 1 ? ` + ${recipe.ingredients.length - 1} more` : ""}</p>
            )}
          </button>
        ))}

        {selectedRecipe && editingId !== selectedRecipe.id && (
          <div style={{ backgroundColor: "white", border: "1px solid rgba(196,169,125,0.2)", borderRadius: "12px", padding: "1.25rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "#2A2420" }}>{selectedRecipe.title}</h2>
              <button type="button" onClick={() => setSelectedId(null)} style={{ fontSize: "1.25rem", color: "#8B7D72", background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>
            {selectedRecipe.photoUrl && (
              <img src={selectedRecipe.photoUrl} alt={selectedRecipe.title} style={{ width: "100%", maxHeight: "220px", objectFit: "cover", borderRadius: "8px", marginBottom: "1.25rem" }} />
            )}
            {selectedRecipe.ingredients.length > 0 && (
              <div style={{ marginBottom: "1.25rem" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#C4A97D", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Ingredients</p>
                <ul style={{ paddingLeft: "1.125rem", margin: 0 }}>
                  {selectedRecipe.ingredients.map((ing, i) => (
                    <li key={i} style={{ fontSize: "0.9375rem", color: "#3D3530", marginBottom: "0.25rem" }}>{ing}</li>
                  ))}
                </ul>
              </div>
            )}
            {selectedRecipe.instructions && (
              <div style={{ marginBottom: selectedRecipe.notes ? "1.25rem" : 0 }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#C4A97D", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Instructions</p>
                <p style={{ fontSize: "0.9375rem", color: "#3D3530", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{selectedRecipe.instructions}</p>
              </div>
            )}
            {selectedRecipe.notes && (
              <div style={{ marginBottom: "1.25rem" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#C4A97D", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Notes</p>
                <p style={{ fontSize: "0.9375rem", color: "#6A5D56", fontStyle: "italic", lineHeight: 1.65 }}>{selectedRecipe.notes}</p>
              </div>
            )}

            {/* Comments section */}
            <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(196,169,125,0.2)" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#C4A97D", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Comments</p>

              {commentsLoading[selectedRecipe.id] && (
                <p style={{ fontSize: "0.875rem", color: "#8B7D72", fontStyle: "italic" }}>Loading…</p>
              )}

              {!commentsLoading[selectedRecipe.id] && commentsCache[selectedRecipe.id] !== undefined && (
                <>
                  {commentsCache[selectedRecipe.id].length === 0 && (
                    <p style={{ fontSize: "0.875rem", color: "#8B7D72", fontStyle: "italic", marginBottom: "1rem" }}>No comments yet.</p>
                  )}
                  {commentsCache[selectedRecipe.id].map((comment, i) => {
                    const isMine = currentUserId !== null && comment.authorProfileId === currentUserId;
                    const canDelete = isMine || isOwner;
                    return (
                      <div
                        key={comment.id}
                        style={{
                          paddingLeft: "0.875rem",
                          borderLeft: `2px solid ${isMine ? "#C4A97D" : "rgba(196,169,125,0.2)"}`,
                          marginBottom: i < commentsCache[selectedRecipe.id].length - 1 ? "1rem" : "0.5rem",
                          paddingBottom: i < commentsCache[selectedRecipe.id].length - 1 ? "1rem" : 0,
                          borderBottom: i < commentsCache[selectedRecipe.id].length - 1 ? "1px solid rgba(196,169,125,0.1)" : "none",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.25rem" }}>
                          <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.875rem", color: "#4A3F38" }}>
                            {comment.authorDisplayName ?? "Someone"}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "#8B7D72", marginLeft: "0.75rem", flexShrink: 0 }}>
                            {relativeTime(comment.createdAt)}
                          </span>
                        </div>
                        <p style={{ fontSize: "0.9375rem", color: "#3D3530", lineHeight: 1.65, margin: 0 }}>{comment.body}</p>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleCommentDelete(comment.id, selectedRecipe.id)}
                            style={{ marginTop: "0.375rem", fontSize: "0.75rem", color: "#8B7D72", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", textDecorationColor: "rgba(139,125,114,0.4)", textUnderlineOffset: "2px" }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    );
                  })}
                </>
              )}

              {canEdit && (
                <div style={{ marginTop: "1rem" }}>
                  <textarea
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    placeholder={commentPlaceholder}
                    rows={3}
                    style={{ width: "100%", border: "1px solid rgba(196,169,125,0.4)", borderRadius: "6px", padding: "0.625rem 0.75rem", fontSize: "0.9375rem", color: "#2A2420", backgroundColor: "#FDFAF6", resize: "vertical", fontFamily: "var(--font-sans)", boxSizing: "border-box", lineHeight: 1.65 }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.375rem" }}>
                    <span style={{ fontSize: "0.75rem", color: commentBody.length > 2000 ? "#C05050" : "#8B7D72" }}>
                      {commentBody.length}/2000
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {commentError && <span style={{ fontSize: "0.8125rem", color: "#C05050" }}>{commentError}</span>}
                      <button
                        type="button"
                        onClick={() => handleCommentSubmit(selectedRecipe)}
                        disabled={commentSaving || !commentBody.trim() || commentBody.length > 2000}
                        style={{ fontSize: "0.875rem", color: "white", backgroundColor: "#C4A97D", border: "none", borderRadius: "6px", padding: "0.5rem 1.125rem", cursor: commentSaving || !commentBody.trim() || commentBody.length > 2000 ? "not-allowed" : "pointer", opacity: commentSaving || !commentBody.trim() || commentBody.length > 2000 ? 0.55 : 1 }}
                      >
                        {commentSaving ? "Posting…" : "Post"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {canEdit && (
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button type="button" onClick={() => startEdit(selectedRecipe)} style={{ fontSize: "0.875rem", color: "#6A5D56", backgroundColor: "var(--color-parchment)", border: "none", borderRadius: "6px", padding: "0.5rem 1rem", cursor: "pointer" }}>
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(selectedRecipe.id)} disabled={saving} style={{ fontSize: "0.875rem", color: "#C05050", backgroundColor: "#FFF2F2", border: "none", borderRadius: "6px", padding: "0.5rem 1rem", cursor: "pointer" }}>
                  Delete
                </button>
              </div>
            )}
          </div>
        )}

        {(showForm || editingId) && (
          <div style={{ backgroundColor: "white", border: "1px solid rgba(196,169,125,0.2)", borderRadius: "12px", padding: "1.25rem", marginBottom: "1.5rem" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.125rem", color: "#2A2420", marginBottom: "1.25rem" }}>
              {editingId ? "Edit recipe" : "New recipe"}
            </h3>
            {[
              { label: "Title", key: "title" as const, placeholder: "e.g. Grandma's Apple Pie", multiline: false },
              { label: "Ingredients (one per line)", key: "ingredients" as const, placeholder: "2 cups flour\n1 cup sugar\n...", multiline: true },
              { label: "Instructions", key: "instructions" as const, placeholder: "Mix dry ingredients...", multiline: true },
              { label: "Notes (optional)", key: "notes" as const, placeholder: "Best served warm.", multiline: true },
            ].map(({ label, key, placeholder, multiline }) => (
              <div key={key} style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", color: "#6A5D56", marginBottom: "0.375rem" }}>{label}</label>
                {multiline ? (
                  <textarea
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    rows={key === "instructions" ? 5 : 3}
                    style={{ width: "100%", border: "1px solid rgba(196,169,125,0.4)", borderRadius: "6px", padding: "0.625rem 0.75rem", fontSize: "0.9375rem", color: "#2A2420", backgroundColor: "#FDFAF6", resize: "vertical", fontFamily: "var(--font-sans)", boxSizing: "border-box", lineHeight: 1.65 }}
                  />
                ) : (
                  <input
                    type="text"
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={{ width: "100%", border: "1px solid rgba(196,169,125,0.4)", borderRadius: "6px", padding: "0.625rem 0.75rem", fontSize: "0.9375rem", color: "#2A2420", backgroundColor: "#FDFAF6", fontFamily: "var(--font-sans)", boxSizing: "border-box", lineHeight: 1.65 }}
                  />
                )}
              </div>
            ))}
            {error && <p style={{ fontSize: "0.875rem", color: "#C05050", marginBottom: "0.75rem" }}>{error}</p>}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={editingId ? handleUpdate : handleCreate}
                disabled={saving || !form.title.trim()}
                style={{ fontSize: "0.9375rem", color: "white", backgroundColor: "#C4A97D", border: "none", borderRadius: "8px", padding: "0.625rem 1.5rem", cursor: saving ? "wait" : "pointer", opacity: saving || !form.title.trim() ? 0.6 : 1 }}
              >
                {saving ? "Saving…" : editingId ? "Save changes" : "Add recipe"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); setError(null); }}
                style={{ fontSize: "0.9375rem", color: "#6A5D56", backgroundColor: "transparent", border: "1px solid rgba(196,169,125,0.4)", borderRadius: "8px", padding: "0.625rem 1.25rem", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {canEdit && !showForm && !editingId && (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: "0.5rem", paddingBottom: "4rem" }}>
            <button
              type="button"
              onClick={() => { setShowForm(true); setSelectedId(null); setForm(EMPTY_FORM); }}
              style={{
                display: "block",
                width: "100%",
                maxWidth: "420px",
                textAlign: "center",
                backgroundColor: "#FFFFFF",
                border: "1px solid rgba(196,169,125,0.2)",
                borderRadius: "12px",
                padding: "1.1rem 1.25rem",
                color: "#6A5D56",
                fontSize: "0.9375rem",
                cursor: "pointer",
              }}
            >
              + Add a recipe to this book
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
