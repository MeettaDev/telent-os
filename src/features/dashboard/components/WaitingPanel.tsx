import type { Dictionary } from "@/common/i18n/dictionaries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { waitingItems } from "@/features/dashboard/mocks/my-work-data";

export function WaitingPanel({ dictionary }: { dictionary: Dictionary }) {
  const t = dictionary.today.waiting;
  return (
    <Card aria-labelledby="waiting-title">
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-2 px-4 pt-4 pb-3 lg:px-6 lg:pt-6">
        <CardTitle id="waiting-title" className="text-base leading-6">
          {t.title} · 10
        </CardTitle>
        <p className="text-sm font-semibold text-muted-foreground">
          {t.breakdown}
        </p>
      </CardHeader>
      <CardContent className="px-4 pb-4 lg:px-6 lg:pb-6">
        <ul className="space-y-4">
          {waitingItems.map(({ id, student }) => (
            <li key={id} className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{t.items[id].title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {student} · {t.items[id].detail}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-muted-foreground">
                {t.items[id].check}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">{t.note}</p>
      </CardContent>
    </Card>
  );
}
