"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

type PaginationProps = {
  currentPage: number;
  onPageChange: (page: number) => void;
  tableLabel: string;
  totalPages: number;
};

type PageItem = number | "ellipsis-left" | "ellipsis-right";

const PAGE_SIZE = 5;

export function usePagination<T>(rows: readonly T[], resetKey = "") {
  const [position, setPosition] = useState({ page: 1, resetKey });
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage =
    position.resetKey === resetKey ? Math.min(position.page, totalPages) : 1;

  if (currentPage !== position.page || resetKey !== position.resetKey) {
    setPosition({ page: currentPage, resetKey });
  }

  const offset = (currentPage - 1) * PAGE_SIZE;
  return {
    offset,
    pageRows: rows.slice(offset, offset + PAGE_SIZE),
    pagination: {
      currentPage,
      totalPages,
      onPageChange: (page: number) => setPosition({ page, resetKey }),
    },
  };
}

export function Pagination({
  currentPage,
  onPageChange,
  tableLabel,
  totalPages,
}: PaginationProps) {
  const { dictionary } = useLocale();
  const copy = dictionary.pagination;
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <nav
      className="mt-4"
      aria-label={copy.label.replace("{table}", tableLabel)}
    >
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <PageArrow
          disabled={currentPage === 1}
          label={copy.previous}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft />
        </PageArrow>
        {pages.map((page) =>
          typeof page === "number" ? (
            <button
              aria-current={page === currentPage ? "page" : undefined}
              aria-label={copy.page.replace("{page}", String(page))}
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
          label={copy.next}
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
