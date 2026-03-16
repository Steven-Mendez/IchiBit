import { useState, useRef, useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { activeAudioSrc, setActiveAudio } from '../../store/audio';

interface Props {
  src: string;
  label?: string; // Tooltip for 'icon' variant
  variant?: 'icon' | 'link';
  text?: string; // Display text for 'link' variant
  onProgressChange?: (progress: number, currentTime: number, duration: number) => void;
  onDurationChange?: (duration: number) => void;
}

type AudioState = 'idle' | 'loading' | 'playing' | 'error';

export default function AudioPlayButton({
  src,
  label = 'Escuchar',
  variant = 'icon',
  text,
  onProgressChange,
  onDurationChange,
}: Props) {
  const [state, setState] = useState<AudioState>('idle');
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const $activeSrc = useStore(activeAudioSrc);

  const emitProgress = (audio: HTMLAudioElement) => {
    const safeDuration = audio.duration || 0;
    const safeCurrentTime = audio.currentTime || 0;
    const nextProgress = safeDuration > 0 ? (safeCurrentTime / safeDuration) * 100 : 0;
    setProgress(nextProgress);
    onProgressChange?.(nextProgress, safeCurrentTime, safeDuration);
  };

  const cleanupListeners = (audio: HTMLAudioElement) => {
    audio.onloadstart = null;
    audio.oncanplaythrough = null;
    audio.onloadedmetadata = null;
    audio.onplay = null;
    audio.onpause = null;
    audio.onended = null;
    audio.onerror = null;
    audio.ontimeupdate = null;
  };

  const stopProgressLoop = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const startProgressLoop = (audio: HTMLAudioElement) => {
    stopProgressLoop();
    const tick = () => {
      emitProgress(audio);
      if (!audio.paused && !audio.ended) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  // Synchronize with global active audio store
  useEffect(() => {
    if ($activeSrc !== src && state === 'playing') {
      if (audioRef.current) {
        stopProgressLoop();
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        emitProgress(audioRef.current);
      }
      setState('idle');
      setProgress(0);
    }
  }, [$activeSrc, src, state]);

  // Cleanup on unmount or when src changes
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        stopProgressLoop();
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        cleanupListeners(audioRef.current);
        audioRef.current = null;
      }
    };
  }, [src]);

  const togglePlay = () => {
    if (state === 'playing') {
      if (audioRef.current) {
        stopProgressLoop();
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        emitProgress(audioRef.current);
      }
      setActiveAudio(null);
      setState('idle');
      setProgress(0);
      onProgressChange?.(0, 0, audioRef.current?.duration || 0);
      return;
    }

    // Set as active before playing to stop other instances
    setActiveAudio(src);

    if (!audioRef.current) {
      const audio = new Audio(src);
      audioRef.current = audio;
      
      audio.onloadstart = () => setState('loading');
      audio.oncanplaythrough = () => setState(prev => prev === 'loading' ? 'idle' : prev);
      audio.onloadedmetadata = () => {
        onDurationChange?.(audio.duration || 0);
        emitProgress(audio);
      };
      audio.onplay = () => {
        setState('playing');
        emitProgress(audio);
        startProgressLoop(audio);
      };
      audio.onpause = () => {
        stopProgressLoop();
        setState('idle');
        emitProgress(audio);
      };
      audio.onended = () => {
        stopProgressLoop();
        setState('idle');
        setProgress(100);
        onProgressChange?.(100, audio.duration || 0, audio.duration || 0);
        if (activeAudioSrc.get() === src) setActiveAudio(null);
      };
      audio.onerror = () => setState('error');
      
      audio.ontimeupdate = () => {
        emitProgress(audio);
      };
    }

    if (audioRef.current.duration && audioRef.current.currentTime >= audioRef.current.duration) {
      audioRef.current.currentTime = 0;
      emitProgress(audioRef.current);
    }

    audioRef.current.play().catch((err) => {
      if (err.name !== 'AbortError') {
        console.error('Playback failed:', err);
        setState('error');
      }
    });
  };

  useEffect(() => {
    return () => {
      stopProgressLoop();
    };
  }, []);

  if (variant === 'link') {
    return (
      <button
        type="button"
        onClick={togglePlay}
        disabled={state === 'loading'}
        class={`
          inline-flex items-center gap-1.5 font-medium transition-colors
          ${state === 'playing' ? 'text-[#F43F5E] underline decoration-2' : 'text-zinc-600 dark:text-zinc-400 hover:text-[#F43F5E] underline decoration-dotted decoration-zinc-300 dark:decoration-zinc-700 hover:decoration-[#F43F5E]'}
          ${state === 'loading' ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
          ${state === 'error' ? 'text-red-500 no-underline' : ''}
        `}
      >
        <span>{text || label}</span>
        {state === 'loading' ? (
          <svg class="animate-spin h-3 w-3" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg
            class={`h-3.5 w-3.5 transition-transform ${state === 'playing' ? 'scale-110' : ''}`}
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5 6 9H3v6h3l5 4V5z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 9.5a4 4 0 0 1 0 5" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 7a8 8 0 0 1 0 10" />
          </svg>
        )}
      </button>
    );
  }

  const getButtonStyles = () => {
    switch (state) {
      case 'playing':
        return 'bg-[#F43F5E] border-transparent text-white shadow-md scale-105';
      case 'loading':
        return 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400 cursor-wait';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-500';
      default:
        return 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-[#F43F5E] hover:border-[#F43F5E] hover:scale-110 shadow-sm';
    }
  };

  // r = 21 (radius)
  const radius = 21;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div class="relative inline-flex items-center justify-center w-12 h-12 shrink-0 group">
      {/* Background Circle */}
      <svg class="absolute inset-0 -rotate-90 w-full h-full" viewBox="0 0 48 48">
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          class="text-zinc-100 dark:text-zinc-800/50"
        />
        {/* Progress Circle */}
        {(state === 'playing' || progress > 0) && state !== 'loading' && (
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-dasharray={circumference}
            stroke-dashoffset={strokeDashoffset}
            stroke-linecap="round"
            class="text-[#F43F5E]"
          />
        )}
      </svg>

      <button
        type="button"
        onClick={togglePlay}
        disabled={state === 'loading'}
        aria-pressed={state === 'playing'}
        title={state === 'error' ? 'Error al cargar audio' : label}
        class={`
          relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all 
          active:scale-95
          ${getButtonStyles()}
        `}
      >
        {state === 'loading' ? (
          <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : state === 'playing' ? (
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        ) : state === 'error' ? (
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        ) : (
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
          </svg>
        )}
      </button>
    </div>
  );
}
