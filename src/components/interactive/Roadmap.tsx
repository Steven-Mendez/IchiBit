import { useStore } from '@nanostores/preact';
import { progressStore } from '../../store/progress';

interface Props {
  lessons: Array<{
    id: string;
    data: {
      chapterNumber: number;
      title: string;
      description: string;
    }
  }>;
}

export default function Roadmap({ lessons = [] }: Props) {
  const progress = useStore(progressStore);
  
  // Sort lessons by chapter number
  const sortedLessons = [...lessons].sort((a, b) => a.data.chapterNumber - b.data.chapterNumber);

  const activities = progress?.activities ?? {};

  return (
    <div class="flex flex-col gap-8 py-8 relative">
      {/* Decorative connecting line */}
      <div class="absolute left-1/2 top-0 bottom-0 w-1 bg-zinc-200 dark:bg-zinc-800 -translate-x-1/2 z-0 hidden md:block" />

      {sortedLessons.map((lesson) => {
        return (
          <div key={lesson.id} class="relative z-10 flex flex-col items-center">
            <a
              href={`/lessons/${lesson.id}`}
              class={`
                group w-full max-w-xl p-6 rounded-2xl border transition-all duration-300
                bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 
                hover:shadow-xl hover:-translate-y-1 flex items-center gap-6
              `}
            >
              <div class="w-16 h-16 rounded-full flex items-center justify-center shrink-0 text-xl font-bold bg-[#F43F5E] text-white">
                {lesson.data.chapterNumber}
              </div>

              <div class="flex-1">
                <div class="mb-1">
                  <span class="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Capítulo {lesson.data.chapterNumber}
                  </span>
                </div>
                <h3 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {lesson.data.title}
                </h3>
                <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  {lesson.data.description}
                </p>
              </div>

              <div class="text-[#F43F5E] transform transition-transform group-hover:translate-x-1">
                →
              </div>
            </a>
          </div>
        );
      })}
    </div>
  );
}
