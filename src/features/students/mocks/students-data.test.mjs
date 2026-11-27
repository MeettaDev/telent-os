import assert from "node:assert/strict";
import test from "node:test";
import en from "../../../common/i18n/dictionaries/en.json" with { type: "json" };
import my from "../../../common/i18n/dictionaries/my.json" with { type: "json" };
import {
  createWorkspace,
  createPapers,
  createPlan,
  students,
  documentRows,
  paperKeys,
  journeyStages,
} from "./students-data.ts";
import {
  filterStudents,
  planIsReady,
  reviewCanDecide,
  dateLabel,
} from "../lib/student-workflow.ts";
import { workspaceSchema } from "../types/student.ts";

test("Eight reference students have complete plans, documents, and valid stored data", () => {
  const data = createWorkspace();
  assert.equal(students.length, 8);
  const addedPlan = createPlan({
    ...students[0],
    contact: "new",
    school: "New demo school",
  });
  assert.equal(addedPlan.status, "draft");
  assert.equal(addedPlan.university, "New demo school");
  assert.equal(new Set(students.map((student) => student.id)).size, 8);
  assert.equal(
    workspaceSchema.safeParse(JSON.parse(JSON.stringify(data))).success,
    true,
  );
  for (const student of students) {
    assert.ok(data.plans[student.id]);
    for (const { id } of documentRows)
      assert.ok(data.reviews[student.id + ":" + id]?.length);
  }
  assert.equal(
    workspaceSchema.safeParse({ ...data, students: [{ name: "broken" }] })
      .success,
    false,
  );
});

test("Search trims whitespace and matches names, phone numbers, NRC, and turn", () => {
  assert.equal(
    filterStudents(students, "  MAY ZIN ", "all")[0].name,
    "May Zin",
  );
  assert.equal(
    filterStudents(students, "000003", "all")[0].name,
    "Nang Mya Su Aung",
  );
  assert.equal(
    filterStudents(students, "884", "student")[0].name,
    "Phyu Phyu Kyaw",
  );
  assert.equal(filterStudents(students, "May Zin", "office").length, 0);
  assert.equal(filterStudents(students, "", "noOne")[0].name, "Aung Min");
  assert.equal(filterStudents(students, "missing name", "all").length, 0);
});

test("Approval requires every check OK; fixes require a reason or nonempty note", () => {
  const paper = createPapers("legalized")[0];
  assert.equal(reviewCanDecide(paper, "approved"), true);
  assert.equal(
    reviewCanDecide({ ...paper, checks: ["ok", "fix", "ok"] }, "approved"),
    false,
  );
  assert.equal(
    reviewCanDecide({ ...paper, reasons: [], note: "   " }, "fix"),
    false,
  );
  assert.equal(
    reviewCanDecide(
      { ...paper, reasons: [], note: "Please resend both sides" },
      "fix",
    ),
    true,
  );
  assert.equal(
    reviewCanDecide({ ...paper, reasons: ["missingBack"] }, "fix"),
    true,
  );
});

test("Sending a plan requires route, program, dates, TOPIK, and explanation", () => {
  const plan = createPlan(students[2]);
  assert.equal(planIsReady(plan), false);
  assert.equal(planIsReady({ ...plan, why: "Fits the student’s goal" }), true);
  assert.equal(planIsReady({ ...plan, why: "Ready", university: " " }), false);
  assert.equal(planIsReady({ ...plan, why: "Ready", schedule: "" }), false);
});

test("Every reference label exists in English and Myanmar; fixed date stays deterministic", () => {
  for (const dictionary of [en, my]) {
    const t = dictionary.studentWorkspace;
    for (const student of students) {
      assert.ok(t.contacts[student.contact]);
      assert.ok(t.now[student.now].title);
    }
    for (const { id } of documentRows) assert.ok(t.documents[id].title);
    for (const key of paperKeys) assert.ok(t.review.papers[key]);
    for (const key of journeyStages) assert.ok(t.stages[key]);
  }
  assert.equal(dateLabel("2026-10-01", "en", "Today", "No date"), "Today");
  assert.equal(dateLabel(null, "en", "Today", "No date"), "No date");
});

test("Dates reject invalid calendar values and formatting recovers safely", () => {
  for (const date of [
    "bad-date",
    "2026-02-30",
    "2026-13-01",
    "",
    "10000-01-01",
  ]) {
    const data = structuredClone(createWorkspace());
    data.students[0].nextCheck = date;
    assert.equal(workspaceSchema.safeParse(data).success, false);
    for (const locale of ["en", "my"])
      assert.equal(dateLabel(date, locale, "Today", "No date"), "No date");
  }
  assert.notEqual(dateLabel("2028-02-29", "en", "Today", "No date"), "No date");
});
