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
