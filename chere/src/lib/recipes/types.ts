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
