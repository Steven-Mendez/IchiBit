interface Props {
  title: string;
  children: any;
  className?: string;
  variant?: 'accent' | 'neutral';
  icon?: 'tip' | 'info';
}

export default function InfoCallout({ title, children, className = '', variant = 'accent', icon }: Props) {
  const toneClasses =
    variant === 'neutral'
      ? 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50'
      : 'border-[#F43F5E]/20 bg-[#F43F5E]/5';

  return (
    <div class={`my-3 p-3 rounded-lg border ${toneClasses} ${className}`}>
      <p class="font-bold text-sm mb-1 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
        {icon === 'tip' && <span aria-hidden="true" class="text-lg leading-none">💡</span>}
        {icon === 'info' && (
          <span aria-hidden="true" class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black bg-zinc-300 dark:bg-zinc-600 text-zinc-800 dark:text-zinc-100">i</span>
        )}
        <span>{title}</span>
      </p>
      <div class="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        {children}
      </div>
    </div>
  );
}
