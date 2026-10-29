import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  if (totalItems <= itemsPerPage) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3.5 border-t border-white/[0.08] bg-[#0B1019] text-xs font-mono text-slate-400 gap-3">
      <div>
        Mostrando{' '}
        <span className="font-bold text-amber-400">
          {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}
        </span>{' '}
        a{' '}
        <span className="font-bold text-amber-400">
          {Math.min(currentPage * itemsPerPage, totalItems)}
        </span>{' '}
        de <span className="font-bold text-slate-200">{totalItems}</span> registros de taller
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-white/[0.08] bg-[#141C2B] text-slate-300 hover:text-amber-400 hover:border-amber-500/40 disabled:opacity-30 disabled:pointer-events-none transition-all"
          title="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-2.5 py-1 rounded bg-[#162030] border border-white/[0.06] font-bold text-slate-200 text-xs">
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-white/[0.08] bg-[#141C2B] text-slate-300 hover:text-amber-400 hover:border-amber-500/40 disabled:opacity-30 disabled:pointer-events-none transition-all"
          title="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};


