# IchiBit Project Context

## Project Overview
**IchiBit** is an interactive web-based learning journal designed to document a journey in learning Japanese. It serves as both an active learning tool for the creator (using the Feynman Technique) and a roadmap for other beginner students, particularly Spanish speakers.

### Core Technologies
- **Framework:** [Astro](https://astro.build/) (Static Site Generation with selective hydration).
- **Content:** [MDX](https://mdxjs.com/) (Markdown + JSX) for lesson content and interactive components.
- **UI Interactivity:** [Preact](https://preactjs.com/) for lightweight interactive widgets (Quizzes, Flashcards).
- **Styling:** [Tailwind CSS](https://tailwindcss.com/).
- **State Management:** [Nano Stores](https://github.com/nanostores/nanostores) with `@nanostores/persistent` for browser `localStorage` progress tracking.
- **Visual Effects:** `canvas-confetti` for achievement celebrations.

## Directory Structure
```text
├── src/
│   ├── components/
│   │   ├── interactive/     # Preact components (QuizModule, FlashcardDeck, BookContainer, ComparisonTable, TermTooltip, AudioPlayButton, KanaKanjiDrawingPad)
│   │   └── ui/              # Global UI components (Sidebar)
│   ├── content/
│   │   └── lessons/         # MDX files (chapter-1.mdx, etc.)
│   ├── layouts/             # MainLayout.astro
│   ├── pages/               # index.astro (Roadmap), lessons/[slug].astro (Dynamic lessons)
│   ├── store/               # Nano Stores (progress.ts, lesson.ts)
│   └── styles/              # global.css (Tailwind)
├── public/                  # Static assets (Favicons, etc.)
├── astro.config.mjs         # Astro Configuration
└── package.json             # Dependencies and Scripts

## Building and Running
- **Install dependencies:** `npm install`
- **Start development server:** `npm run dev`
- **Build for production:** `npm run build`
- **Preview production build:** `npm run preview`

## Development Conventions

### Content Management (MDX)
- **Frontmatter Schema:** defined in `src/content.config.ts`.
  - `chapterNumber`: (number) used for sequencing and unlocking.
  - `title`: (string) Lesson title.
  - `description`: (string) Brief overview.
  - `isDraft`: (boolean) If true, the lesson is hidden from the roadmap.
- **Interactive Components:** Use `<BookContainer client:load>` wrapping `<Page>` components to create the "book-like" interactive experience.
- **Furigana:** Use `<ruby>` tags for Japanese characters (Kanji with Hiragana readings). Example: `<ruby>一<rt>ichi</rt></ruby>`.

### New Lesson Capabilities
- **ComparisonTable:** Responsive side-by-side comparison.
  ```jsx
  <ComparisonTable 
    columns={['Español', 'Japonés']} 
    rows={[['Hola', 'Konnichiwa'], ['Gracias', 'Arigatou']]} 
    highlightColumn={1}
  />
  ```
- **TermTooltip:** Inline hints for terms.
  ```jsx
  <TermTooltip term="Neko" reading="ねこ" meaning="Gato" example="Neko ga suki desu." />
  ```
- **AudioPlayButton:** Pronunciation support.
  ```jsx
  <AudioPlayButton src="/audio/hello.mp3" label="Escuchar" />
  ```
- **KanaKanjiDrawingPad:** Writing practice canvas.
  ```jsx
  <KanaKanjiDrawingPad character="あ" reading="a" strokes={3} />
  ```

### Interactivity
- **Persistence:** User progress (completed chapters, quiz scores) is stored in `localStorage` via `ichibit_progress_v1`.
- **Completion:** A chapter is marked as completed if the user scores at least **80%** on the associated `QuizModule`.
- **Hydration:** Always use appropriate Astro hydration directives (e.g., `client:visible` for quizzes at the bottom of pages, `client:load` for layout containers).

### Styling
- Follow a mobile-first, clean aesthetic using Tailwind CSS.
- Primary accent color: `#F43F5E` (Rose 500).
- Support for Dark Mode using Tailwind's `dark:` modifier.

## Key Files
- `src/content.config.ts`: Defines the Zod schema for MDX lessons.
- `src/store/progress.ts`: Contains the logic for tracking completed lessons and scores.
- `src/components/interactive/QuizModule.tsx`: The core assessment component.
- `src/components/interactive/FlashcardDeck.tsx`: Review component for vocabulary.
- `src/components/interactive/ComparisonTable.tsx`: For side-by-side grammar/vocab comparisons.
- `src/components/interactive/TermTooltip.tsx`: Inline contextual hints.
- `src/components/interactive/AudioPlayButton.tsx`: Audio playback for listening practice.
- `src/components/interactive/KanaKanjiDrawingPad.tsx`: Canvas-based writing practice.

