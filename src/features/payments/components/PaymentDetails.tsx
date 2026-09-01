import { AlertTriangle, Check, ExternalLink } from "lucide-react";

import type { Dictionary } from "@/common/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import { formatAmount } from "@/features/payments/components/PaymentQueue";
import { paymentRows } from "@/features/payments/mocks/payments-data";

export function PaymentDetails({
  copy,
  selectedId,
}: {
  copy: Dictionary["payments"];
  selectedId: string;
}) {
  const row =
    paymentRows.find((item) => item.id === selectedId) ?? paymentRows[0];
  const payerMismatch = row.id === paymentRows[0].id;
  return (
    <aside className="surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Text as="h2" variant="section-title">
            {copy.detailsTitle}
          </Text>
          <Text className="mt-3 font-semibold">{row.name}</Text>
          <Text variant="caption" className="mt-1">
            {row.id} · {copy.selectedSupport}
          </Text>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase ${payerMismatch ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700"}`}
        >
          {payerMismatch ? copy.needsReview : copy.ready}
        </span>
      </div>
      <section className="mt-5 rounded-xl bg-primary-tint p-4">
        <Text
          variant="caption"
          className="font-semibold uppercase text-primary-hover"
        >
          {copy.serviceOrder}
        </Text>
        <Text className="mt-2 font-semibold">
          {copy[row.serviceKey as keyof typeof copy]}
        </Text>
        <div className="mt-2 flex items-center justify-between">
          <Text variant="caption">
            {copy.expected} MMK {formatAmount(row.amount)}
          </Text>
          <Text className="font-semibold text-primary-hover">
            1 {copy.task}
          </Text>
        </div>
      </section>
      <Text as="h3" variant="card-title" className="mt-5">
        {copy.evidence}
      </Text>
      <section className="mt-3 flex gap-4 rounded-xl bg-muted p-4">
        <div className="flex h-24 w-20 shrink-0 flex-col items-center justify-center rounded-lg bg-card text-center">
          <Text className="font-bold text-primary-hover">BANK</Text>
          <Text variant="caption" className="mt-1 text-[9px] uppercase">
            {copy.transfer}
          </Text>
        </div>
        <div className="min-w-0">
          <Text className="font-semibold">MMK {formatAmount(row.amount)}</Text>
          <Text variant="caption" className="mt-2">
            17 Aug 2026 · 10:42
          </Text>
          <Text variant="caption" className="mt-2">
            {copy.payer}: {row.payer}
          </Text>
          <button
            className="mt-2 flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary-hover"
            type="button"
          >
            {copy.openProof}
            <ExternalLink className="size-3" />
          </button>
        </div>
      </section>
      <Text as="h3" variant="card-title" className="mt-5">
        {copy.matchingChecks}
      </Text>
      <div className="mt-2">
        {[
          [copy.amountMatches, `MMK ${formatAmount(row.amount)}`, true],
          [copy.dateValid, copy.today, true],
          [
            copy.payerMatches,
            payerMismatch ? `${row.payer} ≠ ${copy.fullName}` : copy.matches,
            !payerMismatch,
          ],
          [copy.referenceFound, row.id, true],
        ].map(([label, value, passed]) => (
          <div
            className="grid grid-cols-[1.25rem_1fr_auto] items-center gap-3 py-3 text-xs"
            key={String(label)}
          >
            <span
              className={`flex size-5 items-center justify-center rounded-md ${passed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}
            >
              {passed ? (
                <Check className="size-3" />
              ) : (
                <AlertTriangle className="size-3" />
              )}
            </span>
            <span>{label}</span>
            <b className={passed ? "" : "text-amber-800"}>{value}</b>
          </div>
        ))}
      </div>
      <section className="mt-3 rounded-lg bg-emerald-100 p-4">
        <Text
          variant="caption"
          className="font-semibold uppercase text-emerald-800"
        >
          {copy.afterVerified}
        </Text>
        <Text className="mt-2">{copy.activationNote}</Text>
      </section>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Button variant="app-primary">{copy.requestClarification}</Button>
        <Button disabled={payerMismatch} variant="outline">
          {copy.resolvePayer}
        </Button>
      </div>
    </aside>
  );
}
