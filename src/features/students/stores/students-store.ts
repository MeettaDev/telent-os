"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  createPapers,
  createPlan,
  createWorkspace,
  documentRows,
  reviewReasons,
  students as studentFixtures,
} from "@/features/students/mocks/students-data";
import {
  findIntakeMatches,
  studentIntakeFormSchema,
  type StudentIntakeForm,
} from "@/features/students/lib/student-intake";
import {
  isCallSlotTaken,
  planIsReady,
  reviewCanDecide,
  yangonToday,
} from "@/features/students/lib/student-workflow";
import {
  dateSchema,
  messageActionSchema,
  studentSchema,
  storedWorkspaceSchema,
  type Student,
  type StudentPlan,
  type PaperReview,
  type DocumentId,
  type HistoryEvent,
  type MessageAction,
  type StudentMessage,
  type WorkspaceData,
} from "@/features/students/types/student";

type FixRequest = {
  version: number;
  reason: (typeof reviewReasons)[number] | "other";
  message: string;
  author: string;
  nextCheck: string;
};

type FileAction = Extract<MessageAction, { kind: "file" }>;

type State = WorkspaceData & {
  hydrated: boolean;
  addStudent: (student: Student) => void;
  createIntakeStudent: (
    input: StudentIntakeForm,
    reviewedIds?: string[],
  ) => { id: string } | { matches: Student[] };
  setNextAction: (
    id: string,
    values: Pick<Student, "customAction" | "turn" | "nextCheck" | "owner">,
  ) => void;
  savePlan: (
    id: string,
    plan: StudentPlan,
    status: StudentPlan["status"],
    reason?: string,
  ) => boolean;
  updatePaper: (
    id: string,
    group: DocumentId,
    paperId: string,
    values: Partial<Pick<PaperReview, "checks" | "reasons" | "note">>,
  ) => void;
  decidePaper: (
    id: string,
    group: DocumentId,
    paperId: string,
    decision: "approved" | "fix",
    detail: string,
    fix?: FixRequest,
  ) => boolean;
  sendMessage: (
    id: string,
    text: string,
    author: string,
    action?: MessageAction,
  ) => void;
  requestFile: (
    id: string,
    group: DocumentId,
    detail: string,
    message?: {
      author: string;
      action: Extract<MessageAction, { kind: "file" }>;
    },
  ) => void;
  requestInboxFile: (
    id: string,
    action: FileAction,
    text: string,
    author: string,
    seededOpen: boolean,
  ) => () => void;
};

export function openFileRequest(
  state: Pick<WorkspaceData, "messages" | "documents" | "reviews">,
  id: string,
  file: Pick<FileAction, "document" | "paper" | "fileName">,
) {
  const key = id + ":" + file.document;
  if (
    state.documents[key] === "approved" ||
    (file.paper &&
      state.reviews[key]?.find(({ id }) => id === file.paper)?.status ===
        "approved")
  )
    return;
  return state.messages[id]?.findLast(
    ({ action }) =>
      action?.kind === "file" &&
      action.document === file.document &&
      action.paper === file.paper &&
      action.fileName?.toLowerCase() === file.fileName?.toLowerCase(),
  );
}

function event(kind: HistoryEvent["kind"], detail = ""): HistoryEvent {
  return {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    kind,
    detail,
  };
}

function appendHistory(state: State, id: string, entry: HistoryEvent) {
  return { ...state.history, [id]: [entry, ...(state.history[id] ?? [])] };
}

function appendMessage(state: State, id: string, message: StudentMessage) {
  return { ...state.messages, [id]: [...(state.messages[id] ?? []), message] };
}

export const useStudentsStore = create<State>()(
  persist(
    (set, get) => ({
      ...createWorkspace(),
      hydrated: false,
      createIntakeStudent(input, reviewedIds = []) {
        const values = studentIntakeFormSchema.parse(input);
        const previous = get();
        const matches = findIntakeMatches(
          previous.students,
          values.reachableContact,
        );
        if (
          matches.length &&
          (!values.separateReason ||
            matches.some(({ id }) => !reviewedIds.includes(id)))
        )
          return { matches };

        const id = "STU-" + crypto.randomUUID();
        const consultation =
          values.status === "completed"
            ? {
                status: values.status,
                date: values.completedDate,
                outcome: values.outcome,
                goal: values.goal,
              }
            : values.status === "scheduled"
              ? {
                  status: values.status,
                  date: values.scheduledDate,
                  time: values.scheduledTime,
                }
              : { status: values.status };
        try {
          previous.addStudent({
            id,
            name: values.name,
            initials: Array.from(values.name)[0].toUpperCase(),
            phone: values.reachableContact,
            nrc: "",
            school: "",
            start: "",
            contact: "new",
            journeyStep: 1,
            now: values.nextAction ? "custom" : "none",
            customAction: values.nextAction,
            turn: values.nextAction ? "meetta" : "noOne",
            nextCheck: values.dueDate || null,
            owner: values.owner,
            intake: {
              channel: values.channel,
              contactChannel: values.contactChannel,
              contactPerson: values.contactPerson,
              referralSource: values.referralSource,
              googleEmail: values.googleEmail,
              note: values.note,
              consultation,
              ...(matches.length && { separateReason: values.separateReason }),
            },
          });
        } catch (error) {
          if (get() !== previous) {
            // Zustand updates memory before writing to storage.
            try {
              set(previous, true);
            } catch {
              // The in-memory state has already been restored.
            }
          }
          throw error;
        }
        return { id };
      },
      addStudent(student) {
        if (!student.name.trim()) return;
        student = studentSchema.parse(student);
        const entry = event("studentAdded", student.name);
        set((state) => ({
          students: [...state.students, student],
          plans: { ...state.plans, [student.id]: createPlan(student) },
          reviews: {
            ...state.reviews,
            ...Object.fromEntries(
              documentRows.map(({ id }) => [
                student.id + ":" + id,
                createPapers(id).map((paper) => ({
                  ...paper,
                  status: "checking" as const,
                  version: 1,
                  reasons: [],
                })),
              ]),
            ),
          },
          documents: {
            ...state.documents,
            ...Object.fromEntries(
              documentRows.map(({ id }) => [
                student.id + ":" + id,
                id === "topik" || id === "bank" ? "longTerm" : "toSend",
              ]),
            ),
          },
          history: appendHistory(state, student.id, entry),
        }));
      },
      setNextAction(id, values) {
        if (
          !values.customAction.trim() ||
          !dateSchema.safeParse(values.nextCheck).success ||
          (values.turn === "meetta" && !values.owner)
        )
          return;
        const entry = event("nextActionSet", values.customAction);
        set((state) => ({
          students: state.students.map((student) =>
            student.id === id
              ? { ...student, ...values, now: "custom" }
              : student,
          ),
          history: appendHistory(state, id, entry),
        }));
      },
      savePlan(id, plan, status, reason = "") {
        const current = get().plans[id];
        if (
          !current ||
          (status === "sent" && !planIsReady(plan)) ||
          ((status === "confirmed" || status === "changeRequested") &&
            current.status !== "sent") ||
          (status === "changeRequested" && !reason.trim())
        )
          return false;
        const kind =
          status === "draft"
            ? "planSaved"
            : status === "sent"
              ? "planSent"
              : status === "confirmed"
                ? "planConfirmed"
                : "planChangeRequested";
        const entry = event(kind, reason);
        set((state) => ({
          plans: {
            ...state.plans,
            [id]: { ...plan, status, changeReason: reason },
          },
          students: state.students.map((student) =>
            student.id !== id || status === "draft"
              ? student
              : {
                  ...student,
                  now: kind === "planSaved" ? student.now : kind,
                  turn: status === "changeRequested" ? "meetta" : "student",
                  ...(status === "confirmed"
                    ? {
                        school: plan.university,
                        journeyStep: Math.max(2, student.journeyStep),
                      }
                    : {}),
                },
          ),
          history: appendHistory(state, id, entry),
        }));
        return true;
      },
      updatePaper(id, group, paperId, values) {
        const key = id + ":" + group;
        set((state) => ({
          reviews: {
            ...state.reviews,
            [key]: (state.reviews[key] ?? []).map((paper) =>
              paper.id === paperId ? { ...paper, ...values } : paper,
            ),
          },
        }));
      },
      decidePaper(id, group, paperId, decision, detail, fix) {
        const key = id + ":" + group;
        const documentStatus = get().documents[key];
        if (documentStatus === "toSend" || documentStatus === "longTerm")
          return false;
        const paper = get().reviews[key]?.find((item) => item.id === paperId);
        if (!paper) return false;
        if (
          fix &&
          (decision !== "fix" ||
            paper.status === "fix" ||
            paper.version !== fix.version ||
            (fix.reason !== "other" && !reviewReasons.includes(fix.reason)) ||
            !fix.message.trim())
        )
          return false;
        const reviewed = fix
          ? { ...paper, reasons: [fix.reason], fixMessage: fix.message.trim() }
          : paper;
        if (!reviewCanDecide(reviewed, decision)) return false;
        const action =
          fix &&
          messageActionSchema.parse({
            kind: "file",
            document: group,
            paper: paperId,
            date: fix.nextCheck,
          });
        const entry = event(
          decision === "approved" ? "reviewApproved" : "reviewFix",
          fix
            ? [detail, fix.author, "v" + fix.version, reviewed.fixMessage].join(
                " · ",
              )
            : detail,
        );
        set((state) => {
          const papers = state.reviews[key].map((item) =>
            item.id === paperId ? { ...reviewed, status: decision } : item,
          );
          const approved = papers.every((item) => item.status === "approved");
          const allApproved = documentRows.every(({ id: documentId }) =>
            documentId === group
              ? approved
              : state.documents[id + ":" + documentId] === "approved",
          );
          return {
            reviews: { ...state.reviews, [key]: papers },
            documents: {
              ...state.documents,
              [key]: approved
                ? "approved"
                : papers.some((item) => item.status === "fix")
                  ? "fix"
                  : "checking",
            },
            students: state.students.map((student) =>
              student.id !== id
                ? student
                : {
                    ...student,
                    ...(decision === "fix"
                      ? {
                          now: "fixRequested" as const,
                          turn: "student" as const,
                          ...(fix && { nextCheck: fix.nextCheck }),
                        }
                      : allApproved &&
                          ["nrc", "mofa", "fixRequested"].includes(student.now)
                        ? {
                            now: "documentsApproved" as const,
                            turn: "noOne" as const,
                            nextCheck: null,
                          }
                        : {}),
                  },
            ),
            history: appendHistory(state, id, entry),
            ...(fix &&
              action && {
                messages: appendMessage(state, id, {
                  id: entry.id,
                  at: entry.at,
                  text: fix.message.trim(),
                  author: fix.author,
                  action,
                }),
              }),
          };
        });
        return true;
      },
      sendMessage(id, text, author, action) {
        if (!text.trim()) return;
        if (action) action = messageActionSchema.parse(action);
        if (
          action?.kind === "call" &&
          action.booking &&
          (action.date <= yangonToday() ||
            isCallSlotTaken(
              get().messages,
              id,
              action.booking.host,
              action.date,
              action.time,
            ))
        ) {
          throw new Error("Call slot unavailable");
        }
        if (action?.kind === "file" && action.document) {
          get().requestFile(id, action.document, text.trim(), {
            author,
            action,
          });
          return;
        }
        const entry = event("messageSent", text.trim());
        set((state) => ({
          messages: appendMessage(state, id, {
            id: entry.id,
            at: entry.at,
            text: entry.detail,
            author,
            action,
          }),
          history: appendHistory(state, id, entry),
        }));
      },
      requestFile(id, group, detail, message) {
        const key = id + ":" + group;
        const entry = event("fileRequested", detail);
        set((state) => ({
          documents: { ...state.documents, [key]: "toSend" },
          ...(message && {
            messages: appendMessage(state, id, {
              id: entry.id,
              at: entry.at,
              text: detail,
              ...message,
            }),
          }),
          reviews: {
            ...state.reviews,
            [key]: (state.reviews[key] ?? []).map((paper) => ({
              ...paper,
              status: "checking",
            })),
          },
          students: state.students.map((student) =>
            student.id === id && student.now === "documentsApproved"
              ? { ...student, now: "fixRequested", turn: "student" }
              : student,
          ),
          history: appendHistory(state, id, entry),
        }));
      },
      requestInboxFile(id, action, text, author, seededOpen) {
        const parsed = messageActionSchema.parse(action);
        if (parsed.kind !== "file") throw new Error("Expected a file request");
        const previous = get();
        const key = id + ":" + parsed.document;
        const existing = openFileRequest(previous, id, parsed);
        const status = parsed.paper ? "fix" : "toSend";
        const oldPapers = previous.reviews[key] ?? [];
        if (parsed.paper && !oldPapers.some(({ id }) => id === parsed.paper))
          throw new Error("Unknown paper");
        const papers = oldPapers.map((paper) =>
          parsed.paper && paper.id !== parsed.paper
            ? paper
            : {
                ...paper,
                status: parsed.paper ? ("fix" as const) : ("checking" as const),
              },
        );
        const entry = event("fileRequested", text.trim());
        const message: StudentMessage = {
          id: existing?.id ?? entry.id,
          at: entry.at,
          text: entry.detail,
          author,
          action: {
            ...parsed,
            request: { updated: Boolean(existing || seededOpen) },
          },
        };
        const earlier = previous.messages[id] ?? [];
        set((state) => ({
          messages: {
            ...state.messages,
            [id]: [...earlier.filter(({ id }) => id !== message.id), message],
          },
          history: appendHistory(state, id, entry),
          ...(parsed.document && {
            documents: { ...state.documents, [key]: status },
            reviews: { ...state.reviews, [key]: papers },
          }),
        }));
        const deadline = Date.now() + 10_000;
        return () => {
          if (Date.now() >= deadline) return;
          set((state) => {
            const current = state.messages[id] ?? [];
            if (!current.includes(message)) return state;
            const restored = current.filter((item) => item !== message);
            if (existing) {
              const later = earlier.slice(earlier.indexOf(existing) + 1);
              const next = restored.findIndex(
                (item) => later.includes(item) || !earlier.includes(item),
              );
              restored.splice(
                next === -1 ? restored.length : next,
                0,
                existing,
              );
            }
            const canRestoreDocument =
              parsed.document &&
              state.reviews[key] === papers &&
              state.documents[key] === status;
            return {
              messages: { ...state.messages, [id]: restored },
              history: {
                ...state.history,
                [id]: (state.history[id] ?? []).filter(
                  (item) => item.id !== entry.id,
                ),
              },
              ...(canRestoreDocument && {
                documents: {
                  ...state.documents,
                  [key]: previous.documents[key],
                },
                reviews: { ...state.reviews, [key]: oldPapers },
              }),
            };
          });
        };
      },
    }),
    {
      name: "meetta-student-workspace-v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({
        students,
        plans,
        reviews,
        documents,
        history,
        messages,
      }) => ({ students, plans, reviews, documents, history, messages }),
      merge: (saved, current) => {
        const parsed = storedWorkspaceSchema.safeParse(saved);
        if (!parsed.success) return current;
        const data = parsed.data;
        const savedIds = new Set(data.students.map((student) => student.id));
        const demoStudent = studentFixtures.find(
          ({ id }) => id === "MM-2026-0150",
        );
        return {
          ...current,
          ...data,
          students: [
            ...data.students.map((student) =>
              student.id === demoStudent?.id &&
              student.phone === "+95 9 ••• 123 456"
                ? { ...student, phone: demoStudent.phone }
                : student,
            ),
            ...current.students.filter((student) => !savedIds.has(student.id)),
          ],
          plans: { ...current.plans, ...data.plans },
          reviews: { ...current.reviews, ...data.reviews },
          documents: { ...current.documents, ...data.documents },
        };
      },
      onRehydrateStorage: () => () =>
        useStudentsStore.setState({ hydrated: true }),
    },
  ),
);
