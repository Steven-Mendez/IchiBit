# IchiBit 🇯🇵

IchiBit is a **personal learning journal** built to help me master Japanese as a native Spanish speaker. It follows the **Feynman Technique**: by building this interactive roadmap and explaining concepts in my own words, I can better understand and remember my lessons.

While this project is primarily **made for me, by me**, it is open-source in case my path can help other Spanish-speaking students on their own journey.

## 🚀 Core Technologies

- **Framework:** [Astro](https://astro.build/) (Static Site Generation)
- **Content:** [MDX](https://mdxjs.com/) for interactive lessons.
- **UI:** Preact (for interactive widgets).
- **Styling:** Tailwind CSS.
- **State Management:** [Nano Stores](https://github.com/nanostores/nanostores) with `localStorage` persistence.

## 📖 Project Structure

- `src/content/lessons/`: MDX format lessons.
- `src/components/interactive/`: Preact components (Quiz, Flashcards, Roadmap).
- `src/components/ui/`: Core interface components.
- `src/store/`: Global state management (user progress).

## 🛠️ Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## 📏 Conventions and Progression Rules

- **Progression:** The learning path is open and self-paced. All chapters are unlocked by default.
- **Activity Signals:** The roadmap and sidebar display practice status based on your activities:
  - 📝 **Quiz Practiced**
  - 🗂️ **Flashcards Reviewed**
  - ✍️ **Writing Practiced**
- **Drafts:** Lessons with `isDraft: true` in their frontmatter will be hidden from the roadmap.
- **Furigana:** Use of `<ruby>` tags is encouraged for Kanji readings (e.g., `<ruby>一<rt>ichi</rt></ruby>`).
- **Interactive Widgets:** All interactive widgets (quizzes, flashcards, etc.) should be wrapped in a `<BookContainer>` component in the MDX.

## ⚡ Performance and Architecture

- **Smooth Navigation:** Uses Astro's View Transitions for seamless chapter-to-chapter transitions.
- **Efficient Hydration:** Components use `client:idle` or `client:visible` where possible to minimize initial load time.
- **State Management:** Persistence is local-only via Nano Stores, tracking discrete activities rather than global scores.
- **Inverted Dependency:** Widgets are re-usable UI components that communicate with the domain layer through clean context-based boundaries.

## 📄 License

This project is licensed under the **PolyForm Noncommercial License 1.0.0**. 

- **Personal Use:** You are welcome to fork and use this for your own learning.
- **Non-Commercial:** You may **not** sell this project or use it for commercial purposes.
- **Attribution:** Please keep the original attribution to the creator.

See the [LICENSE](LICENSE) file for the full terms.

---
© 2026 IchiBit - Aprendamos japonés juntos.
