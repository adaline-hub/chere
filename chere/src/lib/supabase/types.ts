/**
 * Chère Database Types
 * 
 * These types mirror the Supabase PostgreSQL schema.
 * Update these when migrations change the schema.
 */

export type CreationType = "tribute" | "gift_reveal" | "combined";

export type CreationStatus =
  | "draft"
  | "generating"
  | "ready"
  | "sent"
  | "opened"
  | "expired";

export type RelationshipType =
  | "mom"
  | "dad"
  | "partner"
  | "pet"
  | "pet_memorial"
  | "friend"
  | "grandparent"
  | "sibling"
  | "child"
  | "custom";

export type OutputFormat =
  | "scrollytelling"
  | "memory_wrapped"
  | "love_letter"
  | "gift_reveal"
  | "storybook"
  | "companion"
  | "recipe_book";

export type Tier = "free" | "starter" | "premium";

export type DeliveryMethod = "email" | "link" | "qr";

export type GiftType = "trip" | "experience" | "physical" | "shopping" | "mystery";

export type RevealStyle = "card" | "envelope" | "ticket" | "box";

export type ClueType = "text" | "emoji" | "photo" | "riddle" | "temperature" | "sound";

export type CollaboratorStatus = "invited" | "contributing" | "submitted";

export type InteractionType = "opened" | "reaction" | "comment" | "shared";

// ─── Row Types ───────────────────────────────────────────

export interface Profile {
  id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Creation {
  id: string;
  creator_id: string;
  type: CreationType;
  status: CreationStatus;
  recipient_name: string;
  recipient_email: string | null;
  recipient_phone: string | null;
  relationship_type: RelationshipType;
  interview_answers: Record<string, string>;
  generated_text: string | null;
  generated_text_edited: string | null;
  dedication_message: string | null;
  output_format: OutputFormat;
  template_id: string;
  music_track_id: string | null;
  recipe_book_cover_path: string | null;
  recipe_book_intro: string | null;
  banner_header: string | null;
  banner_subheader: string | null;
  access_mode: "invited" | "open_link";
  share_token: string;
  delivery_method: DeliveryMethod | null;
  scheduled_reveal_at: string | null;
  delivered_at: string | null;
  first_opened_at: string | null;
  tier: Tier;
  stripe_payment_id: string | null;
  expires_at: string | null;
  reaction_cam_enabled?: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  creation_id: string;
  storage_path: string;
  thumbnail_path: string | null;
  original_filename: string | null;
  caption: string | null;
  sort_order: number;
  exif_date: string | null;
  watercolor_path: string | null;
  illustration_path: string | null;
  ai_description: string | null;
  created_at: string;
}

export interface GiftMoment {
  id: string;
  creation_id: string;
  gift_type: GiftType;
  description: string;
  details: Record<string, unknown>;
  message: string | null;
  illustration_url: string | null;
  reveal_style: RevealStyle;
  sort_order: number;
  position: string;
  created_at: string;
}

export interface DripClue {
  id: string;
  creation_id: string;
  clue_number: number;
  clue_type: ClueType;
  content: string;
  scheduled_at: string;
  delivered_at: string | null;
  opened_at: string | null;
  created_at: string;
}

export interface Collaborator {
  id: string;
  creation_id: string;
  invite_token: string;
  name: string | null;
  email: string | null;
  profile_id: string | null;
  interview_answers: Record<string, string>;
  status: CollaboratorStatus;
  created_at: string;
}

export interface RecipientInteraction {
  id: string;
  creation_id: string;
  interaction_type: InteractionType;
  content: string | null;
  recipient_profile_id: string | null;
  created_at: string;
}

export interface MusicTrack {
  id: string;
  name: string;
  mood: string;
  category: string;
  file_url: string;
  duration_seconds: number;
  attribution: string | null;
}

export interface PromptQuestion {
  id: string;
  relationship_type: RelationshipType;
  question_text: string;
  placeholder_example: string | null;
  sort_order: number;
  is_active: boolean;
  skip_rate: number;
  avg_answer_length: number;
  emotional_impact_score: number;
}

export interface OccasionReminder {
  id: string;
  profile_id: string;
  recipient_name: string;
  occasion_type: string;
  occasion_date: string;
  remind_days_before: number;
  last_reminded_at: string | null;
  created_at: string;
}
