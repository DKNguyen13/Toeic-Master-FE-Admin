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

  const pages = Array.from(
    { length: totalPages },
    (_, i) => i + 1
  );

  return (
    <div className="flex justify-center items-center gap-3 mt-5">
      {/* Previous */}
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="
          h-10 px-4
          flex items-center gap-2
          rounded-2xl
          border border-slate-200
          bg-white
          text-slate-600
          shadow-sm
          hover:bg-slate-50
          hover:text-indigo-600
          hover:border-indigo-200
          transition-all duration-200
          disabled:opacity-40
          disabled:cursor-not-allowed
        "
      >
        <ChevronLeft size={16} />
        <span className="text-sm font-medium">Trước</span>
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-2">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`
              w-10 h-10
              rounded-2xl
              text-sm font-medium
              transition-all duration-200
              ${
                currentPage === page
                  ? "bg-blue-500 text-white shadow-md shadow-indigo-100"
                  : "bg-white border border-slate-200 text-slate-600 shadow-sm hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
              }
            `}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="
          h-10 px-4
          flex items-center gap-2
          rounded-2xl
          border border-slate-200
          bg-white
          text-slate-600
          shadow-sm
          hover:bg-slate-50
          hover:text-indigo-600
          hover:border-indigo-200
          transition-all duration-200
          disabled:opacity-40
          disabled:cursor-not-allowed
        "
      >
        <span className="text-sm font-medium">Sau</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;