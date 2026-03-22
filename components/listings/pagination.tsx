"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
};

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function buildHref(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `/listings?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      {currentPage > 1 ? (
        <Link
          href={buildHref(currentPage - 1)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-[#0F2044] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Precedent
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-100 text-sm font-medium text-gray-300 cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
          Precedent
        </span>
      )}

      <span className="text-sm text-gray-500">
        Page <span className="font-semibold text-[#0F2044]">{currentPage}</span>{" "}
        sur <span className="font-semibold text-[#0F2044]">{totalPages}</span>
      </span>

      {currentPage < totalPages ? (
        <Link
          href={buildHref(currentPage + 1)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-[#0F2044] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors"
        >
          Suivant
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-100 text-sm font-medium text-gray-300 cursor-not-allowed">
          Suivant
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </div>
  );
}
