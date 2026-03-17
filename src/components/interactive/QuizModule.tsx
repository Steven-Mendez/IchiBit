import { useState, useRef, useLayoutEffect, useEffect } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import type { ComponentChildren } from 'preact';
import { markActivity } from '../../store/progress';
import { useLesson } from './BookContainer';
import AudioPlayButton from './AudioPlayButton';

export type QuizOption =
  | string
  | { japanese: string; reading: string; meaning?: string; example?: string };

export interface Question {
  text: string;
  options: QuizOption[];
  correctAnswer: number;
  audioSrc?: string;
  audioLabel?: string;
  explanation?: string | ComponentChildren;
}

interface Props {
  chapterId?: number;
  questions: Question[];
  nextChapterUrl?: string;
}

// ─── Inline tooltip rendered via portal ────────────────────────────────────
interface TooltipData {
  japanese: string;
  reading: string;
  meaning?: string;
  example?: string;
  rect: DOMRect;
}

function QuizTooltip({ data, onClose }: { data: TooltipData; onClose: () => void }) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<'top' | 'bottom'>('top');
  const [pos, setPos] = useState({ left: 0, top: 0 });

  useLayoutEffect(() => {
    const t = tooltipRef.current;
    if (!t) return;
    const tr = t.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pad = 12;
    const gap = 10;

    const cx = data.rect.left + data.rect.width / 2;
    const left = Math.max(pad + tr.width / 2, Math.min(cx, vw - pad - tr.width / 2));
    const canTop = data.rect.top >= tr.height + gap + pad;
    const canBot = vh - data.rect.bottom >= tr.height + gap + pad;
    const pl = canTop || !canBot ? 'top' : 'bottom';
    const top = pl === 'top' ? data.rect.top - gap : data.rect.bottom + gap;

    setPlacement(pl);
    setPos({ left, top });
  }, [data]);

  useEffect(() => {
    const handler = () => onClose();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={tooltipRef}
      role="tooltip"
      class="fixed w-64 max-w-[calc(100vw-24px)] p-4 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-[9999] pointer-events-none animate-in fade-in duration-150"
      style={{
        left: `${pos.left}px`,
        top: `${pos.top}px`,
        transform: placement === 'top' ? 'translate(-50%, calc(-100% - 2px))' : 'translate(-50%, 2px)',
      }}
    >
      <div class="flex items-center gap-2 flex-wrap mb-2">
        <span class="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-none">{data.japanese}</span>
        <span class="text-[10px] font-bold uppercase tracking-wider text-[#F43F5E] bg-[#F43F5E]/10 px-2 py-0.5 rounded-full">
          {data.reading}
        </span>
      </div>
      {data.meaning && (
        <p class="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium m-0">{data.meaning}</p>
      )}
      {data.example && (
        <div class="mt-2 p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
          <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Ejemplo</p>
          <p class="text-xs text-zinc-600 dark:text-zinc-400 italic m-0">"{data.example}"</p>
        </div>
      )}
      {/* Arrow */}
      <div class={`absolute left-1/2 -translate-x-1/2 w-4 h-4 overflow-hidden ${placement === 'top' ? 'top-full -mt-[2px]' : 'bottom-full -mb-[2px]'}`}>
        <div class={`w-2.5 h-2.5 bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-sm mx-auto ${placement === 'top' ? 'border-r-2 border-b-2 rotate-45 -mt-1.5' : 'border-l-2 border-t-2 rotate-45 mt-2'}`} />
      </div>
    </div>,
    document.body
  );
}

// ─── Inline parser for explanations ──────────────────────────────────────────
function InlineTooltipWord({ japanese, reading, meaning }: { japanese: string, reading: string, meaning?: string }) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const hoverTimer = useRef<number | null>(null);

  const showTooltip = () => {
    hoverTimer.current = window.setTimeout(() => {
      const rect = textRef.current?.getBoundingClientRect();
      if (rect) {
        setTooltip({ japanese, reading, meaning, rect });
      }
    }, 120);
  };

  const hideTooltip = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    setTooltip(null);
  };

  return (
    <span class="inline-block relative mx-0.5" onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
      <span
        ref={textRef}
        class="font-bold border-b-2 border-dotted border-zinc-400 dark:border-zinc-500 hover:border-[#F43F5E] hover:text-[#F43F5E] transition-colors cursor-help"
      >
        {japanese}
      </span>
      {tooltip && <QuizTooltip data={tooltip} onClose={hideTooltip} />}
    </span>
  );
}

function TextWithTooltips({ text }: { text: string }) {
  const parts = text.split(/(\[\[[^\]]+\]\])/g);
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\[\[([^|\]]+)(?:\|([^|\]]+))?(?:\|([^\]]+))?\]\]$/);
        if (match) {
          const [, japanese, reading, meaning] = match;
          return <InlineTooltipWord key={i} japanese={japanese} reading={reading || ''} meaning={meaning} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}


// ─── Option label with hover tooltip ────────────────────────────────────────
function OptionLabel({ option, isAnswered }: { option: QuizOption; isAnswered: boolean }) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const hoverTimer = useRef<number | null>(null);

  if (typeof option === 'string') {
    return <span class="text-sm">{option}</span>;
  }

  const showTooltip = () => {
    hoverTimer.current = window.setTimeout(() => {
      const rect = textRef.current?.getBoundingClientRect();
      if (rect) {
        setTooltip({
          japanese: option.japanese,
          reading: option.reading,
          // Only reveal meaning/example after answering — don't blow the answer
          meaning: isAnswered ? option.meaning : undefined,
          example: isAnswered ? option.example : undefined,
          rect,
        });
      }
    }, 120);
  };

  const hideTooltip = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    setTooltip(null);
  };

  return (
    <span
      class="flex items-center gap-3"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      <span
        ref={textRef}
        class="text-lg font-bold border-b-2 border-dotted border-zinc-300 dark:border-zinc-600 hover:border-[#F43F5E] hover:text-[#F43F5E] transition-colors cursor-help leading-tight"
      >
        {option.japanese}
      </span>
      <span class="text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full shrink-0">
        {option.reading}
      </span>
      {tooltip && <QuizTooltip data={tooltip} onClose={hideTooltip} />}
    </span>
  );
}


// ─── Main component ──────────────────────────────────────────────────────────
export default function QuizModule({ chapterId: propChapterId, questions, nextChapterUrl }: Props) {
  const { chapterId: contextChapterId } = useLesson();
  const chapterId = propChapterId ?? contextChapterId;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleAnswer = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex);
    setIsAnswered(true);
    if (optionIndex === questions[currentQuestion].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
      if (chapterId) markActivity(chapterId, 'quizPracticed');
      import('canvas-confetti').then(confetti => {
        confetti.default({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      });
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  if (showResult) {
    const finalPercentage = Math.round((score / questions.length) * 100);
    return (
      <div class="my-4 p-6 md:p-8 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl text-center animate-in zoom-in duration-500">
        <div class="text-4xl mb-4">🎉</div>
        <h2 class="text-2xl font-bold mb-2">¡Práctica Completada!</h2>
        <p class="text-zinc-500 mb-6 text-sm">Has acertado {score} de {questions.length} preguntas ({finalPercentage}%).</p>
        <div class="space-y-4">
          <p class="text-base text-zinc-600 dark:text-zinc-400">
            ¡Excelente! Cada sesión de práctica te acerca más a dominar el japonés.
          </p>
          <div class="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={resetQuiz} class="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-8 py-3 rounded-2xl font-bold hover:bg-zinc-200 transition-all">
              Repasar de nuevo
            </button>
            {nextChapterUrl && (
              <a href={nextChapterUrl} class="inline-block bg-[#F43F5E] text-white px-8 py-3 rounded-2xl font-bold transition-all hover:shadow-lg hover:-translate-y-1">
                Siguiente Capítulo →
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div class="my-4 p-6 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl">
      <div class="flex justify-between items-center mb-6">
        <span class="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          Pregunta {currentQuestion + 1} de {questions.length}
        </span>
        <div class="h-2 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            class="h-full bg-[#F43F5E] transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h3 class="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">{question.text}</h3>

      {question.audioSrc && (
        <div class="not-prose mb-5 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between gap-3">
          <p class="m-0 text-xs text-zinc-500 dark:text-zinc-400">Escucha y elige la opcion correcta</p>
          <AudioPlayButton src={question.audioSrc} label={question.audioLabel || 'Reproducir audio'} />
        </div>
      )}

      <div class="grid gap-3 mb-6">
        {question.options.map((option, index) => {
          let cls = 'w-full p-3 rounded-xl border-2 text-left font-medium transition-all text-sm ';
          if (isAnswered) {
            if (index === question.correctAnswer) {
              cls += 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400';
            } else if (index === selectedOption) {
              cls += 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400';
            } else {
              cls += 'border-zinc-100 dark:border-zinc-800 opacity-50';
            }
          } else {
            cls += 'border-zinc-100 dark:border-zinc-800 hover:border-[#F43F5E] hover:bg-[#F43F5E]/5';
          }

          return (
            <button
              key={index}
              disabled={isAnswered}
              onClick={() => handleAnswer(index)}
              class={cls}
            >
              <div class="flex justify-between items-center gap-2">
                <OptionLabel option={option} isAnswered={isAnswered} />
                {isAnswered && index === question.correctAnswer && <span class="shrink-0">✓</span>}
                {isAnswered && index === selectedOption && index !== question.correctAnswer && <span class="shrink-0">✗</span>}
              </div>
            </button>
          );
        })}
      </div>

      {isAnswered && question.explanation && (
        <div class={`mb-4 p-4 rounded-xl border text-sm leading-relaxed ${
          selectedOption === question.correctAnswer
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
        }`}>
          <div class="m-0 opacity-90">
            {typeof question.explanation === 'string' 
              ? <TextWithTooltips text={question.explanation} /> 
              : question.explanation}
          </div>
        </div>
      )}

      {isAnswered && (
        <button
          onClick={nextQuestion}
          class="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-4 rounded-xl font-bold hover:opacity-90 transition-opacity"
        >
          {currentQuestion + 1 === questions.length ? 'Terminar Quiz' : 'Siguiente Pregunta'}
        </button>
      )}
    </div>
  );
}
