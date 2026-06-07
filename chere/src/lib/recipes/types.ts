export interface RecipeBookMeta {
  bannerHeader?: string | null;
  bannerSubheader?: string | null;
  accessMode?: "invited" | "open_link";
}

export interface Recipe {
  id: string;
  creationId: string;
  authorProfileId: string | null;
  authorDisplayName: string | null;
  title: string;
  ingredients: string[];
  instructions: string;
  notes: string | null;
  photoUrl: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
