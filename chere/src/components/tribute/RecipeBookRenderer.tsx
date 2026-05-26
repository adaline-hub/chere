"use client";

import { useState } from "react";
import type { Recipe } from "@/lib/recipes/types";
import type { TributeCreation } from "@/lib/mock/tribute-data";

interface Props {
  creation: TributeCreation;
  initialRecipes: Recipe[];
  canEdit: boolean;
  isOwner: boolean;
}

interface RecipeFormState {
  title: string;
  ingredients: string;
  instructions: string;
  notes: string;
}

const EMPTY_FORM: RecipeFormState = { title: "", ingredients: "", instructions: "", notes: "" };

export default function RecipeBookRenderer({ creation, initialRecipes, canEdit, isOwner }: Props) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RecipeFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FAF6EF", fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div style={{ padding: "2.5rem 1.5rem 1.5rem", textAlign: "center", borderBottom: "1px solid rgba(196,169,125,0.2)" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", color: "#2A2420", marginBottom: "0.375rem" }}>
          {creation.recipientName}&rsquo;s Recipe Book
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#8B7D72" }}>
          {isOwner ? `A cookbook for ${creation.recipientName}` : `From ${creation.creatorName}`}
        </p>
      </div>

      {/* Sign-in prompt for unauthenticated */}
      {!canEdit && (
        <div style={{ margin: "1rem 1.5rem", padding: "0.875rem 1.25rem", backgroundColor: "#FFF9F2", border: "1px solid rgba(196,169,125,0.3)", borderRadius: "8px", textAlign: "center" }}>
          <p style={{ fontSize: "0.875rem", color: "#6A5D56", marginBottom: "0.5rem" }}>
            Sign in to add your own recipes to this book.
          </p>
          <a
            href={`/login?next=${encodeURIComponent(currentUrl)}`}
            style={{ fontSize: "0.875rem", color: "#C4A97D", fontWeight: 500, textDecoration: "underline" }}
          >
            Sign in →
          </a>
        </div>
      )}

      {/* Recipe list */}
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
            onClick={() => { setSelectedId(recipe.id); setEditingId(null); setShowForm(false); }}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              backgroundColor: selectedId === recipe.id ? "var(--color-cream)" : "white",
              border: "1px solid",
              borderColor: selectedId === recipe.id ? "var(--color-muted-gold)" : "rgba(196,169,125,0.25)",
              borderRadius: "10px",
              padding: "1rem 1.25rem",
              marginBottom: "0.75rem",
              cursor: "pointer",
              boxShadow: selectedId === recipe.id ? "var(--shadow-subtle)" : "none",
            }}
          >
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.0625rem", color: "#2A2420", marginBottom: "0.25rem" }}>{recipe.title}</p>
            {recipe.ingredients[0] && (
              <p style={{ fontSize: "0.8125rem", color: "#8B7D72" }}>{recipe.ingredients[0]}{recipe.ingredients.length > 1 ? ` + ${recipe.ingredients.length - 1} more` : ""}</p>
            )}
          </button>
        ))}

        {/* Recipe detail */}
        {selectedRecipe && editingId !== selectedRecipe.id && (
          <div style={{ backgroundColor: "white", border: "1px solid rgba(196,169,125,0.3)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: "#2A2420" }}>{selectedRecipe.title}</h2>
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
              <div>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#C4A97D", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Notes</p>
                <p style={{ fontSize: "0.9375rem", color: "#6A5D56", fontStyle: "italic", lineHeight: 1.65 }}>{selectedRecipe.notes}</p>
              </div>
            )}
            {canEdit && (
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => startEdit(selectedRecipe)}
                  style={{ fontSize: "0.875rem", color: "#6A5D56", backgroundColor: "var(--color-parchment)", border: "none", borderRadius: "6px", padding: "0.5rem 1rem", cursor: "pointer" }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(selectedRecipe.id)}
                  disabled={saving}
                  style={{ fontSize: "0.875rem", color: "#C05050", backgroundColor: "#FFF2F2", border: "none", borderRadius: "6px", padding: "0.5rem 1rem", cursor: "pointer" }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}

        {/* Recipe form (create or edit) */}
        {(showForm || editingId) && (
          <div style={{ backgroundColor: "white", border: "1px solid rgba(196,169,125,0.3)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
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
                    style={{ width: "100%", border: "1px solid rgba(196,169,125,0.4)", borderRadius: "6px", padding: "0.625rem 0.75rem", fontSize: "0.9375rem", color: "#2A2420", backgroundColor: "#FDFAF6", resize: "vertical", fontFamily: "var(--font-sans)", boxSizing: "border-box" }}
                  />
                ) : (
                  <input
                    type="text"
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={{ width: "100%", border: "1px solid rgba(196,169,125,0.4)", borderRadius: "6px", padding: "0.625rem 0.75rem", fontSize: "0.9375rem", color: "#2A2420", backgroundColor: "#FDFAF6", fontFamily: "var(--font-sans)", boxSizing: "border-box" }}
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

        {/* Add recipe FAB */}
        {canEdit && !showForm && !editingId && (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: "0.5rem", paddingBottom: "4rem" }}>
            <button
              type="button"
              onClick={() => { setShowForm(true); setSelectedId(null); setForm(EMPTY_FORM); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "#C4A97D",
                color: "white",
                border: "none",
                borderRadius: "999px",
                padding: "0.75rem 1.75rem",
                fontSize: "0.9375rem",
                fontWeight: 500,
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(196,169,125,0.35)",
              }}
            >
              <span style={{ fontSize: "1.125rem", lineHeight: 1 }}>+</span>
              Add a recipe
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
