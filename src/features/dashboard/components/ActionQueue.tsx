"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useMockUser } from "@/common/auth/mock-auth";
import type { Dictionary } from "@/common/i18n/dictionaries";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { todayTasks } from "@/features/dashboard/mocks/my-work-data";
import type { TodayTask } from "@/features/dashboard/types/my-work";
import { StudentActionDialog } from "@/features/students/components/StudentActionDialog";
import { useStudentsStore } from "@/features/students/stores/students-store";
import type { Student } from "@/features/students/types/student";
import { cn } from "@/lib/utils";
import styles from "@/common/components/workspace.module.css";

const groups = ["overdue", "today", "tomorrow", "noAction"] as const;
const outline =
  "max-w-full rounded-full border-primary px-4 text-sm text-foreground whitespace-normal";
const avatar =
  "inline-flex size-7 items-center justify-center rounded-full text-xs font-bold text-white";
const popover =
  "w-[min(26rem,calc(100vw-2rem))] gap-4 rounded-3xl p-5 text-card-foreground shadow-2xl sm:p-6";

export function ActionQueue({ dictionary }: { dictionary: Dictionary }) {
  const t = dictionary.today;
  const user = useMockUser();
  const students = useStudentsStore((state) => state.students);
  const [claimed, setClaimed] = useState<Set<TodayTask["id"]>>(new Set());
  const [showReviewOwner, setShowReviewOwner] = useState(false);
  const [nextStudent, setNextStudent] = useState<Student | null>(null);
  const claimFocus = useRef<TodayTask["id"] | null>(null);

  function claim(id: TodayTask["id"]) {
    claimFocus.current = id;
    setClaimed((previous) => new Set(previous).add(id));
    setShowReviewOwner(false);
  }

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group} aria-labelledby={`today-${group}`}>
          <h2
            id={`today-${group}`}
            className={cn(
              "mb-2.5 text-sm font-bold",
              group === "today"
                ? "text-primary"
                : group === "tomorrow"
                  ? "text-muted-foreground"
                  : "text-destructive",
            )}
          >
            {t.groups[group]}
          </h2>
          <Card
            className={cn(
              group === "overdue" ? "border-destructive" : "border-0",
            )}
          >
            <ul className="divide-y divide-border">
              {todayTasks
                .filter((task) => task.group === group)
                .map((task) => {
                  const content = t.tasks[task.id];
                  const student = students.find(
                    ({ id }) => id === task.studentId,
                  );
                  const studentHref = student
                    ? `/students/${student.id}`
                    : `/students?${new URLSearchParams({ search: task.student })}`;
                  const actionHref =
                    task.id === "chat" && student
                      ? `/inbox?${new URLSearchParams({ student: student.id })}`
                      : student && task.primaryAction
                        ? `${studentHref}/review/legalized`
                        : student && task.id === "plan"
                          ? `${studentHref}/plan`
                          : studentHref;
                  const isClaimed = claimed.has(task.id);
                  const hasReviewer = task.owner === "N" && !isClaimed;
                  const label = (
                    <>
                      {content.action}
                      <span className="sr-only"> · {task.student}</span>
                    </>
                  );
                  const actionClass = cn(
                    outline,
                    task.primaryAction && "bg-primary-tint",
                  );
                  const phone = student?.phone.replace(/[\s()-]/g, "") ?? "";

                  return (
                    <li
                      key={task.id}
                      className={cn(
                        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-3.5 xl:grid-cols-[15%_18%_minmax(0,1fr)_9%_10%_15%] xl:gap-x-0 xl:px-5 xl:py-2.5",
                        group === "today"
                          ? "xl:min-h-[70px]"
                          : "xl:min-h-[76px]",
                      )}
                    >
                      <div className="col-start-1 row-start-1 min-w-0 xl:col-auto xl:row-auto xl:pr-3">
                        <p className="font-semibold">{content.due}</p>
                        {content.dueNote && (
                          <p
                            className={cn(
                              "text-xs",
                              group === "overdue" ||
                                group === "noAction" ||
                                task.id === "chat"
                                ? "text-destructive"
                                : "text-muted-foreground",
                            )}
                          >
                            {content.dueNote}
                          </p>
                        )}
                      </div>
                      <p className="col-start-1 row-start-2 min-w-0 font-semibold wrap-anywhere xl:col-auto xl:row-auto xl:pr-3">
                        {task.student}
                      </p>
                      <div className="col-span-2 row-start-3 min-w-0 xl:col-auto xl:row-auto xl:pr-3">
                        <p className="font-semibold wrap-anywhere">
                          {content.title}
                        </p>
                        {group !== "overdue" && (
                          <p className="text-xs text-muted-foreground wrap-anywhere">
                            {content.detail}
                          </p>
                        )}
                      </div>
                      <div className="col-start-1 row-start-4 xl:col-auto xl:row-auto xl:justify-self-center">
                        <Badge
                          className="rounded-full px-2.5 py-1 text-xs"
                          variant={
                            task.actor === "meetta" ? "tint" : "destructive"
                          }
                        >
                          {t[task.actor]}
                        </Badge>
                      </div>
                      <div className="col-start-2 row-span-2 row-start-1 max-w-full justify-self-end xl:col-auto xl:row-auto xl:justify-self-center">
                        {hasReviewer ? (
                          <Popover
                            open={showReviewOwner}
                            onOpenChange={setShowReviewOwner}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={`${t.ownerN} · ${task.student}`}
                                className={cn(
                                  avatar,
                                  "bg-violet-600 hover:bg-violet-700 hover:text-white",
                                )}
                              >
                                N
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              aria-label={t.reviewOwner.title}
                              sideOffset={60}
                              align="end"
                              alignOffset={-134}
                              collisionPadding={12}
                              className={cn(styles.palette, popover)}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  aria-hidden="true"
                                  className={cn(
                                    avatar,
                                    "size-9 shrink-0 bg-violet-600 text-base",
                                  )}
                                >
                                  N
                                </span>
                                <div className="min-w-0">
                                  <h3 className="text-lg leading-tight font-bold">
                                    {t.reviewOwner.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {t.reviewOwner.detail}
                                  </p>
                                </div>
                              </div>
                              <p className="rounded-xl bg-muted px-3.5 py-2.5 font-semibold">
                                {t.reviewOwner.activity}
                              </p>
                              <div className="flex flex-wrap items-center justify-end gap-2.5">
                                <a
                                  href={`mailto:?subject=${encodeURIComponent(t.reviewOwner.message)}&body=${encodeURIComponent(task.student + " · " + content.title)}`}
                                  className={cn(
                                    buttonVariants({ variant: "outline" }),
                                    outline,
                                  )}
                                >
                                  {t.reviewOwner.message}
                                </a>
                                <Button
                                  type="button"
                                  onClick={() => claim(task.id)}
                                  className="rounded-full px-5"
                                >
                                  {t.reviewOwner.takeOver}
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        ) : isClaimed || task.owner ? (
                          <span
                            aria-label={isClaimed ? user.username : t.ownerH}
                            className={cn(avatar, "bg-primary")}
                            tabIndex={isClaimed ? -1 : undefined}
                            ref={(node) => {
                              if (!node || claimFocus.current !== task.id)
                                return;
                              claimFocus.current = null;
                              node.focus();
                            }}
                          >
                            {isClaimed ? user.initials : task.owner}
                          </span>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => claim(task.id)}
                            className={outline}
                          >
                            {t.claim}
                            <span className="sr-only"> · {task.student}</span>
                          </Button>
                        )}
                      </div>
                      <div className="col-start-2 row-start-4 max-w-full justify-self-end xl:col-auto xl:row-auto xl:justify-self-center">
                        {hasReviewer || (task.id === "next" && student) ? (
                          <Button
                            type="button"
                            variant="outline"
                            className={actionClass}
                            onClick={() => {
                              if (hasReviewer) setShowReviewOwner(true);
                              else if (student) setNextStudent(student);
                            }}
                          >
                            {label}
                          </Button>
                        ) : task.id === "contact" ? (
                          /^\+95\d+$/.test(phone) ? (
                            <a
                              href={`viber://chat?number=${encodeURIComponent(phone)}`}
                              className={cn(
                                buttonVariants({ variant: "outline" }),
                                actionClass,
                              )}
                            >
                              {label}
                            </a>
                          ) : (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className={actionClass}
                                >
                                  {label}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className={cn(styles.palette, "rounded-xl p-4")}
                                align="end"
                              >
                                {t.noViberNumber}
                              </PopoverContent>
                            </Popover>
                          )
                        ) : (
                          <Link
                            href={actionHref}
                            className={cn(
                              buttonVariants({ variant: "outline" }),
                              actionClass,
                            )}
                          >
                            {label}
                          </Link>
                        )}
                      </div>
                    </li>
                  );
                })}
            </ul>
          </Card>
        </section>
      ))}
      {nextStudent && (
        <StudentActionDialog
          student={nextStudent}
          kind="next"
          onClose={() => setNextStudent(null)}
        />
      )}
    </div>
  );
}
