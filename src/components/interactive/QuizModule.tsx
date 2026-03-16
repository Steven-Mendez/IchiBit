import { useState } from 'preact/hooks';
import { markActivity } from '../../store/progress';
import { useLesson } from './BookContainer';
import AudioPlayButton from './AudioPlayButton';

export interface Question {
  text: string;
  options: string[];
  correctAnswer: number;
  audioSrc?: string;
  audioLabel?: string;
}

interface Props {
  chapterId?: number;
  questions: Question[];
  nextChapterUrl?: string;
}

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
    
    const isCorrect = optionIndex === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
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
      if (chapterId) {
        markActivity(chapterId, 'quizPracticed');
      }
      
      // Always celebrate practice!
      import('canvas-confetti').then(confetti => {
        confetti.default({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
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
            <button 
              onClick={resetQuiz}
              class="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-8 py-3 rounded-2xl font-bold hover:bg-zinc-200 transition-all"
            >
              Repasar de nuevo
            </button>
            {nextChapterUrl && (
              <a 
                href={nextChapterUrl}
                class="inline-block bg-[#F43F5E] text-white px-8 py-3 rounded-2xl font-bold transition-all hover:shadow-lg hover:-translate-y-1"
              >
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

      <h3 class="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        {question.text}
      </h3>

      {question.audioSrc && (
        <div class="not-prose mb-5 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="m-0 text-xs text-zinc-500 dark:text-zinc-400">Escucha y elige la opcion correcta</p>
          </div>
          <AudioPlayButton
            src={question.audioSrc}
            label={question.audioLabel || 'Reproducir audio de la pregunta'}
          />
        </div>
      )}

      <div class="grid gap-3 mb-6">
        {question.options.map((option, index) => {
          let buttonClass = "w-full p-3 rounded-xl border-2 text-left font-medium transition-all text-sm ";
          
          if (isAnswered) {
            if (index === question.correctAnswer) {
              buttonClass += "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400";
            } else if (index === selectedOption) {
              buttonClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400";
            } else {
              buttonClass += "border-zinc-100 dark:border-zinc-800 opacity-50";
            }
          } else {
            buttonClass += "border-zinc-100 dark:border-zinc-800 hover:border-[#F43F5E] hover:bg-[#F43F5E]/5";
          }

          return (
            <button
              key={index}
              disabled={isAnswered}
              onClick={() => handleAnswer(index)}
              class={buttonClass}
            >
              <div class="flex justify-between items-center">
                <span>{option}</span>
                {isAnswered && index === question.correctAnswer && <span>✓</span>}
                {isAnswered && index === selectedOption && index !== question.correctAnswer && <span>✗</span>}
              </div>
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <button
          onClick={nextQuestion}
          class="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-4 rounded-xl font-bold hover:opacity-90 transition-opacity"
        >
          {currentQuestion + 1 === questions.length ? "Terminar Quiz" : "Siguiente Pregunta"}
        </button>
      )}
    </div>
  );
}
