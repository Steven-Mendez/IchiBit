import { useState, useEffect, useRef } from 'preact/hooks';
import { markActivity } from '../../store/progress';
import { useLesson } from './BookContainer';
import AudioPlayButton from './AudioPlayButton';
import TermTooltip from './TermTooltip';

interface CardHint {
  term?: string;
  reading?: string;
  meaning: string;
  note?: string;
  example?: string;
}

export interface Card {
  japanese: string;
  reading?: string;
  translation: string;
  audioSrc?: string;
  hint?: CardHint;
  showReading?: boolean;
}

interface Props {
  chapterId?: number;
  cards: Card[];
  size?: 'compact' | 'wide';
  defaultShowReading?: boolean;
  showReadingOnFront?: boolean;
}

export default function FlashcardDeck({
  chapterId: propChapterId,
  cards,
  size = 'compact',
  defaultShowReading = true,
  showReadingOnFront = false,
}: Props) {
  const { chapterId: contextChapterId } = useLesson();
  const chapterId = propChapterId ?? contextChapterId;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // Mark as reviewed if chapterId is provided
  useEffect(() => {
    if (chapterId && (isFlipped || currentIndex > 0)) {
      markActivity(chapterId, 'flashcardsReviewed');
    }
  }, [isFlipped, currentIndex, chapterId]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!cards || cards.length === 0) {
    return (
      <div class="my-4 p-8 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-center text-zinc-500">
        No hay tarjetas disponibles.
      </div>
    );
  }

  const handleNext = () => {
    setIsFlipped(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150) as unknown as number;
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150) as unknown as number;
  };

  const currentCard = cards[currentIndex];
  const cardSizeClass = size === 'wide' ? 'max-w-2xl' : 'max-w-sm';
  const shouldShowReading = (currentCard.showReading ?? defaultShowReading) && Boolean(currentCard.reading);

  return (
    <div class="my-4 flex flex-col items-center">
      <div 
        class={`relative w-full ${cardSizeClass} aspect-[3/2] cursor-pointer perspective-1000 group`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          class={`
            relative w-full h-full transition-transform duration-500 transform-style-3d
            ${isFlipped ? 'rotate-y-180' : ''}
          `}
        >
          {/* Front */}
          <div class="absolute inset-0 w-full h-full backface-hidden bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-lg flex flex-col items-center justify-center p-6">
            {(currentCard.audioSrc || currentCard.hint) && (
              <div class="absolute top-2 right-2 flex items-center gap-1.5 bg-white/85 dark:bg-zinc-900/85 backdrop-blur px-1.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700" onClick={(e) => e.stopPropagation()}>
                {currentCard.hint && (
                  <TermTooltip
                    term={currentCard.hint.term || 'Pista'}
                    reading={currentCard.hint.reading}
                    meaning={currentCard.hint.meaning}
                    note={currentCard.hint.note}
                    example={currentCard.hint.example}
                    triggerStyle="icon"
                    triggerLabel="?"
                  />
                )}
                {currentCard.audioSrc && (
                  <div class="scale-90 origin-center">
                    <AudioPlayButton
                      src={currentCard.audioSrc}
                      label={`Escuchar ${currentCard.reading || currentCard.japanese}`}
                    />
                  </div>
                )}
              </div>
            )}
            <span class="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">{currentCard.japanese}</span>
            {showReadingOnFront && currentCard.reading && (
              <span class="text-sm font-medium text-zinc-500 dark:text-zinc-400 -mt-2 mb-3">
                {currentCard.reading}
              </span>
            )}
            <span class="text-zinc-400 text-xs uppercase tracking-widest">Haz clic para voltear</span>
          </div>

          {/* Back */}
          <div class="absolute inset-0 w-full h-full backface-hidden bg-zinc-50 dark:bg-zinc-950 border-2 border-[#F43F5E] rounded-2xl shadow-lg flex flex-col items-center justify-center p-6 rotate-y-180">
            {shouldShowReading && (
              <span class="text-xl text-[#F43F5E] font-medium mb-1">{currentCard.reading}</span>
            )}
            <span class={`text-2xl font-bold text-zinc-900 dark:text-zinc-100 ${shouldShowReading ? '' : 'mt-1'}`}>
              {currentCard.translation}
            </span>
            {currentCard.audioSrc && (
              <div class="mt-3" onClick={(e) => e.stopPropagation()}>
                <AudioPlayButton src={currentCard.audioSrc} variant="link" text="Escuchar pronunciacion" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div class="flex items-center gap-6 mt-4">
        <button 
          onClick={handlePrev}
          class="p-3 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Previous card"
        >
          ←
        </button>
        <span class="font-medium text-zinc-500">
          {currentIndex + 1} / {cards.length}
        </span>
        <button 
          onClick={handleNext}
          class="p-3 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Next card"
        >
          →
        </button>
      </div>
    </div>
  );
}
