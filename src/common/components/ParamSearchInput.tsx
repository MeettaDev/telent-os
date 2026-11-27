"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

type ParamSearchInputProps = {
  className?: string;
  debounceMs?: number;
  initialValue?: string;
  loadingLabel: string;
  onDebouncedChange?: (value: string) => void;
  paramName?: string;
  placeholder: string;
};

export function ParamSearchInput({
  className,
  debounceMs = 1500,
  initialValue = "",
  loadingLabel,
  onDebouncedChange,
  paramName = "q",
  placeholder,
}: ParamSearchInputProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  function handleChange(nextValue: string) {
    setValue(nextValue);
    setIsDebouncing(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const normalizedValue = nextValue.trim();

      if (normalizedValue) params.set(paramName, normalizedValue);
      else params.delete(paramName);

      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
      onDebouncedChange?.(normalizedValue);
      setIsDebouncing(false);
    }, debounceMs);
  }

  return (
    <label
      className={cn(
        "flex h-10 min-w-0 items-center gap-2 rounded-xl bg-card px-4 text-muted-foreground transition-colors focus-within:ring-2 focus-within:ring-primary/20",
        className,
      )}
    >
      <Search aria-hidden="true" className="size-4 shrink-0" />
      <span className="sr-only">{placeholder}</span>
      <input
        aria-busy={isDebouncing}
        className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:cursor-pointer"
        onChange={(event) => handleChange(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
      {isDebouncing && (
        <span aria-label={loadingLabel} role="status">
          <LoaderCircle
            aria-hidden="true"
            className="size-4 animate-spin text-primary motion-reduce:animate-none"
          />
        </span>
      )}
    </label>
  );
}
