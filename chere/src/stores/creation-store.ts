import { create } from "zustand";
import type {
  CreationType,
  RelationshipType,
  OutputFormat,
  Tier,
  GiftType,
  ClueType,
} from "@/lib/supabase/types";

// ─── Types ───────────────────────────────────────────────

interface PhotoFile {
  id: string;
  file: File;
  preview: string; // Object URL for preview
  caption: string;
  sortOrder: number;
}

interface GiftMomentDraft {
  id: string;
  giftType: GiftType;
  description: string;
  details: Record<string, string>;
  message: string;
  revealStyle: "card" | "envelope" | "ticket" | "box";
  position: "inline" | "end";
}

interface DripClueDraft {
  id: string;
  clueNumber: number;
  clueType: ClueType;
  content: string;
  scheduledAt: string; // ISO string
}

// ─── Wizard Steps ────────────────────────────────────────

export type WizardStep =
  | "type"           // Choose tribute / gift reveal / combined
  | "relationship"   // Who is this for?
  | "interview"      // Memory interview questions
  | "gift"           // Gift description (if gift_reveal or combined)
  | "photos"         // Upload photos
  | "clues"          // Drip clues setup (optional)
  | "format"         // Choose output format
  | "customize"      // Edit text, template, music
  | "preview"        // Full preview
  | "payment"        // Tier selection + Stripe
  | "deliver";       // Send it

// ─── Store ───────────────────────────────────────────────

interface CreationStore {
  // Current step
  currentStep: WizardStep;
  setStep: (step: WizardStep) => void;

  // Creation ID (set after first save to Supabase)
  creationId: string | null;
  setCreationId: (id: string) => void;

  // Step 1: Type
  creationType: CreationType | null;
  setCreationType: (type: CreationType) => void;

  // Step 2: Relationship
  relationshipType: RelationshipType | null;
  setRelationshipType: (type: RelationshipType) => void;
  recipientName: string;
  setRecipientName: (name: string) => void;

  // Step 3: Interview
  interviewAnswers: Record<string, string>;
  setInterviewAnswer: (questionId: string, answer: string) => void;

  // Step 4: Gift moments
  giftMoments: GiftMomentDraft[];
  addGiftMoment: (moment: GiftMomentDraft) => void;
  updateGiftMoment: (id: string, updates: Partial<GiftMomentDraft>) => void;
  removeGiftMoment: (id: string) => void;

  // Step 5: Photos
  photos: PhotoFile[];
  addPhotos: (photos: PhotoFile[]) => void;
  removePhoto: (id: string) => void;
  updatePhotoCaption: (id: string, caption: string) => void;
  reorderPhotos: (fromIndex: number, toIndex: number) => void;

  // Step 6: Drip clues
  dripCluesEnabled: boolean;
  setDripCluesEnabled: (enabled: boolean) => void;
  dripClues: DripClueDraft[];
  setDripClues: (clues: DripClueDraft[]) => void;

  // Step 7: Format
  outputFormat: OutputFormat | null;
  setOutputFormat: (format: OutputFormat) => void;
  templateId: string;
  setTemplateId: (id: string) => void;

  // Step 8: Customize
  generatedText: string;
  setGeneratedText: (text: string) => void;
  editedText: string | null;
  setEditedText: (text: string | null) => void;
  dedicationMessage: string;
  setDedicationMessage: (message: string) => void;
  musicTrackId: string | null;
  setMusicTrackId: (id: string | null) => void;

  // Step 9: Payment
  tier: Tier;
  setTier: (tier: Tier) => void;

  // Step 10: Delivery
  scheduledRevealAt: string | null;
  setScheduledRevealAt: (date: string | null) => void;

  // Utilities
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  reset: () => void;
}

const initialState = {
  currentStep: "type" as WizardStep,
  creationId: null,
  creationType: null,
  relationshipType: null,
  recipientName: "",
  interviewAnswers: {},
  giftMoments: [],
  photos: [],
  dripCluesEnabled: false,
  dripClues: [],
  outputFormat: null,
  templateId: "warm-linen",
  generatedText: "",
  editedText: null,
  dedicationMessage: "",
  musicTrackId: null,
  tier: "free" as Tier,
  scheduledRevealAt: null,
  isGenerating: false,
};

export const useCreationStore = create<CreationStore>((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),
  setCreationId: (id) => set({ creationId: id }),
  setCreationType: (type) => set({ creationType: type }),
  setRelationshipType: (type) => set({ relationshipType: type }),
  setRecipientName: (name) => set({ recipientName: name }),

  setInterviewAnswer: (questionId, answer) =>
    set((state) => ({
      interviewAnswers: { ...state.interviewAnswers, [questionId]: answer },
    })),

  addGiftMoment: (moment) =>
    set((state) => ({ giftMoments: [...state.giftMoments, moment] })),

  updateGiftMoment: (id, updates) =>
    set((state) => ({
      giftMoments: state.giftMoments.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),

  removeGiftMoment: (id) =>
    set((state) => ({
      giftMoments: state.giftMoments.filter((m) => m.id !== id),
    })),

  addPhotos: (newPhotos) =>
    set((state) => ({ photos: [...state.photos, ...newPhotos] })),

  removePhoto: (id) =>
    set((state) => ({
      photos: state.photos.filter((p) => p.id !== id),
    })),

  updatePhotoCaption: (id, caption) =>
    set((state) => ({
      photos: state.photos.map((p) =>
        p.id === id ? { ...p, caption } : p
      ),
    })),

  reorderPhotos: (fromIndex, toIndex) =>
    set((state) => {
      const newPhotos = [...state.photos];
      const [moved] = newPhotos.splice(fromIndex, 1);
      newPhotos.splice(toIndex, 0, moved);
      return {
        photos: newPhotos.map((p, i) => ({ ...p, sortOrder: i })),
      };
    }),

  setDripCluesEnabled: (enabled) => set({ dripCluesEnabled: enabled }),
  setDripClues: (clues) => set({ dripClues: clues }),

  setOutputFormat: (format) => set({ outputFormat: format }),
  setTemplateId: (id) => set({ templateId: id }),
  setGeneratedText: (text) => set({ generatedText: text }),
  setEditedText: (text) => set({ editedText: text }),
  setDedicationMessage: (message) => set({ dedicationMessage: message }),
  setMusicTrackId: (id) => set({ musicTrackId: id }),
  setTier: (tier) => set({ tier }),
  setScheduledRevealAt: (date) => set({ scheduledRevealAt: date }),
  setIsGenerating: (generating) => set({ isGenerating: generating }),

  reset: () => set(initialState),
}));
