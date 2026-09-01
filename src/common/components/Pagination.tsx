"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type PaginationProps = {
  currentPage: number;
  nextLabel: string;
  onPageChange: (page: number) => void;
  paginationLabel: string;
  previousLabel: string;
  totalPages: number;
};

type PageItem = number | "ellipsis-left" | "ellipsis-right";

export function Pagination({
  currentPage,
  nextLabel,
  onPageChange,
  paginationLabel,
  previousLabel,
  totalPages,
}: PaginationProps) {
  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <nav aria-label={paginationLabel}>
      <div className="flex items-center gap-1.5">
        <PageArrow
          disabled={currentPage === 1}
          label={previousLabel}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft />
        </PageArrow>
        {pages.map((page) =>
          typeof page === "number" ? (
            <button
              aria-current={page === currentPage ? "page" : undefined}
              aria-label={`${paginationLabel} ${page}`}
              className={cn(
                "flex size-11 cursor-pointer items-center justify-center rounded-xl text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25",
                page === currentPage
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-primary-tint hover:text-primary-hover",
              )}
              key={page}
              onClick={() => onPageChange(page)}
              type="button"
            >
              {page}
            </button>
          ) : (
            <span
              aria-hidden="true"
              className="flex size-8 items-center justify-center text-lg font-semibold text-muted-foreground"
              key={page}
            >
              …
            </span>
          ),
        )}
        <PageArrow
          disabled={currentPage === totalPages}
          label={nextLabel}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight />
        </PageArrow>
      </div>
    </nav>
  );
}

function PageArrow({
  children,
  disabled,
  label,
  onClick,
}: {
  children: React.ReactNode;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="flex size-11 cursor-pointer items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:border-primary/40 hover:bg-primary-tint hover:text-primary-hover focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-35 [&_svg]:size-5"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export function getVisiblePages(
  currentPage: number,
  totalPages: number,
): PageItem[] {
  if (totalPages <= 5)
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (currentPage <= 2) return [1, 2, 3, "ellipsis-right", totalPages];
  if (currentPage === 3) return [1, 2, 3, 4, "ellipsis-right", totalPages];
  if (currentPage >= totalPages - 1)
    return [1, "ellipsis-left", totalPages - 2, totalPages - 1, totalPages];
  if (currentPage === totalPages - 2)
    return [
      1,
      "ellipsis-left",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  return [
    1,
    "ellipsis-left",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis-right",
    totalPages,
  ];
}
