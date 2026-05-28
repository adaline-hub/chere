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
## 2026-05-23 — `outputFormat === "companion"`. Label: "Voice memories". Description: "Record on
**Provider:** claude
**Rationale:** (auto-detected)
**Source:** Here's the prompt:

---

# Task: Per-memory voice recordings for Interactive Scene

Working dir: `/Users/lindsaylynn/Developer/Chère`. Code in `chere/` (Next.js 16 — see `chere/node_modules/next/dist/docs/` for unfamiliar APIs).

## Context

Chère is a tribute-gift app. The "Interactive Scene" outpu

---
## 2026-05-23 — scene (kitchen / living-room / backyard / cafe) and can record one short clip pe
**Provider:** claude
**Rationale:** (auto-detected)
**Source:** Here are all three prompts. Send them one at a time in this order — there are no hard dependencies but #3 will get easier if walkthrough mode is built first since it'll need consistent audio handling.

---

# PROMPT 1 — Walkthrough auto-play mode for all 5 formats

Working dir: `/Users/lindsaylynn/D

---
## 2026-05-25 — use the leaked key.
**Provider:** claude
**Rationale:** (auto-detected)
**Source:** ## ⚠️ Security first — rotate that Groq key

You pasted your live `GROQ_API_KEY` into chat. That's now in the conversation transcript, which is logged. **Treat it as compromised** — go to `console.groq.com/keys`, revoke it, generate a new one, and add the new one via `vercel env add GROQ_API_KEY` (C

---
## 2026-05-25 — it until the visuals are upgraded. Keep all the code intact; just don't show it
**Provider:** claude
**Rationale:** (auto-detected)
**Source:** You're right, I didn't — I cut off after setting up the work. Apologies. Here are the three prompts.

---

# PROMPT A — Polish: hide Interactive Scene + Storybook fixes

Working dir: `/Users/lindsaylynn/Developer/Chère`. Code in `chere/` (Next.js 16 — see `chere/node_modules/next/dist/docs/` for unf

---
## 2026-05-26 — outputFormat. When
**Provider:** claude
**Rationale:** (auto-detected)
**Source:** ```
PROMPT — Finish Interactive Recipe Book (Prompt C wrap-up)

Working dir: /Users/lindsaylynn/Developer/Chère. Code in chere/ (Next.js 16).

Context: Most of the Recipe Book feature was already built in a prior session
(migration 005, lib/recipes, 6 API routes, RecipeBookRenderer, FormatPicker
ent

---
## 2026-05-28 — keep them somewhere safe."
**Provider:** claude
**Rationale:** (auto-detected)
**Source:** ```
PROMPT — Recipe Book v1.1: fix permissions, add intro step, warmer renderer

Working dir: /Users/lindsaylynn/Developer/Chère/chere.

Context: Recipe Book launched in commit 618665a but has two problems:
(a) "Failed" error when adding a recipe — Postgres code 42501 because the
service_role has no

---
