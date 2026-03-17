import { createPortal } from 'preact/compat';
import { useState, useRef, useEffect, useLayoutEffect } from 'preact/hooks';

interface Props {
  term: string;
  reading?: string;
  meaning: string;
  note?: string;
  example?: string;
  triggerStyle?: 'default' | 'compact' | 'icon';
  triggerLabel?: string;
}

export default function TermTooltip({
  term,
  reading,
  meaning,
  note,
  example,
  triggerStyle = 'default',
  triggerLabel,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<'top' | 'bottom'>('top');
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openTooltip = () => {
    clearCloseTimer();
    setIsOpen(true);
  };

  const closeTooltip = () => {
    clearCloseTimer();
    setIsOpen(false);
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 120);
  };

  const updatePosition = () => {
    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;
    if (!trigger || !tooltip) return;

    const rect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const sidePadding = 12;
    const gap = 12;

    const centerX = rect.left + rect.width / 2;
    const minLeft = sidePadding + tooltipRect.width / 2;
    const maxLeft = viewportWidth - sidePadding - tooltipRect.width / 2;
    const left = Math.max(minLeft, Math.min(centerX, maxLeft));

    const canShowTop = rect.top >= tooltipRect.height + gap + sidePadding;
    const canShowBottom =
      viewportHeight - rect.bottom >= tooltipRect.height + gap + sidePadding;
    const nextPlacement = canShowTop || !canShowBottom ? 'top' : 'bottom';

    const top = nextPlacement === 'top' ? rect.top - gap : rect.bottom + gap;

    setPlacement(nextPlacement);
    setPosition({ left, top });
  };

  const toggleTooltip = (e: MouseEvent | TouchEvent) => {
    e.stopPropagation();
    if (isOpen) {
      closeTooltip();
    } else {
      openTooltip();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideTrigger = triggerRef.current?.contains(target);
      const isInsideTooltip = tooltipRef.current?.contains(target);
      if (!isInsideTrigger && !isInsideTooltip) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, term, reading, meaning, note, example]);

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  return (
    <span 
      ref={triggerRef}
      class="inline"
      onMouseEnter={openTooltip}
      onMouseLeave={scheduleClose}
    >
      <button 
        type="button"
        class={`
          cursor-help transition-colors font-medium
          ${
            triggerStyle === 'default'
              ? `${isOpen ? 'border-[#F43F5E] text-[#F43F5E]' : 'border-zinc-300 dark:border-zinc-700 hover:border-[#F43F5E]'} border-b-2 border-dotted`
              : triggerStyle === 'compact'
                ? `${isOpen ? 'bg-[#F43F5E]/10 text-[#F43F5E] border-[#F43F5E]/30' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-[#F43F5E]/40'} px-2 py-1 rounded-md border text-[11px] leading-none`
                : `${isOpen ? 'bg-[#F43F5E] text-white border-[#F43F5E]' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-[#F43F5E]/40'} w-7 h-7 rounded-full border text-sm inline-flex items-center justify-center`
          }
        `}
        onClick={toggleTooltip}
        onFocus={openTooltip}
        onBlur={scheduleClose}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {triggerStyle === 'default' ? term : (triggerLabel || (triggerStyle === 'icon' ? '?' : term))}
      </button>

      {isOpen && createPortal(
        <div
          ref={tooltipRef}
          role="tooltip"
          onMouseEnter={openTooltip}
          onMouseLeave={scheduleClose}
          class="fixed w-72 max-w-[calc(100vw-24px)] p-5 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-2xl z-[9999] animate-in fade-in duration-200"
          style={{
            left: `${position.left}px`,
            top: `${position.top}px`,
            transform:
              placement === 'top'
                ? 'translate(-50%, calc(-100% - 2px))'
                : 'translate(-50%, 2px)'
          }}
        >
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2.5 flex-wrap">
              <span class="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-none">{term}</span>
              {reading && (
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#F43F5E] bg-[#F43F5E]/10 px-2 py-0.5 rounded-full">
                  {reading}
                </span>
              )}
            </div>

            <p class="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
              {meaning}
            </p>

            {note && (
              <p class="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-400 leading-normal italic">
                {note}
              </p>
            )}

            {example && (
              <div class="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Ejemplo</p>
                <p class="text-xs text-zinc-600 dark:text-zinc-400 italic leading-relaxed">"{example}"</p>
              </div>
            )}
          </div>

          <div
            class={`absolute left-1/2 -translate-x-1/2 w-4 h-4 overflow-hidden ${placement === 'top' ? 'top-full -mt-[2px]' : 'bottom-full -mb-[2px]'}`}
          >
            <div
              class={`w-2.5 h-2.5 bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-sm mx-auto ${placement === 'top' ? 'border-r-2 border-b-2 rotate-45 -mt-1.5' : 'border-l-2 border-t-2 rotate-45 mt-2'}`}
            />
          </div>
        </div>,
        document.body
      )}
    </span>
  );
}
