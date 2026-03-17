import { useState } from 'preact/hooks';
import TermTooltip from './TermTooltip';

interface Props {
  initialName?: string;
}

export default function ModelResponseBuilder({ initialName = '' }: Props) {
  const [name, setName] = useState(initialName);
  const safeName = name.trim();
  const hasName = Boolean(safeName);

  return (
    <div class="mt-8 mb-6 w-full">

      {/* Section marker */}
      <div class="flex items-center gap-3 mb-7">
        <div class="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
        <span class="text-[10px] font-black uppercase tracking-widest text-[#F43F5E] bg-[#F43F5E]/10 px-3 py-1 rounded-full shrink-0">
          Tu turno · Rellena el hueco
        </span>
        <div class="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
      </div>

      {/* Fill in the blank sentence */}
      <div class="text-center">
        <p class="text-2xl md:text-3xl m-0 font-medium leading-relaxed flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2">
          <TermTooltip term="わたし" reading="Watashi" meaning="Yo (neutro)" />
          <TermTooltip term="は" reading="wa" meaning="(partícula de tema)" />

          <span class="relative inline-flex items-center mx-1 md:mx-2">
            <input
              type="text"
              value={name}
              maxLength={20}
              onInput={(event) => setName((event.target as HTMLInputElement).value)}
              placeholder="tu nombre"
              class={`bg-transparent border-b-2 outline-none text-center transition-all duration-300 px-1 py-0.5 placeholder:text-zinc-300 dark:placeholder:text-zinc-600 font-bold text-[#F43F5E] ${
                hasName
                  ? 'border-[#F43F5E]'
                  : 'border-dashed border-zinc-300 dark:border-zinc-600 focus:border-solid focus:border-[#F43F5E] min-w-[100px]'
              }`}
              style={{ width: hasName ? `calc(${safeName.length}ch + 1.5rem)` : undefined }}
            />
          </span>

          <TermTooltip term="です。" reading="desu." meaning="(verbo ser)" />
        </p>

        <p class={`text-xs text-zinc-400 mt-3 m-0 transition-opacity duration-300 ${hasName ? 'opacity-0' : 'opacity-100'}`}>
          Haz clic y escribe tu nombre
        </p>
      </div>

      {/* Pronunciation & meaning feedback */}
      <div class={`mt-4 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-8 transition-opacity duration-500 ${hasName ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div class="text-center">
          <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1 m-0">Pronunciación</p>
          <p class="text-sm text-zinc-600 dark:text-zinc-400 m-0">
            Watashi wa <span class="font-bold text-[#F43F5E]">{safeName}</span> desu.
          </p>
        </div>
        <div class="hidden sm:block w-px h-8 bg-zinc-100 dark:bg-zinc-800" />
        <div class="text-center">
          <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1 m-0">Significado</p>
          <p class="text-sm text-zinc-600 dark:text-zinc-400 m-0">
            Yo soy <span class="font-bold text-[#F43F5E]">{safeName}</span>.
          </p>
        </div>
      </div>

      {/* Closing rule */}
      <div class="mt-7 h-px bg-zinc-100 dark:bg-zinc-800" />

    </div>
  );
}
