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
import { BookConsultationSheet } from "@/features/students/components/ConsultationSheets";
import { intakeOwners } from "@/features/students/lib/student-intake";
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
import { InboxFileSheet } from "./InboxFileSheet";

const filters = ["waiting", "all", "mine"] as const;
const actions = ["file", "call", "guide"] as const;
type ThreadKey = (typeof inboxThreads)[number]["key"];
const avatarTones: Record<ThreadKey, string> = {
  may: "bg-primary",
  ko: "bg-orange-700",
  thiri: "bg-green-700",
  phyu: "bg-violet-600",
  su: "bg-neutral-600",
};
const actionPill =
  "h-auto min-h-9 rounded-full border border-transparent bg-muted px-3 py-1.5 text-sm font-medium whitespace-normal text-muted-foreground hover:bg-muted hover:text-foreground";

function Avatar({
  initials,
  tone,
  className,
}: {
  initials: string;
  tone?: ThreadKey;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
        tone ? avatarTones[tone] : "bg-primary",
        className,
      )}
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
    <div className={cn("w-[90%] space-y-1 self-start", outgoing && "self-end")}>
      <p
        className={cn(
          "rounded-2xl px-4 py-3 text-[15px] leading-6 whitespace-pre-wrap wrap-anywhere",
          outgoing ? "bg-primary-tint" : "bg-muted",
        )}
      >
        {children}
      </p>
      <p
        className={cn(
          "text-[11px] text-muted-foreground",
          outgoing && "text-right",
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
  meta,
  children,
}: {
  label: string;
  title: string;
  detail: string;
  meta?: string;
  children?: ReactNode;
}) {
  return (
    <div className="w-full max-w-[min(90%,22.5rem)] self-end">
      <div className="space-y-1 rounded-2xl border border-primary bg-card p-4 text-sm">
        <p className="text-[11px] font-bold uppercase text-primary-hover">
          {label}
        </p>
        <p className="text-base font-semibold wrap-anywhere">{title}</p>
        <p className="whitespace-pre-wrap text-muted-foreground wrap-anywhere">
          {detail}
        </p>
        {children}
      </div>
      {meta && (
        <p className="mt-1 text-right text-[11px] text-muted-foreground">
          {meta}
        </p>
      )}
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
    if (panel) panel.scrollTop = panel.scrollHeight;
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

  const summary =
    student &&
    [
      student.school || studentPlan?.university,
      studentPlan?.program,
      student.start &&
        dateLabel(student.start, locale, s.today, s.noDate, true),
    ]
      .filter(Boolean)
      .join(" · ");
  const nextAction = student && (
    <>
      <h3 className="text-[11px] font-bold uppercase text-primary-hover">
        {s.detail.now} · {s.filters[student.turn]}
      </h3>
      <p className="text-[15px] font-semibold leading-5 wrap-anywhere">
        {student.now === "custom"
          ? student.customAction
          : student.now === "nrc"
            ? s.detail.reviewHeading
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
        "flex h-dvh min-w-0 flex-col overflow-hidden [&>header]:shrink-0 [&>header]:pb-4",
        showThread && current && "max-md:[&>header]:hidden",
      )}
    >
      <WorkspacePageHeader
        title={
          <span className="text-[clamp(1.375rem,3vw,1.875rem)] tracking-normal">
            {dictionary.sidebar.inbox}
          </span>
        }
      />
      <div className="grid min-h-0 flex-1 grid-rows-1 gap-4 px-4 pb-4 md:grid-cols-[minmax(14rem,2fr)_minmax(0,3fr)] md:px-6 xl:grid-cols-[minmax(0,1.07fr)_minmax(0,1.84fr)_minmax(0,1fr)] xl:px-8 xl:pb-16">
        <Card
          className={cn(
            "min-h-0 min-w-0 overflow-hidden border-0 p-3 pt-3.5 md:flex",
            showThread && current && "hidden",
          )}
        >
          <div
            role="group"
            aria-label={t.filterLabel}
            className="mb-1 grid shrink-0 grid-cols-3 rounded-full bg-muted p-1"
          >
            {filters.map((item) => (
              <Button
                key={item}
                type="button"
                size="sm"
                variant="ghost"
                aria-pressed={filter === item}
                className={cn(
                  "h-auto min-h-8 rounded-full px-1 py-1 text-sm whitespace-normal",
                  filter === item
                    ? "bg-card text-foreground hover:bg-card"
                    : "font-medium hover:bg-card/60",
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
            {visible.map(({ student: person, fixture: item, latest }) => (
              <li key={person.id}>
                <button
                  type="button"
                  aria-pressed={id === person.id}
                  className={cn(
                    "flex w-full min-w-0 cursor-pointer items-start gap-2.5 rounded-2xl p-2.5 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                    id === person.id && "bg-primary-tint hover:bg-primary-tint",
                  )}
                  onClick={() => select(person)}
                >
                  <Avatar initials={person.initials} tone={item?.key} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-2">
                      <span className="text-[15px] font-semibold wrap-anywhere">
                        {person.name}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-semibold tabular-nums text-muted-foreground",
                          !latest &&
                            item?.time === "hours" &&
                            "text-destructive",
                        )}
                      >
                        {latest
                          ? formatTimestamp(latest.at)
                          : item
                            ? timeLabel(item.time)
                            : ""}
                      </span>
                    </span>
                    <span className="mt-0.5 block line-clamp-2 text-[13px] leading-[18px] text-muted-foreground wrap-anywhere">
                      {latest?.text ??
                        (item ? t.incoming[item.key] : s.detail.noMessages)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {visible.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {t.emptyFilter}
            </p>
          )}
        </Card>

        <Card
          className={cn(
            "min-h-0 min-w-0 overflow-hidden border-0 md:flex",
            !showThread && "hidden",
          )}
        >
          {student && id ? (
            <>
              <div className="flex shrink-0 flex-wrap items-center gap-2 p-3 sm:gap-3 sm:px-5 sm:py-3.5">
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
                <Avatar
                  initials={student.initials}
                  tone={fixture?.key}
                  className="size-9 text-base"
                />
                <div className="min-w-0 flex-1 basis-32">
                  <h2 className="text-base leading-5 font-bold wrap-anywhere">
                    {student.name}
                  </h2>
                  <p className="mt-1 text-xs leading-[17px] text-muted-foreground wrap-anywhere">
                    {s.stages[journeyStages[student.journeyStep - 1]]} ·{" "}
                    {s.now[student.now].detail &&
                      s.now[student.now].detail + " · "}
                    {s.contacts[student.contact]}
                  </p>
                </div>
                <Link
                  href={studentUrl}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "hidden h-10 rounded-full border-primary px-5 text-[15px] text-foreground sm:inline-flex",
                  )}
                >
                  {t.openStudent}
                </Link>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full border-primary text-sm text-foreground xl:hidden"
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
                      {summary && (
                        <p className="text-sm text-muted-foreground">
                          {summary}
                        </p>
                      )}
                      {nextAction}
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
                className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto overscroll-contain border-y px-4 py-5 before:mt-auto focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-6"
              >
                {fixture && (
                  <p className="self-center rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    {fixture.time === "09:12" || fixture.time === "hours"
                      ? t.times.oct1
                      : timeLabel(fixture.time)}
                  </p>
                )}
                {fixture?.key === "may" && (
                  <>
                    <Bubble outgoing meta={t.initialReplyMeta}>
                      {t.initialReply}
                    </Bubble>
                    <ActionCard
                      label={s.action + " · " + t.initialFileAction}
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
                    variant="success"
                    className="mx-auto rounded-full px-3.5 py-1.5 text-center text-xs whitespace-normal"
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
                          ? item.booking.status
                            ? s.intake.statuses[item.booking.status]
                            : t.callBooking.booked
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
                                item.booking.duration
                                  ? s.consultation.duration
                                  : t.callBooking.duration,
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
                        s.action +
                        " · " +
                        (item.kind === "file" && item.paper && !item.request
                          ? t.initialFileAction
                          : t.actions[item.kind])
                      }
                      title={title}
                      detail={detail}
                      meta={s.meetta + " · " + formatTimestamp(message.at)}
                    >
                      {item.kind === "file" && item.request && (
                        <>
                          <p className="flex items-center gap-1 text-[13px] font-semibold text-emerald-700 dark:text-emerald-400">
                            <Check
                              className="size-3 shrink-0"
                              aria-hidden="true"
                            />
                            {item.request.updated
                              ? t.fileRequest.updated
                              : t.fileRequest.sent}
                          </p>
                          <Link
                            href={studentUrl + "#student-documents"}
                            className="inline-block rounded-sm text-[13px] font-semibold text-primary-hover hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {t.fileRequest.documents} ›
                          </Link>
                        </>
                      )}
                    </ActionCard>
                  );
                })}
              </div>
              <div className="shrink-0 space-y-2.5 px-3 py-3 sm:px-5 sm:pb-4">
                <div className="flex flex-wrap gap-2">
                  {actions.map((kind) => (
                    <Button
                      key={kind}
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={!hydrated}
                      className={cn(
                        actionPill,
                        action === kind &&
                          "border-primary bg-primary-tint hover:bg-primary-tint",
                      )}
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
                        className={cn(actionPill, "gap-1 [&_svg]:size-3")}
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
                <form onSubmit={submit} className="flex items-center gap-2.5">
                  <Textarea
                    aria-label={t.compose}
                    value={draft}
                    maxLength={2000}
                    placeholder={t.compose}
                    rows={1}
                    className="h-12 min-h-0 min-w-0 flex-1 resize-none rounded-full border-0 bg-muted px-4 py-3 text-[15px]"
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
                    className="h-11 rounded-full px-5 text-lg"
                    disabled={!hydrated || !draft.trim()}
                  >
                    {t.send}
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
                        closeButton: false,
                        icon: null,
                        richColors: false,
                        classNames: {
                          toast:
                            "w-fit! max-w-full! rounded-3xl! border-0! bg-neutral-950! px-5! text-white!",
                          actionButton:
                            "bg-transparent! text-sky-300! font-semibold!",
                        },
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
                <BookConsultationSheet
                  key={id}
                  student={student}
                  onClose={() => setAction(null)}
                  restoreFocus={() => drawerTrigger.current?.focus()}
                  inboxBooking={{
                    host: student.owner
                      ? intakeOwners[student.owner]
                      : user.username,
                    onSend: (booking) => {
                      send(id, t.callBooking.booked, user.username, booking);
                      setSelectedId(id);
                      setError("");
                      toast.success(
                        t.callBooking.confirmation.replace(
                          "{student}",
                          student.name,
                        ),
                      );
                    },
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
          <aside className="hidden min-w-0 self-start space-y-4 xl:block">
            <Card className="gap-2 border-0 px-4.5 py-4 shadow-sm">
              <h2 className="text-base font-bold wrap-anywhere">
                {student.name}
              </h2>
              {summary && (
                <p className="text-[13px] leading-[18px] text-muted-foreground wrap-anywhere">
                  {summary}
                </p>
              )}
            </Card>
            <Card className="gap-2 border-0 bg-primary-tint px-4.5 py-4">
              {nextAction}
            </Card>
          </aside>
        )}
      </div>
    </main>
  );
}
