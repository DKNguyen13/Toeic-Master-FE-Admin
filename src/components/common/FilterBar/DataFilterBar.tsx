import React, { useState, useRef, useEffect } from "react";
import { Search, Filter, X, Check } from "lucide-react";

type Option = {
  label: string;
  value: string;
};

type SelectConfig = {
  key: string;
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  color?: "indigo" | "blue" | "violet" | "emerald" | "amber";
};

type Props = {
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  selects?: SelectConfig[];
  className?: string;
  onResetFilters?: () => void;
};

const DataFilterBar: React.FC<Props> = ({
  search,
  selects = [],
  className,
  onResetFilters,
}) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const activeFilters = selects.filter((s) => s.value !== "");
  const hasActiveFilters = activeFilters.length > 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        filterOpen &&
        filterRef.current &&
        buttonRef.current &&
        !filterRef.current.contains(e.target as Node) &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterOpen]);

  const getChipColor = (color: string = "indigo") => {
    switch (color) {
      case "blue":
        return "bg-blue-50 text-blue-700 border-blue-100 hover:text-blue-900";
      case "violet":
        return "bg-violet-50 text-violet-700 border-violet-100 hover:text-violet-900";
      case "emerald":
        return "bg-emerald-50 text-emerald-700 border-emerald-100 hover:text-emerald-900";
      case "amber":
        return "bg-amber-50 text-amber-700 border-amber-100 hover:text-amber-900";
      default:
        return "bg-indigo-50 text-indigo-700 border-indigo-100 hover:text-indigo-900";
    }
  };

  return (
    <div className={`mb-6 ${className || ""}`}>
      <div className="flex flex-col md:flex-row gap-3">
        {search && (
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search.value}
              placeholder={search.placeholder || "Tìm kiếm theo tiêu đề..."}
              onChange={(e) => search.onChange(e.target.value)}
              className="w-full h-9 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
            />
            {search.value && (
              <button
                onClick={() => search.onChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {selects.length > 0 && (
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setFilterOpen(!filterOpen)}
              className={`relative flex items-center gap-2 h-9 px-4 rounded-xl border text-sm font-medium transition-colors shadow-sm ${
                hasActiveFilters
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-3.5 h-3.5" strokeWidth={2} />
              Bộ lọc
              {hasActiveFilters && (
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>

            {filterOpen && (
              <div
                ref={filterRef}
                className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border border-gray-100 z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                  <span className="text-sm font-semibold text-gray-700">Bộ lọc</span>
                  {hasActiveFilters && (
                    <button
                      onClick={() => {
                        selects.forEach((s) => s.onChange(""));
                        onResetFilters?.();
                        setFilterOpen(false);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Xóa tất cả
                    </button>
                  )}
                </div>

                <div className="p-3 space-y-4">
                  {selects.map((select) => (
                    <div key={select.key}>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
                        {select.label}
                      </p>
                      <div className="space-y-1">
                        {select.options.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => select.onChange(opt.value)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
                              select.value === opt.value
                                ? "bg-indigo-50 text-indigo-700 font-medium"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            <span>{opt.label}</span>
                            {select.value === opt.value && (
                              <Check className="w-3.5 h-3.5 text-indigo-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs text-gray-400">Đang lọc:</span>
          {activeFilters.map((select) => {
            const selectedOption = select.options.find((o) => o.value === select.value);
            return (
              <span
                key={select.key}
                className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-medium border ${getChipColor(select.color)}`}
              >
                {selectedOption?.label}
                <button onClick={() => select.onChange("")} className="hover:text-opacity-70">
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DataFilterBar;