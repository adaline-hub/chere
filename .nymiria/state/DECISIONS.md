# Decision Log

*Record architectural and technical decisions here.*
## 2026-05-09 — keep going." completion screen auto-advances after 2.2s
**Provider:** claude
**Rationale:** (auto-detected)
**Source:** **Build: zero errors. Committed 4 files / Pushed.**

---

**What's working and ready for Phase 3:**

- `/create` renders the wizard with a 2px gold progress line that animates between steps
- Back button appears after Step 1, wired to the correct previous step
- Step crossfades take 350ms (gentle, n

---
## 2026-05-09 — flow (9/10/11 steps).
**Provider:** claude
**Rationale:** (auto-detected)
**Source:** Committed 5 files / Pushed. Zero TypeScript errors.

**What's working:**

Full wizard flow is wired: tribute (type → relationship → interview → photos → format), gift_reveal (type → relationship → gift → photos → clues → format), combined (all 7 steps). Back button navigates correctly through each p

---
## 2026-05-10 — template (photos grid, tribute text, gift card, dedication, watermark), with "Th
**Provider:** claude
**Rationale:** (auto-detected)
**Source:** Clean build. All four Phase 4 additions are in place:

- **`/api/ai/generate-text`** — POST route calling `generateTributeText()`, returns `{ text }`, handles validation and errors
- **`CustomizeStep`** — auto-triggers generation on mount if no text exists, shows the scanning gold-line loader with r

---
## 2026-05-12 — try again.`
**Provider:** codex
**Rationale:** (auto-detected)
**Source:** Implemented and validated the requested polish/QA items.

Updated files:
- [FormatPicker.tsx](/Users/lindsaylynn/Developer/Chère/chere/src/components/creation/FormatPicker.tsx)
- [PhotoUploader.tsx](/Users/lindsaylynn/Developer/Chère/chere/src/components/creation/PhotoUploader.tsx)
- [CustomizeSte

---
## 2026-05-13 — tone does nothing (keeps current cached/edited state).
**Provider:** codex
**Rationale:** (auto-detected)
**Source:** Updated as requested in [CustomizeStep.tsx](/Users/lindsaylynn/Developer/Chère/chere/src/components/creation/CustomizeStep.tsx).

Removed the `Regenerate` button and its force-regenerate logic. Tone selection is now the only path to regenerate/switch text.

Caching behavior remains per-tone and now

---
## 2026-05-13 — - Wired into `PreviewStep` and `_experience.tsx` for both wizard preview and sha
**Provider:** claude
**Rationale:** (auto-detected)
**Source:** All three workstreams deployed. Here's what shipped:

**Workstream 1 — Design Polish**
- Preview frames now have a cream background so no checkerboard shows through
- Memory Wrapped was escaping the phone frame via `position: fixed` — fixed with a `preview` prop that switches to `min-h-screen` flow 

---
## 2026-05-20 — one expands the recorder UI below.
**Provider:** claude
**Rationale:** (auto-detected)
**Source:** Let me think through this carefully — this is a meaningful feature, not just an audio toggle. Sharing how I'd design it before building anything.

## Operating principles

A few things I'm holding as true while designing this:

- **Audio is the most emotionally heavy feature you'll ship.** A recipie

---
## 2026-05-20 — also use it for **the AI narration mode** (option #3 in the audio feature). Righ
**Provider:** claude
**Rationale:** (auto-detected)
**Source:** Great news — your MiniMax key covers everything we need, and unlocks a bonus upgrade.

## MiniMax does both TTS and STT

MiniMax Speech 2.5 (released mid-2025, refreshed to 2.6 in March 2026) does **speech-to-text** in addition to their well-known TTS. Same key, same provider, real-time transcriptio

---
## 2026-05-23 — "AI narration" in the wizard immediately fires `/api/audio/tts` so the URL is re
**Provider:** claude
**Rationale:** (auto-detected)
**Source:** ## Shipped — UI chunk in production

9 files changed, ~975 lines added. Typecheck clean. Pushed to `main`, prod deploy kicked off.

### What's live on chere.app

- **`VoiceRecorder.tsx`** — full recording UI: tap-to-record button, 3-2-1 countdown, pulsing red dot + timer during recording, soft "wrap

---
