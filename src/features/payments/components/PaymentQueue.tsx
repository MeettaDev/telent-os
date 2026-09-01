import { ChevronRight } from "lucide-react";

import { ParamSearchInput } from "@/common/components/ParamSearchInput";
import type { Dictionary } from "@/common/i18n/dictionaries";
import { Text } from "@/components/ui/typography";
import {
  paymentRows,
  type PaymentStatus,
} from "@/features/payments/mocks/payments-data";

const statusTone: Record<PaymentStatus, string> = {
  awaiting: "bg-primary-tint text-primary-hover",
  needsReview: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-700",
  refund: "bg-red-50 text-red-700",
};

export function PaymentQueue({
  copy,
  onSelect,
  selectedId,
}: {
  copy: Dictionary["payments"];
  onSelect: (id: string) => void;
  selectedId: string;
}) {
  return (
    <section className="surface overflow-hidden p-5">
      <div className="flex items-center justify-between gap-4">
        <Text as="h2" variant="section-title">
          {copy.queueTitle}
        </Text>
        <span className="rounded-full bg-primary-tint px-3 py-1 text-[10px] font-semibold uppercase text-primary-hover">
          {copy.awaitingBadge}
        </span>
      </div>
      <div className="mt-4 flex flex-col gap-3 border-b border-border pb-4 lg:flex-row">
        <ParamSearchInput
          className="flex-1"
          loadingLabel={copy.searching}
          placeholder={copy.queueSearch}
        />
        <div className="flex gap-2">
          {[copy.openFilter, copy.reviewFilter, copy.refundFilter].map(
            (label, index) => (
              <button
                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold ${index === 0 ? "bg-primary-tint text-primary-hover" : index === 1 ? "bg-amber-100 text-amber-800" : "bg-red-50 text-red-700"}`}
                key={label}
                type="button"
              >
                {label}
              </button>
            ),
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[43rem]">
          <div className="grid grid-cols-[2.2fr_0.85fr_0.8fr_0.8fr_1fr_1.25rem] gap-3 px-3 py-4 text-[10px] font-semibold uppercase text-muted-foreground">
            <span>{copy.studentOrder}</span>
            <span>{copy.amount}</span>
            <span>{copy.method}</span>
            <span>{copy.received}</span>
            <span>{copy.status}</span>
            <span />
          </div>
          {paymentRows.map((row) => {
            const selected = row.id === selectedId;
            return (
              <button
                className={`relative grid w-full cursor-pointer grid-cols-[2.2fr_0.85fr_0.8fr_0.8fr_1fr_1.25rem] items-center gap-3 border-t border-border px-3 py-4 text-left transition-colors hover:bg-muted/50 ${selected ? "bg-amber-50 before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-full before:bg-amber-700" : ""}`}
                key={row.id}
                onClick={() => onSelect(row.id)}
                type="button"
              >
                <span className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-tint text-xs font-semibold text-primary-hover">
                    {row.initials}
                  </span>
                  <span>
                    <Text className="font-semibold">{row.name}</Text>
                    <Text variant="caption" className="mt-1">
                      {row.id} · {copy[row.serviceKey as keyof typeof copy]}
                    </Text>
                  </span>
                </span>
                <Text className="font-semibold tabular-nums">
                  {formatAmount(row.amount)}
                </Text>
                <Text>{copy[row.methodKey as keyof typeof copy]}</Text>
                <Text>{copy[row.receivedKey as keyof typeof copy]}</Text>
                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusTone[row.status]}`}
                >
                  {copy[row.status]}
                </span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </div>
      <Text
        variant="caption"
        className="mt-3 rounded-md bg-primary-tint px-3 py-2 text-primary-hover"
      >
        {copy.queueNote}
      </Text>
    </section>
  );
}

export function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-US").format(amount);
}
