import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust start/end to keep a consistent count
      let adjustedStart = start;
      let adjustedEnd = end;
      if (currentPage <= 3) {
        adjustedEnd = 4;
      } else if (currentPage >= totalPages - 2) {
        adjustedStart = totalPages - 3;
      }

      for (let i = adjustedStart; i <= adjustedEnd; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
      <nav className="flex items-center space-x-1.5 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
        {/* Previous */}
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="
            w-9 h-9
            flex items-center justify-center
            rounded-lg
            text-slate-500
            hover:text-indigo-600
            hover:bg-indigo-50
            transition-all duration-200
            disabled:opacity-30
            disabled:hover:bg-transparent
            disabled:hover:text-slate-400
            disabled:cursor-not-allowed
          "
          aria-label="Trang trước"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="w-9 h-9 flex items-center justify-center text-slate-400 select-none text-sm font-medium"
              >
                &bull;&bull;&bull;
              </span>
            );
          }

          const isCurrent = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`
                w-9 h-9
                flex items-center justify-center
                text-sm font-semibold
                rounded-lg
                transition-all duration-200
                ${
                  isCurrent
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                }
              `}
            >
              {page}
            </button>
          );
        })}

        {/* Next */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="
            w-9 h-9
            flex items-center justify-center
            rounded-lg
            text-slate-500
            hover:text-indigo-600
            hover:bg-indigo-50
            transition-all duration-200
            disabled:opacity-30
            disabled:hover:bg-transparent
            disabled:hover:text-slate-400
            disabled:cursor-not-allowed
          "
          aria-label="Trang sau"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;