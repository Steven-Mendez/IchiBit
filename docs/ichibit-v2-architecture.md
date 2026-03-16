# IchiBit V2 Architecture and Authoring Contract

This document specifies the updated architecture (V2) for IchiBit, focusing on performance, decoupled state, and authoring consistency.

## 🏗️ Architecture Principles

### 1. Decoupled Widgets (SOLID)
Widgets (`QuizModule`, `FlashcardDeck`, `KanaKanjiDrawingPad`) are pure UI components that do not manage persistence directly. Instead, they:
- Use the `useLesson()` context to obtain the current `chapterId`.
- Emit outcomes through the domain layer (`markActivity` from `store/progress.ts`).
- Are hydration-agnostic, preferring `client:idle` or `client:visible`.

### 2. Canonical Metadata (Lesson Contract)
To prevent content drift, the **Frontmatter** in MDX files is the single source of truth:
- `chapterNumber`: Used as the unique identifier for activity tracking.
- `pages`: Defines the internal navigation structure.
- **Contract:** Every chapter MDX *must* wrap its content in a `<BookContainer client:idle chapterId={frontmatter.chapterNumber}>` component.

### 3. Activity-Based Gamification
The legacy score/progression model (80% unlock) is replaced by **discrete activity tracking**:
- **quizPracticed**: Triggered when a quiz is finished.
- **flashcardsReviewed**: Triggered when cards are flipped or navigated.
- **drawingCompleted**: Triggered when a drawing stroke is completed.
- **chapterReviewed**: (Optional) manually marked by user.

## 🚀 Performance Guardrails

### 1. Hydration Strategy
- `BookContainer`: Should use `client:idle` to avoid blocking the initial paint of the lesson shell.
- Interactive Widgets: Use `client:visible` for components below the fold (like Quizzes at the end of the lesson).
- Sidebar: Consolidated into a single island per layout with `client:idle`.

### 2. Navigation
- All navigation is handled by **Astro View Transitions** (via `<ClientRouter />`).
- Avoid hard `<a>` reloads where possible to preserve application state and perceived speed.

### 3. Bundle Hygiene
- Use **dynamic imports** for heavy libraries that are only needed on interaction (e.g., `canvas-confetti`).
- Avoid adding heavy dependencies to the common entry points.

## ✍️ Authoring Workflow

### New Lesson Template
```mdx
---
chapterNumber: 3
title: "Lesson Title"
description: "Brief overview."
isDraft: false
pages:
  - title: "Section 1"
---
import BookContainer from '../../components/interactive/BookContainer';
import Page from '../../components/interactive/Page';
import QuizModule from '../../components/interactive/QuizModule';

<BookContainer client:idle chapterId={frontmatter.chapterNumber}>
  <Page>
    ## Content
    ...
    <QuizModule client:visible questions={[...]} />
  </Page>
</BookContainer>
```

### Validation Guardrails
- Run `npm run check` to validate Astro/MDX schemas.
- Ensure `chapterNumber` in frontmatter matches the filename/sequence.
- Verify all interactive widgets are within the `<BookContainer>`.
