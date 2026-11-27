import type { Dictionary } from "@/common/i18n/dictionaries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { appActivities } from "@/features/dashboard/mocks/my-work-data";

export function AppActivityPanel({ dictionary }: { dictionary: Dictionary }) {
  const t = dictionary.today.activity;
  return (
    <Card aria-labelledby="activity-title">
      <CardHeader className="px-4 pt-4 pb-3 lg:px-6 lg:pt-6">
        <CardTitle id="activity-title" className="text-base leading-6">
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 lg:px-6 lg:pb-6">
        <ul className="space-y-4">
          {appActivities.map(({ id, student, time }) => (
            <li key={id} className="flex items-start justify-between gap-4">
              <p className="text-foreground/80">
                {t.items[id].replace("{student}", student)}
              </p>
              <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                {time ?? t.yesterday}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">{t.note}</p>
      </CardContent>
    </Card>
  );
}
