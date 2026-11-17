import type { Dictionary } from "@/common/i18n/dictionaries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { todayTasks } from "@/features/dashboard/mocks/my-work-data";
import { cn } from "@/lib/utils";

export function ActionQueue({ dictionary }: { dictionary: Dictionary }) {
  const t = dictionary.today;
  return (
    <Card className="min-w-0" aria-labelledby="queue-title">
      <CardHeader className="px-4 pt-4 pb-3 lg:px-6 lg:pt-6">
        <CardTitle id="queue-title" className="text-base leading-6">
          {t.doFirst} · {todayTasks.length}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 lg:px-6 lg:pb-6">
        <Table aria-labelledby="queue-title" className="min-w-5xl" compact>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">{t.due}</TableHead>
              <TableHead className="w-48">{t.student}</TableHead>
              <TableHead>{t.whatToDo}</TableHead>
              <TableHead className="w-36">{t.whoseTurn}</TableHead>
              <TableHead className="w-24">{t.onIt}</TableHead>
              <TableHead className="w-40">
                <span className="sr-only">{t.action}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {todayTasks.map((task) => {
              const content = t.tasks[task.id];
              return (
                <TableRow
                  key={task.id}
                  className={task.overdue ? "bg-overdue" : undefined}
                >
                  <TableCell>
                    <p className="whitespace-nowrap font-semibold">
                      {content.due}
                    </p>
                    {content.dueNote && (
                      <p
                        className={cn(
                          "mt-1 text-sm",
                          task.overdue || task.missingDate
                            ? "text-destructive"
                            : "text-muted-foreground",
                        )}
                      >
                        {content.dueNote}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {task.student}
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold">{content.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {content.detail}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={task.actor === "meetta" ? "tint" : "secondary"}
                    >
                      {t[task.actor]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {task.owner ? (
                      <span
                        aria-label={task.owner === "N" ? t.ownerN : t.ownerH}
                        className={cn(
                          "flex size-7 items-center justify-center rounded-full text-sm font-semibold text-white",
                          task.owner === "N" ? "bg-violet-600" : "bg-primary",
                        )}
                      >
                        {task.owner}
                      </span>
                    ) : (
                      <Button
                        type="button"
                        variant="app-text"
                        className="h-auto p-0 text-sm"
                      >
                        {t.claim}
                        <span className="sr-only"> · {task.student}</span>
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant={task.primaryAction ? "default" : "outline"}
                      className="text-sm"
                    >
                      {content.action}
                      <span className="sr-only"> · {task.student}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
