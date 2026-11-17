import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { beforeEach, test } from "node:test";

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
};
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    return nextResolve(
      specifier.startsWith("@/")
        ? new URL("../../../" + specifier.slice(2) + ".ts", import.meta.url)
            .href
        : specifier,
      context,
    );
  },
});
const { useStudentsStore: store } = await import("./students-store.ts");
const { createWorkspace, students, documentRows } =
  await import("../mocks/students-data.ts");
const { findIntakeMatches, studentIntakeFormSchema } =
  await import("../lib/student-intake.ts");
const { addDays, yangonToday } = await import("../lib/student-workflow.ts");
const { waitingCount } = await import("../../inbox/mocks/inbox-data.ts");
hooks.deregister();
const id = "MM-2026-0150";

beforeEach(() => {
  storage.clear();
  store.setState({ ...createWorkspace(), hydrated: false });
});

test("Sending back one paper saves the correction and preserves other approvals", async () => {
  const group = "legalized";
  const key = id + ":" + group;
  const { decidePaper, reviews } = store.getState();
  const [paper, ...otherPapers] = reviews[key];
  const fix = {
    version: paper.version,
    reason: "other",
    message: "  Please resend both sides.  ",
    author: "Hsu Wai",
    nextCheck: "2026-11-11",
  };
  const sendBack = (request) =>
    decidePaper(id, group, paper.id, "fix", "Father’s NRC", request);

  assert.equal(sendBack({ ...fix, version: paper.version - 1 }), false);
  assert.equal(sendBack({ ...fix, message: "   " }), false);
  assert.equal(sendBack({ ...fix, reason: ["missingBack", "blurry"] }), false);
  assert.equal(store.getState().messages[id], undefined);
  assert.equal(sendBack(fix), true);
  assert.equal(sendBack(fix), false);
  await store.persist.rehydrate();

  const state = store.getState();
  const [saved, ...unchanged] = state.reviews[key];
  assert.equal(saved.status, "fix");
  assert.equal(saved.fixMessage, "Please resend both sides.");
  assert.deepEqual(saved.reasons, ["other"]);
  assert.deepEqual(unchanged, otherPapers);
  assert.equal(state.documents[key], "fix");
  const student = state.students.find((item) => item.id === id);
  assert.equal(student.turn, "student");
  assert.equal(student.nextCheck, fix.nextCheck);
  assert.equal(state.messages[id].length, 1);
  assert.deepEqual(state.messages[id][0].action, {
    kind: "file",
    document: group,
    paper: paper.id,
    date: fix.nextCheck,
  });
  assert.equal(state.messages[id][0].text, saved.fixMessage);
  assert.match(state.history[id][0].detail, /Hsu Wai · v2/);
});

test("Inbox replies and action cards persist and clear waiting threads", async () => {
  assert.equal(waitingCount(store.getState().messages), 4);
  store.getState().sendMessage(id, "  Thanks for the update.  ", "Hsu Wai");
  assert.equal(waitingCount(store.getState().messages), 3);
  assert.equal(store.getState().messages[id][0].text, "Thanks for the update.");
  const file = { kind: "file", document: "application", date: "2026-11-09" };
  const call = { kind: "call", date: "2026-11-10", time: "10:30" };
  const guide = { kind: "guide", guide: "topik" };
  store.getState().sendMessage(id, "Application form", "Hsu Wai", file);
  store.getState().sendMessage(id, "Consultation", "Hsu Wai", call);
  store.getState().sendMessage(id, "TOPIK guide", "Hsu Wai", guide);
  await store.persist.rehydrate();
  assert.deepEqual(
    store
      .getState()
      .messages[id].slice(1)
      .map((message) => message.action),
    [file, call, guide],
  );
  assert.equal(store.getState().documents[id + ":application"], "toSend");
  assert.equal(
    store.getState().reviews[id + ":application"][0].status,
    "checking",
  );
  assert.equal(waitingCount(store.getState().messages), 3);
});

test("Existing workspace picks up Thiri's fixture and keeps saved messages", async () => {
  const workspace = createWorkspace();
  const thiri = "MM-2026-0155";
  workspace.students = workspace.students.filter(
    (student) => student.id !== thiri,
  );
  delete workspace.plans[thiri];
  workspace.messages[id] = [
    {
      id: "saved",
      at: "2026-11-06T10:00:00.000Z",
      text: "Saved reply",
      author: "Hsu Wai",
    },
  ];
  storage.set(
    "meetta-student-workspace-v1",
    JSON.stringify({ state: workspace, version: 1 }),
  );
  await store.persist.rehydrate();
  assert.equal(
    store.getState().students.find((student) => student.id === thiri)?.name,
    "Thiri Win",
  );
  assert.ok(store.getState().plans[thiri]);
  assert.equal(store.getState().messages[id][0].text, "Saved reply");
});

test("Approving one group preserves pending work and its next-check date", () => {
  const before = store.getState().students.find((student) => student.id === id);
  assert.equal(
    store.getState().decidePaper(id, "photo", "photo", "approved", "Photo"),
    true,
  );
  const state = store.getState();
  assert.equal(state.documents[id + ":photo"], "approved");
  assert.equal(state.documents[id + ":legalized"], "checking");
  assert.deepEqual(
    state.students.find((student) => student.id === id),
    before,
  );
});

test("Only all required approvals complete document work; unrelated actions survive", () => {
  const documents = Object.fromEntries(
    documentRows.map(({ id: group }) => [id + ":" + group, "approved"]),
  );
  store.setState({
    documents: { ...store.getState().documents, ...documents },
  });
  store.getState().decidePaper(id, "photo", "photo", "approved", "Photo");
  assert.equal(
    store.getState().students.find((student) => student.id === id).now,
    "documentsApproved",
  );
  store.getState().setNextAction(id, {
    customAction: "Call family",
    turn: "meetta",
    nextCheck: "2026-10-08",
    owner: "H",
  });
  const before = store.getState().students.find((student) => student.id === id);
  store.getState().decidePaper(id, "photo", "photo", "approved", "Photo");
  assert.deepEqual(
    store.getState().students.find((student) => student.id === id),
    before,
  );
});

test("Requesting an approved file resets review approval and blocks decisions until upload", () => {
  store.getState().requestFile(id, "application", "Resend application");
  const state = store.getState();
  assert.equal(state.documents[id + ":application"], "toSend");
  assert.equal(state.reviews[id + ":application"][0].status, "checking");
  assert.equal(
    state.decidePaper(
      id,
      "application",
      "application",
      "approved",
      "Application",
    ),
    false,
  );
  assert.equal(
    state.decidePaper(id, "application", "application", "fix", "Fix"),
    false,
  );
});

test("New students start without approvals and plans use selected intake", () => {
  const student = {
    ...students[0],
    id: "STU-regression",
    contact: "new",
    start: "2028-09-01",
    journeyStep: 1,
    now: "none",
    turn: "noOne",
    nextCheck: null,
    owner: null,
  };
  store.getState().addStudent(student);
  const state = store.getState();
  assert.equal(state.plans[student.id].schedule, "Sep 2028");
  assert.equal(state.plans[student.id].status, "draft");
  for (const { id: group } of documentRows) {
    assert.notEqual(state.documents[student.id + ":" + group], "approved");
    for (const paper of state.reviews[student.id + ":" + group]) {
      assert.equal(paper.status, "checking");
      assert.equal(paper.version, 1);
      assert.deepEqual(paper.reasons, []);
    }
  }
});

const intake = {
  name: "Student Intake Test",
  channel: "office",
  reachableContact: "09 000-000-000",
  contactChannel: "viber",
  contactPerson: "guardian",
  owner: "H",
  referralSource: "facebook",
  status: "inquiry",
  scheduledDate: "",
  scheduledTime: "",
  completedDate: "",
  outcome: "",
  goal: "",
  nextAction: "",
  dueDate: "",
  googleEmail: "",
  note: "",
  separateReason: "",
};

test("Reachable contact requires a Myanmar mobile number on every contact channel", () => {
  for (const contactChannel of ["phone", "viber", "facebook", "other"]) {
    for (const reachableContact of [
      "+959890987890",
      "09890989098",
      "+95 9 000 000 000",
    ]) {
      assert.equal(
        studentIntakeFormSchema.safeParse({
          ...intake,
          contactChannel,
          reachableContact,
        }).success,
        true,
      );
    }
    for (const reachableContact of [
      "@student",
      "+12025550123",
      "09890",
      "959890987890",
    ]) {
      const result = studentIntakeFormSchema.safeParse({
        ...intake,
        contactChannel,
        reachableContact,
      });
      assert.deepEqual(
        result.error?.issues.map(({ path, message }) => ({ path, message })),
        [{ path: ["reachableContact"], message: "invalidPhone" }],
      );
    }
  }
});

test("Saving intake rechecks normalized contacts and requires a reason for shared contacts", async () => {
  const { createIntakeStudent } = store.getState();
  const before = structuredClone(
    store.getState().students.find((student) => student.id === id),
  );
  const duplicate = createIntakeStudent(intake);
  assert.deepEqual(
    duplicate.matches.map((student) => student.id),
    [id],
  );
  assert.equal(
    createIntakeStudent({ ...intake, separateReason: "   " }, [id]).matches
      .length,
    1,
  );

  const values = {
    ...intake,
    separateReason: "Siblings share a guardian contact.",
  };
  const result = createIntakeStudent(values, [id]);
  assert.ok(result.id);
  const latest = createIntakeStudent(values, [id]);
  assert.deepEqual(
    latest.matches.map((student) => student.id),
    [id, result.id],
  );

  await store.persist.rehydrate();
  const state = store.getState();
  const student = state.students.find((student) => student.id === result.id);
  assert.equal(student.intake.separateReason, values.separateReason);
  assert.equal(student.start, "");
  assert.deepEqual(
    state.students.find((student) => student.id === id),
    before,
  );
});

test("Intake due dates accept today and reject dates before today", () => {
  const today = yangonToday();
  assert.equal(
    studentIntakeFormSchema.safeParse({ ...intake, dueDate: today }).success,
    true,
  );
  const result = studentIntakeFormSchema.safeParse({
    ...intake,
    dueDate: addDays(today, -1),
  });
  assert.equal(result.error?.issues[0]?.message, "pastDueDate");
});

test("Intake validates conditional fields and persists completed outcomes as drafts", async () => {
  const { createIntakeStudent } = store.getState();
  const base = { ...intake, reachableContact: "+95 9 111 111 111" };
  assert.throws(() => createIntakeStudent({ ...base, status: "scheduled" }));
  assert.throws(() => createIntakeStudent({ ...base, status: "completed" }));
  assert.throws(() => createIntakeStudent({ ...base, googleEmail: "invalid" }));

  const scheduled = createIntakeStudent({
    ...base,
    status: "scheduled",
    scheduledDate: "2026-11-13",
    scheduledTime: "10:30",
  });
  const dueDate = addDays(yangonToday(), 1);
  const completed = createIntakeStudent({
    ...base,
    reachableContact: "+95 9 222 222 222",
    status: "completed",
    completedDate: "2026-11-12",
    outcome: "Needs help choosing a route",
    nextAction: "Prepare a proposed plan",
    dueDate,
  });

  await store.persist.rehydrate();
  const state = store.getState();
  const find = (id) => state.students.find((student) => student.id === id);
  assert.deepEqual(find(scheduled.id).intake.consultation, {
    status: "scheduled",
    date: "2026-11-13",
    time: "10:30",
  });
  assert.equal(
    find(completed.id).intake.consultation.outcome,
    "Needs help choosing a route",
  );
  assert.equal(find(completed.id).customAction, "Prepare a proposed plan");
  assert.equal(find(completed.id).nextCheck, dueDate);
  assert.equal(find(completed.id).intake.googleEmail, "");
  assert.equal(state.plans[completed.id].status, "draft");
  assert.equal(state.plans[completed.id].university, "");
});

test("A failed browser write leaves no partial student record", () => {
  const before = store.getState();
  const original = localStorage.setItem;
  localStorage.setItem = () => {
    throw new Error("Storage unavailable");
  };
  try {
    assert.throws(
      () =>
        before.createIntakeStudent({
          ...intake,
          reachableContact: "09 333 333 333",
        }),
      /Storage unavailable/,
    );
    assert.equal(store.getState(), before);
  } finally {
    localStorage.setItem = original;
  }
});

test("A new file request reopens completed document work", () => {
  store.setState({
    students: store.getState().students.map((student) =>
      student.id === id
        ? {
            ...student,
            now: "documentsApproved",
            turn: "noOne",
            nextCheck: null,
          }
        : student,
    ),
  });
  store.getState().requestFile(id, "application", "Resend application");
  const student = store
    .getState()
    .students.find((student) => student.id === id);
  assert.equal(student.now, "fixRequested");
  assert.equal(student.turn, "student");
});

test("Invalid action dates cannot enter state", () => {
  const before = store.getState().students.find((student) => student.id === id);
  store.getState().setNextAction(id, {
    customAction: "Call",
    turn: "meetta",
    nextCheck: "2026-02-30",
    owner: "H",
  });
  assert.deepEqual(
    store.getState().students.find((student) => student.id === id),
    before,
  );
});

test("Hydration repairs invalid dates without losing valid workspace edits", async () => {
  const saved = structuredClone(createWorkspace());
  saved.students[0].name = "Saved name";
  saved.students[0].nextCheck = "bad-date";
  saved.students[1].start = "2027-02-30";
  storage.set(
    "meetta-student-workspace-v1",
    JSON.stringify({ state: saved, version: 1 }),
  );
  await store.persist.rehydrate();
  assert.equal(store.getState().hydrated, true);
  assert.equal(store.getState().students[0].name, "Saved name");
  assert.equal(store.getState().students[0].nextCheck, null);
  assert.equal(store.getState().students[1].start, "");
  assert.deepEqual(store.getState().plans, saved.plans);
});

test("A saved workspace with the old demo contact can find May Zin", async () => {
  const saved = structuredClone(createWorkspace());
  const may = saved.students.find((student) => student.id === id);
  may.phone = "+95 9 ••• 123 456";
  may.customAction = "Call after class";
  storage.set(
    "meetta-student-workspace-v1",
    JSON.stringify({ state: saved, version: 1 }),
  );

  await store.persist.rehydrate();

  const matches = findIntakeMatches(
    store.getState().students,
    "09 000 000 000",
  );
  assert.deepEqual(matches, [{ ...may, phone: "+95 9 000 000 000" }]);
});

test("Inbox updates an open paper request and Undo preserves later replies", () => {
  const { requestInboxFile, sendMessage, reviews } = store.getState();
  const key = id + ":legalized";
  const file = {
    kind: "file",
    document: "legalized",
    paper: "fatherNrc",
    date: "2026-11-13",
  };
  requestInboxFile(id, file, "Both sides, please.", "Hsu Wai", true);
  const original = store.getState().messages[id][0];
  const undo = requestInboxFile(
    id,
    { ...file, date: "2026-11-16" },
    "On one page, please.",
    "Hsu Wai",
    false,
  );
  const state = store.getState();
  assert.equal(state.messages[id].length, 1);
  assert.equal(state.messages[id][0].id, original.id);
  assert.equal(state.messages[id][0].action.date, "2026-11-16");
  assert.equal(state.messages[id][0].action.request.updated, true);
  assert.equal(state.documents[key], "fix");
  assert.deepEqual(state.reviews[key].slice(1), reviews[key].slice(1));

  sendMessage(id, "Thanks!", "Hsu Wai");
  undo();
  assert.deepEqual(store.getState().messages[id][0], original);
  assert.equal(store.getState().messages[id][1].text, "Thanks!");
});

test("Custom requests accept blank notes, deduplicate by name, and persist", async () => {
  const { requestInboxFile } = store.getState();
  const file = {
    kind: "file",
    document: null,
    fileName: "  University certificate  ",
    date: "2026-11-13",
  };
  const undo = requestInboxFile(id, file, "", "Hsu Wai", false);
  undo();
  assert.deepEqual(store.getState().messages[id], []);
  requestInboxFile(id, file, "", "Hsu Wai", false);
  requestInboxFile(
    id,
    { ...file, fileName: "university certificate" },
    "",
    "Hsu Wai",
    false,
  );
  await store.persist.rehydrate();
  const { messages } = store.getState();
  assert.equal(messages[id].length, 1);
  assert.equal(messages[id][0].action.fileName, "university certificate");
  assert.equal(messages[id][0].text, "");
});

test("Inbox call bookings persist and block overlapping host or student slots", async () => {
  const { sendMessage } = store.getState();
  const call = {
    kind: "call",
    date: "2099-11-10",
    time: "10:00",
    booking: { mode: "office", host: "Hsu Wai" },
  };
  const book = (studentId, action) =>
    sendMessage(studentId, "Consultation booked", "Counselor", action);

  book(id, call);
  assert.throws(
    () => book("MM-2026-0155", { ...call, time: "10:15" }),
    /Call slot unavailable/,
  );
  assert.throws(
    () =>
      book(id, { ...call, booking: { ...call.booking, host: "Nway Nway" } }),
    /Call slot unavailable/,
  );
  assert.throws(
    () => book(id, { ...call, date: "2000-01-01" }),
    /Call slot unavailable/,
  );
  book("MM-2026-0155", { ...call, time: "10:30" });
  await store.persist.rehydrate();
  assert.deepEqual(
    store.getState().messages[id].map(({ action }) => action),
    [call],
  );
});
