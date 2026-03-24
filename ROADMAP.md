# Warm — product roadmap

North star: **help people stay in touch offline (and sometimes online)** by suggesting **what to do** and **with whom**, tuned to **interests and character**. Later, at scale: **friend-of-friend intros** and **first meetings** with consent.

This doc is the source of truth for sequencing. Phase 1 MVP is described in `Social_App_Instructions` (mostly shipped).

---

## Phase 1 — MVP (baseline)

**Status:** shipped (friends, temperature, rule-based plans, invites, public vote, events, ICS, feedback → pair weights, micro-question, graph page, deploy, analytics).

**Explicit non-goals in Phase 1:** heavy AI, full calendar sync, in-app chat, FoF graph.

---

## Phase 2a — Visual identity: “your crystal”

**Goal:** The home experience is **not a table or list** — it is a **personal, shareable crystal** of relationships with **heat** (warmth / urgency) readable at a glance.

**Delivered / in progress:**

- Dashboard uses a **radial crystal** (center = you; nodes = friends; facets + spokes; glow by temperature).
- Optional **list/table** remains on `/friends` for accessibility and power users.
- Subtle motion (pulse on cold nodes, soft presence) without requiring heavy physics libraries.

**Next in this track:**

- **Shareable snapshot:** export PNG or server-rendered OG image of the crystal (marketing, “my Warm crystal”).
- **Theming:** light/dark polish; optional accent presets for share cards.
- **Mobile:** touch targets, pinch-to-fit, reduced motion respect (`prefers-reduced-motion`).

---

## Phase 2b — Richer context + hybrid AI

**Goal:** Recommendations feel **personal** and **explainable**; AI **augments** rules, does not replace safety rails.

**Steps:**

1. **Structured + light text context** per friend (notes, extra tags, optional “energy” scale) — stored in DB, used in ranking and prompts.
2. **Hybrid planner:** keep template filter + scores; add LLM **re-rank / rewrite** `whyLine` and labels within allowed templates; optional one “wildcard” slot that still maps to a template.
3. **“This week” prioritization:** surface **who** first (temperature + cadence + optional AI one-liner), then **what** (existing plan flow).
4. **Guardrails:** server-only keys, timeouts, fallback to rules-only, no PII in logs, analytics on `plan_generated` / model version.

---

## Phase 3 — Accounts and social graph (real users)

**Goal:** Multi-user product; optional **link** between your `Friend` row and another **User** (invite to claim).

**Steps:**

- Auth (e.g. magic link) replaces single default user.
- Privacy defaults: prefs and graph visibility **minimal**; explicit sharing.
- Data model for **edges** (who knows whom) once both sides are users.

---

## Phase 4 — Friend-of-friend & intros

**Goal:** With enough users, support **warm-path intros** and **first hangouts** (double opt-in, low-stakes activity templates).

**Steps:**

- Introduction requests (no spam; capped, reversible).
- FoF ranking: mutual context, shared interests, template fit.
- Reuse invite + ICS flows for **first meeting** with a new person.

---

## How to use this file

- **Implementation order:** 2a (crystal UX) → 2b (data + AI) → 3 → 4 unless auth is blocking real tests, then pull 3 earlier.
- **Instructions:** `Social_App_Instructions` stays the historical Phase 1 day-by-day log; **this roadmap** owns what comes next.

---

## References in code

- Temperature: `lib/friends/temperature.ts`, `lib/friends/temperature-display.ts`
- Rule-based plans: `lib/planning/generate-plans.ts`, `lib/planning/activity-templates.ts`
- Pair learning: `lib/planning/pair-weights.ts`, `app/events/[id]/actions.ts`
- Crystal dashboard: `components/crystal/friends-crystal.tsx`, `app/page.tsx`
