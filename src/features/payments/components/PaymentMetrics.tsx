import type { Dictionary } from "@/common/i18n/dictionaries";
import { Text } from "@/components/ui/typography";
import { paymentMetrics } from "@/features/payments/mocks/payments-data";

const tones = {
  blue: "bg-primary-tint text-primary-hover",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-50 text-red-700",
  green: "bg-emerald-100 text-emerald-700",
};

export function PaymentMetrics({ copy }: { copy: Dictionary["payments"] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {paymentMetrics.map((metric) => (
        <article className="surface p-5" key={metric.key}>
          <Text variant="caption" className="font-semibold uppercase">
            {copy[metric.key]}
          </Text>
          <Text className="mt-2 text-3xl font-semibold">{metric.value}</Text>
          <span
            className={`mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${tones[metric.tone]}`}
          >
            {copy[metric.noteKey]}
          </span>
        </article>
      ))}
    </section>
  );
}
