import AudioPlayButton from './AudioPlayButton';
import { useState } from 'preact/hooks';

interface Props {
  prompt?: string;
  japanese: string;
  reading?: string;
  audioSrc: string;
  audioLabel?: string;
  className?: string;
}

export default function AudioPhraseCard({
  prompt = 'Escucha y repite',
  japanese,
  reading,
  audioSrc,
  audioLabel = 'Escuchar audio',
  className = '',
}: Props) {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const formatTime = (seconds: number) => {
    if (!seconds || Number.isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div class={`my-2 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 ${className}`}>
      <div class="flex items-center justify-between gap-2">
        <div class="min-w-0 flex-1">
          <p class="m-0 text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">{prompt}</p>
          <div class="mt-0.5 flex items-baseline gap-2 min-w-0">
            <span class="text-2xl font-bold leading-none truncate">{japanese}</span>
            {reading && (
              <span class="text-sm text-zinc-500 dark:text-zinc-400 truncate">{reading}</span>
            )}
          </div>
        </div>
        <div class="shrink-0">
          <AudioPlayButton
            src={audioSrc}
            label={audioLabel}
            onDurationChange={setDuration}
            onProgressChange={(nextProgress, nextCurrentTime, nextDuration) => {
              setProgress(nextProgress);
              setCurrentTime(nextCurrentTime);
              if (nextDuration) setDuration(nextDuration);
            }}
          />
        </div>
      </div>

      <div class="mt-2">
        <div class="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            class="h-full bg-[#F43F5E]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p class="m-0 mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 text-right tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </p>
      </div>
    </div>
  );
}
