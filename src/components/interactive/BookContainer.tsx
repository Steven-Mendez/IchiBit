import { createContext } from 'preact';
import { useContext, useEffect, useRef, useState } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import {
  currentPageIndex,
  sectionNavigationTarget,
  setPage,
  setSectionFromScroll,
  clearSectionNavigationTarget,
} from '../../store/lesson';

const LessonContext = createContext<{ chapterId: number }>({ chapterId: 0 });

export const useLesson = () => useContext(LessonContext);

interface Props {
  chapterId: number;
  children: any;
}

export default function BookContainer({ chapterId, children }: Props) {
  const $currentPage = useStore(currentPageIndex);
  const $sectionNavigationTarget = useStore(sectionNavigationTarget);
  const [totalPages, setTotalPages] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const getPageFromUrl = () => {
    if (typeof window === 'undefined') return null;
    const raw = new URL(window.location.href).searchParams.get('page');
    if (!raw) return null;
    const parsed = Number(raw);
    if (!Number.isInteger(parsed) || parsed < 1) return null;
    return parsed - 1; // URL is 1-based, store is 0-based
  };

  // Inicializa página desde la URL (o primera página)
  useEffect(() => {
    const pageFromUrl = getPageFromUrl();
    setPage(pageFromUrl ?? 0);
  }, []);

  // Contamos las páginas reales una vez que el DOM está hidratado
  useEffect(() => {
    if (containerRef.current) {
      const pages = containerRef.current.querySelectorAll('.book-page');
      setTotalPages(pages.length);
    }
  }, [children]);

  // Scroll al inicio del contenido al cambiar de página
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [$currentPage]);

  // Sincroniza la página actual en la URL como ?page=N
  useEffect(() => {
    if (typeof window === 'undefined' || totalPages === 0) return;

    const clampedIndex = Math.max(0, Math.min($currentPage, totalPages - 1));
    if (clampedIndex !== $currentPage) {
      setPage(clampedIndex);
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set('page', String(clampedIndex + 1));
    window.history.replaceState({}, '', url.toString());
  }, [$currentPage, totalPages]);

  // ScrollSpy: Detectar sección activa al scrollear
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    // Disconnect previous observers (handled by cleanup)
    const observerOptions = {
      root: content,
      rootMargin: '-10% 0px -85% 0px', // Crea una línea de activación cerca del top
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Elegimos la sección intersectando mas cercana al top del contenedor
      const activeEntry = entries
        .filter((entry) => entry.isIntersecting && entry.target.id)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

      if (activeEntry?.target.id) {
        setSectionFromScroll(activeEntry.target.id);
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Buscamos la página actual visible
    const pages = content.querySelectorAll('.book-page');
    const currentPageEl = pages[$currentPage];

    if (currentPageEl) {
      // Priorizamos hijos directos con ID (secciones de la leccion)
      const directChildrenWithId = Array.from(currentPageEl.children).filter(
        (el): el is HTMLElement => el instanceof HTMLElement && Boolean(el.id)
      );

      // Fallback para lecciones viejas con IDs anidados
      const nestedElementsWithId = Array.from(currentPageEl.querySelectorAll('[id]')).filter(
        (el): el is HTMLElement => el instanceof HTMLElement
      );

      const elementsWithId = directChildrenWithId.length > 0 ? directChildrenWithId : nestedElementsWithId;
      elementsWithId.forEach(el => observer.observe(el));
      
      // Si la página tiene ID, lo tomamos como fallback inicial
      if (currentPageEl.id) {
        setSectionFromScroll(currentPageEl.id);
      } else if (elementsWithId.length > 0) {
        // O tomamos el primer ID que encontremos en la página
        setSectionFromScroll(elementsWithId[0].id);
      }
    }

    return () => observer.disconnect();
  }, [$currentPage, children]);

  // Manejar scroll a secciones SOLO cuando viene de click en sidebar
  useEffect(() => {
    if ($sectionNavigationTarget && contentRef.current) {
      const content = contentRef.current;
      const pages = content.querySelectorAll('.book-page');
      const currentPageEl = pages[$currentPage];

      if (currentPageEl) {
        const escapedId =
          typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
            ? CSS.escape($sectionNavigationTarget)
            : $sectionNavigationTarget.replace(/"/g, '\\"');
        const selector = `#${escapedId}`;
        const element = currentPageEl.querySelector(selector) as HTMLElement | null;

        if (element) {
          const containerRect = content.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          const nextTop = content.scrollTop + (elementRect.top - containerRect.top);
          content.scrollTo({ top: nextTop, behavior: 'smooth' });
        }
      }
      clearSectionNavigationTarget();
    }
  }, [$sectionNavigationTarget, $currentPage]);

  const nextPage = () => {
    if ($currentPage < totalPages - 1) setPage($currentPage + 1);
  };

  const prevPage = () => {
    if ($currentPage > 0) setPage($currentPage - 1);
  };

  return (
    <LessonContext.Provider value={{ chapterId }}>
      <div ref={containerRef} class="flex-1 flex flex-col min-h-0 relative p-0 overflow-visible">
        {/* Inyectamos CSS para controlar la visibilidad de las páginas en el slot de Astro */}
        <style>{`
          .book-page { display: none; min-height: 100%; }
          .book-page:nth-of-type(${$currentPage + 1}) { display: flex !important; flex-direction: column; }
        `}</style>

        {/* Contenido de la Página (Slot de Astro) - Ahora con Scroll Interno */}
        <div
          ref={contentRef}
          class="flex-1 overflow-y-auto pr-2 md:pr-3 custom-scrollbar animate-in fade-in slide-in-from-right-4 duration-500"
          style="scrollbar-gutter: stable;"
        >
          {children}
        </div>

        {/* Controles de Navegación Estilo Libro */}
        <div class="flex items-center justify-between w-full mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={prevPage}
            disabled={$currentPage === 0}
            class={`
              group h-10 flex items-center gap-2 px-4 rounded-xl font-semibold text-sm transition-all border
              ${$currentPage === 0 
                ? 'opacity-40 pointer-events-none bg-zinc-100 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500'
                : 'bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700/70'
              }
            `}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <span class="hidden sm:inline">Anterior</span>
          </button>

          <div class="h-10 flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800/50 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700/50 max-w-[68%]">
            <span class="text-xs font-bold text-zinc-600 dark:text-zinc-300 tabular-nums whitespace-nowrap">
              {$currentPage + 1}/{totalPages || 1}
            </span>
            <div class="flex items-center gap-1.5 overflow-x-auto overflow-y-hidden custom-scrollbar-compact scrollbar-hidden py-1">
              {Array.from({ length: totalPages || 1 }).map((_, index) => {
                const isActive = index === $currentPage;
                const isVisited = index < $currentPage;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setPage(index)}
                    aria-label={`Ir a pagina ${index + 1}`}
                    class={`
                      h-2 rounded-full transition-all shrink-0
                      ${isActive
                        ? 'w-9 bg-[#F43F5E]'
                        : isVisited
                          ? 'w-5 bg-[#F43F5E]/40 hover:bg-[#F43F5E]/60'
                          : 'w-5 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600'
                      }
                    `}
                  />
                );
              })}
            </div>
          </div>

          <button
            onClick={nextPage}
            disabled={$currentPage === totalPages - 1}
            class={`
              group h-10 flex items-center gap-2 px-4 rounded-xl font-semibold text-sm transition-all border
              ${$currentPage === totalPages - 1
                ? 'opacity-40 pointer-events-none bg-zinc-100 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500'
                : 'bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-[#F43F5E] hover:bg-[#F43F5E]/10'
              }
            `}
          >
            <span class="hidden sm:inline">Siguiente</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
    </LessonContext.Provider>
  );
}
