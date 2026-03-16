import TermTooltip from './TermTooltip';

interface TooltipCell {
  type: 'tooltip';
  term: string;
  reading?: string;
  meaning: string;
  note?: string;
  example?: string;
  prefix?: string;
  suffix?: string;
}

type TableCell = string | TooltipCell;

interface Props {
  columns: string[];
  rows: TableCell[][];
  highlightColumn?: number; // 0-indexed
  caption?: string;
}

export default function ComparisonTable({ columns, rows, highlightColumn, caption }: Props) {
  const renderCellContent = (cell: TableCell) => {
    if (typeof cell === 'string') return cell;

    if (cell.type === 'tooltip') {
      return (
        <span class="inline-flex items-center gap-1.5 flex-wrap">
          {cell.prefix && <span>{cell.prefix}</span>}
          <TermTooltip
            term={cell.term}
            reading={cell.reading}
            meaning={cell.meaning}
            note={cell.note}
            example={cell.example}
          />
          {cell.suffix && <span>{cell.suffix}</span>}
        </span>
      );
    }

    return '';
  };

  return (
    <div class="not-prose my-3 w-full overflow-hidden border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm">
      {caption && (
        <div class="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
          <p class="m-0 text-[11px] leading-tight font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{caption}</p>
        </div>
      )}
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse m-0">
          <thead>
            <tr class="bg-zinc-50 dark:bg-zinc-800/50">
              {columns.map((col, i) => (
                <th 
                  key={i}
                  class={`px-4 py-2.5 text-sm font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 ${
                    highlightColumn === i ? 'bg-[#F43F5E]/5 text-[#F43F5E]' : ''
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} class="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                {row.map((cell, cellIndex) => (
                  <td 
                    key={cellIndex}
                    class={`px-4 py-2.5 text-sm text-zinc-600 dark:text-zinc-300 ${
                      highlightColumn === cellIndex ? 'bg-[#F43F5E]/5 font-medium' : ''
                    }`}
                  >
                    {renderCellContent(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div class="md:hidden px-4 py-1.5 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800">
        <p class="m-0 text-[10px] text-zinc-400 text-center italic">Desliza para ver mas →</p>
      </div>
    </div>
  );
}
