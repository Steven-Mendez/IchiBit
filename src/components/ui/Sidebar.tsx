import { useStore } from '@nanostores/preact';
import { currentPageIndex, activeSectionId, setPage, navigateToSection } from '../../store/lesson';
import { progressStore } from '../../store/progress';

interface Section {
  id: string;
  title: string;
}

interface Page {
  title: string;
  sections?: Section[];
}

interface Lesson {
  id: string;
  data: {
    chapterNumber: number;
    title: string;
    pages?: Page[];
  };
}

interface Props {
  lessons: Lesson[];
  currentId?: string;
}

export default function Sidebar({ lessons, currentId }: Props) {
  const $currentPage = useStore(currentPageIndex);
  const $activeSection = useStore(activeSectionId);
  const $progress = useStore(progressStore);

  const activities = $progress?.activities ?? {};

  return (
    <aside class="w-full flex flex-col gap-2">
      <h2 class="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 px-2">
        Ruta de Aprendizaje
      </h2>
      <nav class="flex flex-col gap-1">
        {lessons.map((lesson) => {
          const isChapterActive = lesson.id === currentId;

          return (
            <div key={lesson.id} class="flex flex-col gap-1">
              {/* Capítulo */}
              <a
                href={`/lessons/${lesson.id}`}
                class={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all
                  ${isChapterActive 
                    ? 'bg-[#F43F5E]/10 text-[#F43F5E]' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }
                `}
              >
                <span class={`
                  w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black border
                  ${isChapterActive 
                    ? 'bg-[#F43F5E] text-white border-[#F43F5E]' 
                    : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'
                  }
                `}>
                  {lesson.data.chapterNumber}
                </span>
                <span class="truncate flex-1">{lesson.data.title}</span>
              </a>

              {/* Páginas y Secciones (Solo si el capítulo está activo) */}
              {isChapterActive && lesson.data.pages && (
                <div class="ml-9 flex flex-col gap-1 mt-1 relative pl-4">
                  {/* Indicador Dinámico (Línea que se mueve) */}
                  <div class="absolute left-0 top-0 bottom-0 w-0.5 bg-zinc-100 dark:bg-zinc-800" />
                  
                  {lesson.data.pages.map((page, pIdx) => {
                    const isPageActive = $currentPage === pIdx;
                    
                    return (
                      <div key={pIdx} class="flex flex-col gap-1 relative">
                        {/* Puntito indicador para la página activa */}
                        {isPageActive && (
                          <div class="absolute -left-[17px] top-3 w-1.5 h-1.5 rounded-full bg-[#F43F5E] shadow-[0_0_8px_rgba(244,63,94,0.5)] z-10 transition-all duration-300" />
                        )}
                        
                        <button
                          onClick={() => setPage(pIdx)}
                          class={`
                            text-left py-1.5 text-xs font-medium transition-colors relative
                            ${isPageActive 
                              ? 'text-[#F43F5E]' 
                              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                            }
                          `}
                        >
                          {/* Puntito indicador para la página activa (si no hay secciones activas) */}
                          {isPageActive && !page.sections?.some(s => s.id === $activeSection) && (
                            <div class="absolute -left-[17px] top-2.5 w-1.5 h-1.5 rounded-full bg-[#F43F5E] shadow-[0_0_8px_rgba(244,63,94,0.5)] z-10 animate-in fade-in duration-300" />
                          )}
                          {page.title}
                        </button>

                        {/* Secciones (Solo si la página está activa) */}
                        {isPageActive && page.sections && (
                          <div class="flex flex-col gap-2 mt-1 mb-2 ml-2 animate-in slide-in-from-top-1 duration-200">
                            {page.sections.map((section) => {
                              const isSectionActive = $activeSection === section.id;
                              
                              return (
                                <button
                                  key={section.id}
                                  onClick={() => navigateToSection(section.id)}
                                  class={`
                                    text-left text-[11px] transition-colors relative
                                    ${isSectionActive 
                                      ? 'text-[#F43F5E] font-bold' 
                                      : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                                    }
                                  `}
                                >
                                  {isSectionActive && (
                                    <div class="absolute -left-[25px] top-1.5 w-1.5 h-1.5 rounded-full bg-[#F43F5E] shadow-[0_0_5px_rgba(244,63,94,0.4)]" />
                                  )}
                                  • {section.title}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
