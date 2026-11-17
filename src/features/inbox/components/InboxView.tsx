"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { PageSkeleton } from "@/common/components/PageSkeleton";
import { ArrowLeft, Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { WorkspacePageHeader } from "@/common/components/WorkspacePageHeader";
import {
  callDateLabel,
  dateLabel,
} from "@/features/students/lib/student-workflow";
import { journeyStages } from "@/features/students/mocks/students-data";
import { useStudentsStore } from "@/features/students/stores/students-store";
import type { Student } from "@/features/students/types/student";
import { useMockUser } from "@/common/auth/mock-auth";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";
import { inboxThreads, isWaiting, waitingCount } from "../mocks/inbox-data";
import { InboxActionDialog } from "./InboxActionDialog";
import { InboxCallSheet } from "./InboxCallSheet";
import { InboxFileSheet } from "./InboxFileSheet";

const filters = ["waiting", "all", "mine"] as const;
const actions = ["file", "call", "guide"] as const;

function Avatar({ initials }: { initials: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-tint text-base font-bold text-primary-hover"
    >
      {initials}
    </span>
  );
}

function Bubble({
  children,
  meta,
  outgoing,
}: {
  children: string;
  meta: string;
  outgoing?: boolean;
}) {
  return (
    <div
      className={cn(
        "w-fit max-w-11/12 rounded-2xl border px-4 py-3 text-sm leading-5",
        outgoing
          ? "self-end border-primary bg-primary text-primary-foreground"
          : "border-border bg-card",
      )}
    >
      <p className="whitespace-pre-wrap wrap-anywhere">{children}</p>
      <p
        className={cn(
          "mt-2 text-xs",
          outgoing ? "text-primary-foreground/90" : "text-muted-foreground",
        )}
      >
        {meta}
      </p>
    </div>
  );
}

function ActionCard({
  label,
  title,
  detail,
  children,
}: {
  label: string;
  title: string;
  detail: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "w-full max-w-85 self-end rounded-2xl border bg-card p-4 text-sm",
        children && "border-primary",
      )}
    >
      <p className="text-xs font-bold uppercase text-primary-hover">{label}</p>
      <p className="mt-2 font-semibold wrap-anywhere">{title}</p>
      <p className="mt-2 whitespace-pre-wrap text-muted-foreground wrap-anywhere">
        {detail}
      </p>
      {children}
    </div>
  );
}

export function InboxView({ initialStudent }: { initialStudent?: string }) {
  const { dictionary, locale } = useLocale();
  const t = dictionary.inboxWorkspace;
  const s = dictionary.studentWorkspace;
  const user = useMockUser();
  const students = useStudentsStore((state) => state.students);
  const plans = useStudentsStore((state) => state.plans);
  const messages = useStudentsStore((state) => state.messages);
  const hydrated = useStudentsStore((state) => state.hydrated);
  const send = useStudentsStore((state) => state.sendMessage);
  const requestFile = useStudentsStore((state) => state.requestInboxFile);
  const [filter, setFilter] = useState<(typeof filters)[number]>(
    initialStudent ? "all" : "waiting",
  );
  const [selectedId, setSelectedId] = useState(initialStudent);
  const [showThread, setShowThread] = useState(Boolean(initialStudent));
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [action, setAction] = useState<(typeof actions)[number] | null>(null);
  const [error, setError] = useState("");
  const transcript = useRef<HTMLDivElement>(null);
  const drawerTrigger = useRef<HTMLButtonElement>(null);
  const studentById = new Map(students.map((student) => [student.id, student]));
  const ids = [
    ...new Set([
      ...inboxThreads.map((thread) => thread.id),
      ...Object.keys(messages),
      ...(initialStudent ? [initialStudent] : []),
    ]),
  ];
  const threads = ids.flatMap((id) => {
    const student = studentById.get(id);
    if (!student) return [];
    const fixture = inboxThreads.find((item) => item.id === id);
    return [
      {
        student,
        fixture,
        latest: messages[id]?.at(-1),
        waiting: isWaiting(id, messages),
      },
    ];
  });
  const visible = threads.filter(
    ({ student, waiting }) =>
      filter === "all" ||
      (filter === "waiting"
        ? waiting
        : user.role === "counselor" && student.owner === "H"),
  );
  const current =
    threads.find(({ student }) => student.id === selectedId) ?? visible[0];
  const id = current?.student.id;
  const sentCount = id ? (messages[id]?.length ?? 0) : 0;
  const latestMessage = current?.latest;
  const draft = id ? (drafts[id] ?? "") : "";
  const totalWaiting = waitingCount(messages);
  const formatDate = (date: string | null) =>
    dateLabel(date, locale, s.today, s.noDate);
  const formatTimestamp = (at: string) => {
    const date = new Date(at);
    return Number.isNaN(date.getTime())
      ? ""
      : new Intl.DateTimeFormat(locale === "my" ? "my-MM" : "en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
          timeZone: "Asia/Yangon",
        }).format(date);
  };
  useEffect(() => {
    const panel = transcript.current;
    if (panel) panel.scrollTop = sentCount ? panel.scrollHeight : 0;
  }, [hydrated, id, latestMessage, sentCount, showThread]);

  function select(student: Student) {
    setSelectedId(student.id);
    setShowThread(true);
    setError("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id || !hydrated || !draft.trim()) return;
    try {
      send(id, draft, user.username);
      setSelectedId(id);
      setDrafts((previous) => ({ ...previous, [id]: "" }));
      setError("");
    } catch {
      setError(s.saveError);
    }
  }

  function applyTemplate(template: string) {
    if (!id) return;
    setDrafts((previous) => ({
      ...previous,
      [id]: [previous[id], template].filter(Boolean).join("\n").slice(0, 2000),
    }));
  }

  const student = current?.student;
  const fixture = current?.fixture;
  const studentUrl = student
    ? "/students/" + encodeURIComponent(student.id)
    : "";
  const studentPlan = id ? plans[id] : undefined;
  const review = student && ["nrc", "mofa"].includes(student.now);
  const timeLabel = (time: NonNullable<typeof fixture>["time"]) =>
    time === "09:12" ? time : t.times[time];

  if (!hydrated) return <PageSkeleton kind="inbox" />;

  const details = student && (
    <>
      <p className="text-xs leading-5 text-muted-foreground wrap-anywhere">
        {student.school} · {studentPlan?.program} ·{" "}
        {dateLabel(student.start, locale, s.today, s.noDate, true)}
      </p>
      <div
        className="grid grid-cols-6 gap-1"
        role="img"
        aria-label={s.journeyLabel.replace(
          "{step}",
          String(student.journeyStep),
        )}
      >
        {Array.from({ length: 6 }, (_, index) => (
          <span
            key={index}
            className={cn(
              "h-1.5 rounded-full",
              index < student.journeyStep - 1
                ? "bg-emerald-700"
                : index === student.journeyStep - 1
                  ? "bg-primary"
                  : "bg-border",
            )}
          />
        ))}
      </div>
      <p className="text-xs font-bold uppercase text-primary-hover">
        {s.detail.now} · {s.filters[student.turn]}
      </p>
      <p className="text-sm font-semibold leading-5 wrap-anywhere">
        {student.now === "custom"
          ? student.customAction
          : s.now[student.now].title}
        {student.nextCheck
          ? " · " + t.dueDate + " " + formatDate(student.nextCheck)
          : ""}
      </p>
      <Link
        href={review ? studentUrl + "/review/legalized" : studentUrl}
        className="w-fit rounded-sm text-sm font-semibold text-primary-hover hover:underline focus-visible:ring-2 focus-visible:ring-ring"
      >
        {review ? s.detail.openReview : t.openStudent} ›
      </Link>
    </>
  );

  return (
    <main
      id="main-content"
      className={cn(
        "flex h-dvh min-w-0 flex-col overflow-hidden [&>header]:shrink-0",
        showThread && current && "max-md:[&>header]:hidden",
      )}
    >
      <WorkspacePageHeader
        title={dictionary.sidebar.inbox}
        description={t.description.replace("{count}", String(totalWaiting))}
      />
      <div className="grid min-h-0 flex-1 grid-rows-1 gap-4 px-4 pb-4 md:grid-cols-5 md:px-6 xl:grid-cols-12 xl:px-8">
        <Card
          className={cn(
            "min-h-0 min-w-0 overflow-hidden p-2 md:col-span-2 md:flex xl:col-span-3",
            showThread && current && "hidden",
          )}
        >
          <div
            role="group"
            aria-label={t.filterLabel}
            className="flex shrink-0 flex-wrap gap-1.5 px-2 py-2"
          >
            {filters.map((item) => (
              <Button
                key={item}
                type="button"
                size="sm"
                variant="ghost"
                aria-pressed={filter === item}
                className={cn(
                  "h-auto min-h-8 whitespace-normal rounded-full bg-muted px-3 py-1 text-sm",
                  filter === item &&
                    "bg-foreground text-background hover:bg-foreground/90",
                )}
                onClick={() => {
                  setFilter(item);
                  setSelectedId(undefined);
                  setShowThread(false);
                  setError("");
                }}
              >
                {t.filters[item]}
                {item === "waiting" && " " + totalWaiting}
              </Button>
            ))}
          </div>
          <ul
            className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain focus-visible:-outline-offset-2 focus-visible:outline-ring"
            aria-label={t.threadList}
            tabIndex={visible.length ? 0 : undefined}
          >
            {visible.map(
              ({ student: person, fixture: item, latest, waiting }) => (
                <li key={person.id}>
                  <button
                    type="button"
                    aria-pressed={id === person.id}
                    className={cn(
                      "flex w-full min-w-0 cursor-pointer items-start gap-3 rounded-xl px-3 py-3 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                      id === person.id &&
                        "bg-primary-tint hover:bg-primary-tint",
                    )}
                    onClick={() => select(person)}
                  >
                    <Avatar initials={person.initials} />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-2">
                        <span className="text-sm font-bold wrap-anywhere">
                          {person.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {latest
                            ? formatTimestamp(latest.at)
                            : item
                              ? timeLabel(item.time)
                              : ""}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "mt-1 block line-clamp-2 text-sm leading-5 wrap-anywhere",
                          waiting
                            ? "font-semibold text-foreground/85"
                            : "text-muted-foreground",
                        )}
                      >
                        {latest?.text ??
                          (item ? t.incoming[item.key] : s.detail.noMessages)}
                      </span>
                    </span>
                  </button>
                </li>
              ),
            )}
          </ul>
          {visible.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {t.emptyFilter}
            </p>
          )}
        </Card>

        <Card
          className={cn(
            "min-h-0 min-w-0 overflow-hidden md:col-span-3 md:flex xl:col-span-6",
            !showThread && "hidden",
          )}
        >
          {student && id ? (
            <>
              <div className="flex shrink-0 flex-wrap items-center gap-2 p-3 sm:gap-3 sm:p-4">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="md:hidden"
                  aria-label={t.back}
                  onClick={() => setShowThread(false)}
                >
                  <ArrowLeft aria-hidden="true" />
                </Button>
                <Avatar initials={student.initials} />
                <div className="min-w-0 flex-1 basis-32">
                  <h2 className="text-base font-semibold wrap-anywhere">
                    {student.name}
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {s.stages[journeyStages[student.journeyStep - 1]]} ·{" "}
                    {s.now[student.now].detail || s.contacts[student.contact]}
                  </p>
                </div>
                <Link
                  href={studentUrl}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "hidden text-sm sm:inline-flex",
                  })}
                >
                  {t.openStudent}
                </Link>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-sm xl:hidden"
                    >
                      {t.details}
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    closeLabel={s.close}
                    aria-describedby={undefined}
                  >
                    <DialogTitle className="pr-8 text-lg font-semibold wrap-anywhere">
                      {student.name}
                    </DialogTitle>
                    <div className="mt-3 flex flex-col gap-3">
                      {details}
                      {review && (
                        <Link
                          href={studentUrl}
                          className="w-fit rounded-sm text-sm font-semibold text-primary-hover hover:underline focus-visible:ring-2 focus-visible:ring-ring sm:hidden"
                        >
                          {t.openStudent} ›
                        </Link>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div
                ref={transcript}
                role="log"
                aria-label={t.transcript}
                tabIndex={0}
                className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain border-y bg-muted/45 p-4 focus-visible:-outline-offset-2 focus-visible:outline-ring lg:p-5"
              >
                {fixture?.key === "may" && (
                  <>
                    <Bubble outgoing meta={t.initialReplyMeta}>
                      {t.initialReply}
                    </Bubble>
                    <ActionCard
                      label={t.actions.file}
                      title={t.initialFile}
                      detail={t.initialFileDetail}
                    />
                  </>
                )}
                {fixture && (
                  <Bubble meta={student.name + " · " + timeLabel(fixture.time)}>
                    {t.incoming[fixture.key]}
                  </Bubble>
                )}
                {fixture?.key === "may" && (
                  <Badge
                    variant="secondary"
                    className="mx-auto whitespace-normal text-center text-xs"
                  >
                    {t.received}
                  </Badge>
                )}
                {!fixture && !sentCount && (
                  <p className="text-sm text-muted-foreground">
                    {s.detail.noMessages}
                  </p>
                )}
                {messages[id]?.map((message) => {
                  const item = message.action;
                  if (!item)
                    return (
                      <Bubble
                        key={message.id}
                        outgoing
                        meta={"Meetta · " + formatTimestamp(message.at)}
                      >
                        {message.text}
                      </Bubble>
                    );
                  const title =
                    item.kind === "file"
                      ? (item.fileName ??
                        (item.paper
                          ? item.request && item.paper === "fatherNrc"
                            ? t.initialFile
                            : (s.review.papers[
                                item.paper as keyof typeof s.review.papers
                              ] ?? item.paper)
                          : item.document
                            ? s.documents[item.document].title
                            : t.fileRequest.other))
                      : item.kind === "guide"
                        ? t.guides[item.guide].title
                        : item.booking
                          ? t.callBooking.booked
                          : t.consultation;
                  const detail =
                    item.kind === "file"
                      ? [
                          t.dueDate + " " + formatDate(item.date),
                          item.paper || item.request ? message.text : "",
                        ]
                          .filter(Boolean)
                          .join("\n")
                      : item.kind === "call"
                        ? item.booking
                          ? [
                              callDateLabel(item.date, locale) +
                                " · " +
                                item.time +
                                " MMT",
                              [
                                t.callBooking.locations[item.booking.mode],
                                t.callBooking.duration,
                                t.callBooking.withHost.replace(
                                  "{host}",
                                  item.booking.host,
                                ),
                              ].join(" · "),
                            ].join("\n")
                          : formatDate(item.date) + " · " + item.time + " MMT"
                        : t.guides[item.guide].detail;
                  return (
                    <ActionCard
                      key={message.id}
                      label={
                        item.kind === "file" && item.paper && !item.request
                          ? s.review.sentBack
                          : t.actions[item.kind]
                      }
                      title={title}
                      detail={detail}
                    >
                      {item.kind === "file" && item.request && (
                        <>
                          <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            <Check className="size-4" aria-hidden="true" />
                            {item.request.updated
                              ? t.fileRequest.updated
                              : t.fileRequest.sent}
                          </p>
                          <Link
                            href={studentUrl + "#student-documents"}
                            className="mt-3 inline-block rounded-sm font-semibold text-primary-hover hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {t.fileRequest.documents} ›
                          </Link>
                        </>
                      )}
                    </ActionCard>
                  );
                })}
              </div>
              <div className="shrink-0 space-y-2 p-3 sm:p-4">
                <div className="flex flex-wrap gap-2">
                  {actions.map((kind) => (
                    <Button
                      key={kind}
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={!hydrated}
                      className="h-auto min-h-8 whitespace-normal bg-primary-tint py-1 text-xs text-primary-hover hover:bg-primary-tint/70"
                      onClick={(event) => {
                        if (kind !== "guide")
                          drawerTrigger.current = event.currentTarget;
                        setAction(kind);
                      }}
                    >
                      {t.actions[kind]}
                    </Button>
                  ))}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-auto min-h-8 whitespace-normal bg-primary-tint py-1 text-xs text-primary-hover hover:bg-primary-tint/70"
                      >
                        {t.templates} <ChevronDown aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {t.replies.map(({ label, text }) => (
                        <DropdownMenuItem
                          key={label}
                          onSelect={() => applyTemplate(text)}
                        >
                          {label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <form
                  onSubmit={submit}
                  className="flex flex-wrap items-end justify-end gap-2 rounded-xl border p-2 focus-within:ring-2 focus-within:ring-primary/20"
                >
                  <Textarea
                    aria-label={t.compose}
                    value={draft}
                    maxLength={2000}
                    placeholder={t.compose}
                    className="h-14 min-h-0 min-w-0 flex-1 resize-none border-0 bg-transparent px-2 py-2 focus:ring-0 sm:h-20 sm:text-sm"
                    onChange={(event) => {
                      setDrafts((previous) => ({
                        ...previous,
                        [id]: event.target.value,
                      }));
                      setError("");
                    }}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="text-sm"
                    disabled={!hydrated || !draft.trim()}
                  >
                    {s.forms.send}
                  </Button>
                </form>
                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
              </div>
              {action === "file" && (
                <InboxFileSheet
                  key={id}
                  student={student}
                  may={fixture?.key === "may"}
                  onClose={() => setAction(null)}
                  onRestoreFocus={() => drawerTrigger.current?.focus()}
                  onSend={(file, message, seededOpen) => {
                    const undo = requestFile(
                      id,
                      file,
                      message,
                      user.username,
                      seededOpen,
                    );
                    setSelectedId(id);
                    setError("");
                    const confirmation = toast.success(
                      t.fileRequest.confirmation
                        .replace("{student}", student.name)
                        .replace("{date}", formatDate(file.date)),
                      {
                        position: "bottom-center",
                        duration: 10_000,
                        action: { label: t.fileRequest.undo, onClick: undo },
                      },
                    );
                    window.setTimeout(
                      () => toast.dismiss(confirmation),
                      10_000,
                    );
                  }}
                />
              )}
              {action === "call" && (
                <InboxCallSheet
                  key={id}
                  studentId={id}
                  studentName={student.name}
                  host={
                    student.owner === "H"
                      ? "Hsu Wai"
                      : student.owner === "N"
                        ? "Nway Nway"
                        : user.username
                  }
                  onClose={() => setAction(null)}
                  onRestoreFocus={() => drawerTrigger.current?.focus()}
                  onSend={(booking) => {
                    send(id, t.callBooking.booked, user.username, booking);
                    setSelectedId(id);
                    setError("");
                    toast.success(
                      t.callBooking.confirmation.replace(
                        "{student}",
                        student.name,
                      ),
                    );
                  }}
                />
              )}
              {action === "guide" && (
                <InboxActionDialog
                  key={id + action}
                  student={student.name}
                  onClose={() => setAction(null)}
                  onSend={(text, item) => {
                    send(id, text, user.username, item);
                    setSelectedId(id);
                    setError("");
                  }}
                />
              )}
            </>
          ) : (
            <p className="p-6 text-sm text-muted-foreground">
              {t.selectThread}
            </p>
          )}
        </Card>

        {student && (
          <aside className="hidden min-w-0 self-start xl:col-span-3 xl:block">
            <Card className="gap-3 p-5">
              <h2 className="text-lg font-semibold wrap-anywhere">
                {student.name}
              </h2>
              {details}
            </Card>
          </aside>
        )}
      </div>
    </main>
  );
}
