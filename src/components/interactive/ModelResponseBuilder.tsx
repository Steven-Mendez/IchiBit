import { useState } from 'preact/hooks';

interface Props {
  initialName?: string;
}

export default function ModelResponseBuilder({ initialName = '' }: Props) {
  const [name, setName] = useState(initialName);
  const safeName = name.trim() || 'tu nombre';
  const hasName = Boolean(name.trim());

  return (
    <div class="my-4 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
      <div class="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-800/50">
        <p class="m-0 text-xs font-semibold tracking-wide uppercase text-zinc-500 dark:text-zinc-400">
          Respuesta interactiva
        </p>
      </div>

      <div class="p-4">
        <label class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2" for="modelo-nombre">
          Escribe tu nombre para completar el espacio subrayado
        </label>
        <input
          id="modelo-nombre"
          type="text"
          value={name}
          onInput={(event) => setName((event.target as HTMLInputElement).value)}
          placeholder="Ejemplo: Ana"
          class="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/70 px-3 py-2.5 text-sm text-zinc-800 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-[#F43F5E]/40 focus:border-[#F43F5E]"
        />

        <p class={`m-0 mt-2 text-xs ${hasName ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
          {hasName ? 'Perfecto, ya tienes tu respuesta personalizada.' : 'Completa el espacio para practicar tu presentación.'}
        </p>

        <div class="mt-3 p-3 rounded-xl border border-[#F43F5E]/20 bg-[#F43F5E]/5 space-y-2">
          <p class="m-0 text-xs text-zinc-500 dark:text-zinc-400">Respuesta modelo</p>

          <p class="m-0 text-2xl font-bold leading-tight">
            わたしは{' '}
            <span class={`inline-block min-w-24 px-1 text-center border-b-2 ${hasName ? 'border-[#F43F5E] text-[#F43F5E]' : 'border-zinc-300 dark:border-zinc-600 text-zinc-400 dark:text-zinc-500'}`}>
              {safeName}
            </span>{' '}
            です。
          </p>

          <p class="m-0 text-sm text-zinc-600 dark:text-zinc-400">
            Watashi wa{' '}
            <span class={`inline-block min-w-20 px-1 text-center border-b ${hasName ? 'border-zinc-400 dark:border-zinc-500 text-zinc-700 dark:text-zinc-300' : 'border-zinc-300 dark:border-zinc-600 text-zinc-400 dark:text-zinc-500'}`}>
              {safeName}
            </span>{' '}
            desu.
          </p>

          <p class="m-0 text-sm text-zinc-500 dark:text-zinc-400">
            Me llamo{' '}
            <span class={`inline-block min-w-20 px-1 text-center border-b ${hasName ? 'border-zinc-400 dark:border-zinc-500 text-zinc-600 dark:text-zinc-300' : 'border-zinc-300 dark:border-zinc-600 text-zinc-400 dark:text-zinc-500'}`}>
              {safeName}
            </span>.
          </p>
        </div>
      </div>
    </div>
  );
}
