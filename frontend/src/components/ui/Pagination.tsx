import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationMeta } from '@/types';
import { cn } from '@/utils';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { page, totalPages, total, limit } = meta;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
      <p className="text-xs text-[var(--muted)] hidden sm:block">
        Showing {start}–{end} of {total} leads
      </p>

      <div className="flex items-center gap-1 mx-auto sm:mx-0">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!meta.hasPrevPage}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dot-${i}`} className="px-2 text-[var(--muted)] text-sm">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(Number(p))}
              className={cn(
                'w-8 h-8 rounded-lg text-xs font-medium transition-colors',
                p === page
                  ? 'bg-brand-600 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
              )}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!meta.hasNextPage}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}
