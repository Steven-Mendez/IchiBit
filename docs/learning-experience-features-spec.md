# IchiBit Learning Experience Features

## Context

This document defines how to add four new lesson capabilities to IchiBit chapter pages:

1. Tooltips for inline explanations.
2. Audio playback for pronunciation and listening support.
3. Character drawing practice (hiragana, katakana, kanji).
4. Comparison tables for grammar and vocabulary contrasts.

It is aligned with the current project architecture:

- Astro static site with MDX content lessons.
- Interactive widgets in Preact.
- Styling with Tailwind + typography plugin.
- Local persistence through Nano Stores + `localStorage`.
- Existing chapter flow based on `BookContainer` + `Page` in MDX lessons.

---

## PRD (Product Requirements Document)

### Problem Statement

Current lessons already support rich text, furigana, flashcards, and quizzes, but they lack:

- quick contextual hints (tooltips),
- listening support (audio),
- writing practice (drawing characters),
- compact side-by-side comparisons (tables).

These gaps reduce comprehension speed and active practice quality, especially for a beginner-focused Japanese learning path.

### Goals

- Improve comprehension without breaking reading flow.
- Increase retention with multimodal learning (read, hear, draw, compare).
- Keep authoring simple for MDX lesson creation.
- Preserve the current minimal UI style and chapter progression.

### Non-Goals (Phase 1)

- No backend, account system, or cloud sync.
- No AI handwriting evaluation.
- No advanced spaced repetition redesign.
- No offline-first PWA behavior beyond normal browser caching.

### Target Users

- Primary: Spanish-speaking beginner learning Japanese (project owner profile).
- Secondary: self-learners using the open-source lesson flow.

### User Stories

- As a learner, I want to hover/tap unknown terms and see short explanations so I can keep reading.
- As a learner, I want to hear word pronunciation so I can improve listening and speaking.
- As a learner, I want to practice writing characters with stroke guidance so I can build muscle memory.
- As a learner, I want visual comparison tables so I can quickly understand differences (formal/informal, particles, scripts, etc.).
- As a lesson author, I want reusable MDX blocks with simple props so adding content is fast.

### Feature Requirements (High-Level)

1. **Tooltips**
   - Inline trigger in lesson text.
   - Rich content support: meaning, reading, note, optional example.
   - Desktop hover + mobile tap behavior.
   - Accessibility support (keyboard + screen reader labels).

2. **Audio**
   - Per-word or per-phrase play button.
   - Optional slow speed mode.
   - Visual loading and playback states.
   - Graceful fallback when audio file is missing.

3. **Character Drawing**
   - Canvas practice area with template guide.
   - Stroke order hint mode (on/off).
   - Reset and undo actions.
   - Optional "trace first, free draw second" practice mode.

4. **Comparison Tables**
   - Reusable table block with responsive behavior.
   - Sticky header on desktop where possible.
   - Horizontal scroll on small screens.
   - Support highlighting "recommended form" or "common mistake".

### Success Metrics (MVP)

- >= 80% of new lesson pages use at least one of the new components.
- >= 30% reduction in quiz errors on terms that include tooltip/audio support (manual before/after comparison).
- >= 50% of users who open drawing exercises complete at least one full trace cycle (tracked locally in analytics store, optional in phase 1.5).
- No significant visual regressions in current chapter pages.

### Release Plan

- **Phase 1 (MVP):** Tooltips + Audio + ComparisonTable.
- **Phase 2:** DrawingPad with guide overlays and local progress markers.
- **Phase 3:** Enhanced feedback and per-character mastery tracking.

---

## UX/UI Design Specification

### Design Principles (Based on Current UI)

- Maintain IchiBit visual identity:
  - Accent color `#F43F5E`.
  - Neutral zinc palette for surfaces.
  - Rounded cards and subtle borders.
  - Soft elevation and clean typography (`Inter` + `Noto Sans JP`).
- Keep interaction lightweight and non-intrusive.
- Prioritize readability inside existing `prose` lesson pages.

### Component-Level UX

1. **Tooltip UX**
   - Trigger style: dotted underline + subtle accent hover.
   - Desktop: appears on hover/focus.
   - Mobile: single tap opens, outside tap closes.
   - Max width with multiline support.
   - Content hierarchy:
     - term (bold),
     - reading (muted accent),
     - meaning (main),
     - note/example (muted).

2. **Audio UX**
   - Small icon button near term/card title.
   - States:
     - idle (play icon),
     - loading (spinner),
     - playing (animated indicator),
     - error (warning icon + tooltip text).
   - Keyboard activation and aria labels required.
   - Should not auto-play on page load.

3. **Drawing UX**
   - Dedicated card block inside a lesson page.
   - Top row: character, reading, stroke count.
   - Center: square practice canvas with guide lines.
   - Bottom controls: undo, clear, show/hide guide, next character.
   - Optional completion check:
     - learner confirms manually ("I completed this").

4. **Comparison Table UX**
   - Card container consistent with existing chapter blocks.
   - Dense but readable: medium row height, clear headers.
   - Column emphasis option using accent-tinted background.
   - Mobile-first with horizontal scroll and visible affordance.

### Accessibility

- Minimum contrast ratio AA in light and dark themes.
- All controls reachable by keyboard.
- Tooltip content accessible to screen readers.
- Audio buttons with meaningful `aria-label`.
- Canvas practice accompanied by text instructions.

### Content Authoring UX (for MDX)

- Lesson author inserts semantic components inside existing `<Page>` blocks.
- Components should accept clear Spanish-friendly props naming (or bilingual docs).
- Recommended docs include "copy-paste recipes" for common lesson patterns:
  - term + tooltip + audio,
  - script practice block,
  - formal vs informal table.

---

## TDD (Technical Design Document)

### Current Architecture Alignment

- Render path today:
  - `src/content/lessons/*.mdx` -> `src/pages/lessons/[slug].astro` -> `MainLayout` + `BookContainer`.
- Interactivity pattern today:
  - Preact components with `client:visible` / `client:load`.
- State today:
  - Global lesson navigation in `src/store/lesson.ts`.
  - Progress persistence in `src/store/progress.ts`.

New features should follow this pattern with isolated interactive components under `src/components/interactive/`.

### Proposed New Components

1. `TermTooltip` (interactive)
   - Props: `term`, `reading?`, `meaning`, `note?`, `example?`.
   - Behavior: hover/focus/tap trigger.

2. `AudioPlayButton` (interactive)
   - Props: `src`, `label`, `playbackRates?`.
   - Handles loading/play/error states.

3. `KanaKanjiDrawingPad` (interactive)
   - Props: `character`, `reading`, `strokes?`, `gridType?`, `guideSvg?`.
   - Canvas-based draw controls.

4. `ComparisonTable` (mostly presentational, optional interactivity)
   - Props: `columns`, `rows`, `highlightColumn?`, `caption?`.

### MDX Integration Strategy

- Keep lessons as MDX-first content.
- Import components at top of chapter files as done for `FlashcardDeck` and `QuizModule`.
- Use components inside existing `<Page>` boundaries to preserve `BookContainer` pagination behavior.

### Content Schema Evolution

Keep current frontmatter stable for MVP. Optional future extension in `src/content.config.ts`:

- `assets.audioBasePath` per lesson.
- `practiceCharacters` metadata for drawing sets.

This can be deferred if props are fully inline in MDX.

### State and Persistence

- Do not overload current progression rules.
- Add optional local practice store (new Nano Store key versioned, e.g. `ichibit_practice_v1`) for:
  - attempted characters,
  - optional completion flags,
  - last used playback speed.

### Performance and Delivery

- Lazy hydrate interactive widgets with `client:visible` where possible.
- Keep audio assets compressed and organized under `public/audio/...`.
- Drawing guides should be SVG or lightweight JSON paths.
- Avoid large third-party libraries if browser APIs are sufficient.

### Error Handling

- Missing audio: show non-blocking UI message and continue lesson.
- Canvas unsupported: fallback text + printable tracing recommendation.
- Invalid table data: fail gracefully with clear author-facing warning in docs.

### Security and Privacy

- No external tracking required for MVP.
- All progress remains local in browser `localStorage`.
- If external audio CDN is used later, include CORS and privacy notes.

### Suggested Implementation Sequence

1. Build `ComparisonTable` first (lowest risk, immediate lesson value).
2. Add `TermTooltip`.
3. Add `AudioPlayButton`.
4. Add `KanaKanjiDrawingPad` (highest complexity).
5. Add documentation examples for lesson authors.

### Testing Strategy (Technical)

- Unit:
  - component state transitions (tooltip open/close, audio states).
- Interaction:
  - keyboard navigation and focus behavior.
- Visual:
  - light/dark theme snapshots for all components.
- Content integration:
  - render sample MDX page with all new components inside `BookContainer`.
- Manual QA:
  - desktop + mobile tooltip behavior,
  - audio playback fallback,
  - drawing controls reset/undo.

---

## SRS (Software Requirements Specification)

### 1. Scope

The system shall extend lesson page capabilities with tooltip, audio, drawing, and comparison table modules while preserving current chapter navigation, progression, and styling consistency.

### 2. Functional Requirements

- **FR-1 Tooltip Rendering:** The system shall display inline tooltip content on supported triggers.
- **FR-2 Tooltip Access:** The system shall support mouse, touch, and keyboard activation.
- **FR-3 Audio Playback:** The system shall play lesson-linked audio clips on user action.
- **FR-4 Audio Feedback:** The system shall indicate loading, playing, paused, and error states.
- **FR-5 Drawing Input:** The system shall provide a drawable area for character practice.
- **FR-6 Drawing Controls:** The system shall support at least clear and undo actions.
- **FR-7 Comparison Tables:** The system shall render responsive comparison tables from structured input.
- **FR-8 MDX Compatibility:** The system shall allow authors to embed these features in chapter MDX files.
- **FR-9 Theme Compatibility:** The system shall render correctly in both light and dark modes.
- **FR-10 Progress Compatibility:** The system shall not break existing quiz unlock progression logic.

### 3. Non-Functional Requirements

- **NFR-1 Performance:** New components should not noticeably delay initial chapter paint; interactive code should hydrate lazily when feasible.
- **NFR-2 Usability:** First-time users should understand controls without external instructions.
- **NFR-3 Maintainability:** Components must remain modular and documented for reuse.
- **NFR-4 Reliability:** Missing media/assets shall degrade gracefully without blocking lesson reading.
- **NFR-5 Accessibility:** Keyboard and screen reader support shall meet practical WCAG AA expectations for interactive controls.

### 4. Interfaces

- **UI Interface:** New components embedded within lesson MDX pages and styled using existing Tailwind conventions.
- **Data Interface:** Props-driven component APIs and optional Nano Store persistence.
- **Asset Interface:** Audio and guide assets served from `public/` paths.

### 5. Constraints

- Must work within Astro static generation + Preact islands.
- Must not require backend services for MVP.
- Must follow existing chapter/page structure (`BookContainer`, `Page`, `Sidebar`, lesson frontmatter).

### 6. Acceptance Criteria

- At least one lesson can include all four feature types without layout breakage.
- Mobile behavior validated for tooltip, table scrolling, and audio controls.
- Existing lessons and quiz progression continue functioning unchanged.
- Documentation includes reusable authoring patterns for future lessons.

---

## Risks and Mitigations

- **Risk:** Drawing feature scope becomes too large.
  - **Mitigation:** Ship manual-completion drawing MVP before automated feedback.
- **Risk:** Audio asset management becomes inconsistent.
  - **Mitigation:** Define strict naming/path conventions early.
- **Risk:** Tooltips cause clutter on mobile.
  - **Mitigation:** Use short content, tap-to-toggle, and max width rules.

---

## Recommended Next Decision

Before implementation, decide whether audio should be:

1. manually recorded human voice files, or
2. generated voice assets.

This decision impacts asset pipeline, quality consistency, and maintenance effort more than any other feature in this scope.
