import { useState, useRef, useEffect } from 'preact/hooks';
import { markActivity } from '../../store/progress';
import { useLesson } from './BookContainer';

interface Props {
  chapterId?: number;
  character: string;
  reading: string;
  strokes?: number;
  size?: 'compact' | 'wide';
}

interface Point {
  x: number;
  y: number;
}

type Path = Point[];

export default function KanaKanjiDrawingPad({ chapterId: propChapterId, character, reading, strokes, size = 'compact' }: Props) {
  const { chapterId: contextChapterId } = useLesson();
  const chapterId = propChapterId ?? contextChapterId;
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState<Path[]>([]);
  const currentPathRef = useRef<Path>([]);
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    drawCanvas();
  }, [paths, showGuide]);

  const drawCanvas = (tempPath?: Path) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Grid
    ctx.strokeStyle = '#e4e4e7'; // zinc-200
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2); ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Guide
    if (showGuide) {
      ctx.font = `${canvas.width * 0.75}px "Noto Sans JP", sans-serif`;
      ctx.fillStyle = 'rgba(244, 63, 94, 0.1)'; // rose-500 with low opacity
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(character, canvas.width / 2, canvas.height / 2 + 10);
    }

    // Draw Paths
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#18181b'; // zinc-900

    const drawPath = (path: Path) => {
      if (path.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    };

    paths.forEach(drawPath);
    if (tempPath) drawPath(tempPath);
  };

  const getPoint = (e: MouseEvent | TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Escalar coordenadas CSS a coordenadas internas del canvas (400x400)
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const point = getPoint(e);
    currentPathRef.current = [point];
  };

  const draw = (e: MouseEvent | TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const point = getPoint(e);
    currentPathRef.current.push(point);
    drawCanvas(currentPathRef.current);
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPathRef.current.length > 0) {
      setPaths(prev => [...prev, [...currentPathRef.current]]);
      if (chapterId) {
        markActivity(chapterId, 'drawingCompleted');
      }
    }
    currentPathRef.current = [];
  };

  const clear = () => {
    setPaths([]);
    currentPathRef.current = [];
    drawCanvas();
  };

  const undo = () => {
    setPaths(prev => prev.slice(0, -1));
  };

  const wrapperSizeClass = size === 'wide' ? 'w-full max-w-4xl' : 'max-w-sm';
  const canvasWrapperClass =
    size === 'wide'
      ? 'relative aspect-square w-full max-w-[420px] mx-auto bg-zinc-50 dark:bg-zinc-950 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 overflow-hidden touch-none'
      : 'relative aspect-square w-full bg-zinc-50 dark:bg-zinc-950 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 overflow-hidden touch-none';
  const controlsClass =
    size === 'wide'
      ? 'grid grid-cols-3 md:grid-cols-1 gap-2 w-full'
      : 'grid grid-cols-3 gap-2 mt-4';

  return (
    <div class={`my-4 p-4 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-lg mx-auto ${wrapperSizeClass}`}>
      {size !== 'wide' && (
        <div class="mb-3">
          <span class="text-[10px] font-bold text-[#F43F5E] uppercase tracking-widest">Práctica de Escritura</span>
          <div class="flex items-baseline gap-2">
            <h3 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {character} <span class="text-zinc-400 font-medium text-lg">({reading})</span>
            </h3>
            {strokes && (
              <span class="text-xs font-medium text-zinc-400">{strokes} trazos</span>
            )}
          </div>
        </div>
      )}

      <div class={size === 'wide' ? 'md:grid md:grid-cols-[minmax(0,420px)_240px] md:gap-5 md:items-start md:justify-center' : ''}>
        <div class={canvasWrapperClass}>
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            class="w-full h-full cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={endDrawing}
          />
        </div>

        <div class={size === 'wide' ? 'flex flex-col gap-3 md:pt-2' : ''}>
          {size === 'wide' && (
            <div class="w-full text-center">
              <span class="text-[10px] font-bold text-[#F43F5E] uppercase tracking-widest">Práctica de Escritura</span>
              <div class="flex items-baseline justify-center gap-2 mt-0.5">
                <h3 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {character} <span class="text-zinc-400 font-medium text-lg">({reading})</span>
                </h3>
                {strokes && (
                  <span class="text-xs font-medium text-zinc-400">{strokes} trazos</span>
                )}
              </div>
            </div>
          )}

          <div class={controlsClass}>
          <button
            onClick={() => setShowGuide(!showGuide)}
            class={`py-2 px-3 rounded-xl text-xs font-bold transition-colors ${showGuide ? 'bg-[#F43F5E]/10 text-[#F43F5E]' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}
          >
            {showGuide ? 'Ocultar Guía' : 'Mostrar Guía'}
          </button>
          <button
            onClick={undo}
            disabled={paths.length === 0}
            class="py-2 px-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 disabled:opacity-50 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-colors"
          >
            Deshacer
          </button>
          <button
            onClick={clear}
            disabled={paths.length === 0}
            class="py-2 px-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 disabled:opacity-50 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-colors"
          >
            Borrar
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
