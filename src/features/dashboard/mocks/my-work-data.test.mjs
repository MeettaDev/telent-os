import assert from "node:assert/strict";
import test from "node:test";

import en from "../../../common/i18n/dictionaries/en.json" with { type: "json" };
import my from "../../../common/i18n/dictionaries/my.json" with { type: "json" };
import { students } from "../../students/mocks/students-data.ts";
import {
  appActivities,
  todayMetrics,
  todayTasks,
  waitingItems,
} from "./my-work-data.ts";

function keys(value, prefix = "") {
  return Object.entries(value)
    .flatMap(([key, item]) => {
      const path = `${prefix}${key}`;
      return typeof item === "object" ? keys(item, `${path}.`) : [path];
    })
    .sort();
}

test("Dictionaries have matching keys; Today preserves translation placeholders", () => {
  assert.deepEqual(keys(en), keys(my));
  function placeholders(value) {
    return Object.values(value).flatMap((item) =>
      typeof item === "object"
        ? placeholders(item)
        : [item.match(/\{[^}]+\}/g) ?? []],
    );
  }
  assert.deepEqual(placeholders(en.today), placeholders(my.today));
});

test("Today fixtures keep seven unique tasks with overdue work first", () => {
  assert.equal(todayTasks.length, 7);
  assert.equal(new Set(todayTasks.map(({ id }) => id)).size, 7);
  assert.deepEqual(
    todayTasks.map(({ group }) => group),
    ["overdue", "today", "today", "today", "today", "tomorrow", "noAction"],
  );
  assert.deepEqual(
    todayMetrics.map(({ count }) => count),
    [3, 4, 2, 1],
  );
  for (const task of todayTasks.filter(({ studentId }) => studentId)) {
    assert.equal(
      students.find(({ id }) => id === task.studentId)?.name,
      task.student,
    );
  }
});

test("Every visible fixture has English and Myanmar copy", () => {
  for (const dictionary of [en, my]) {
    for (const { id, actor } of todayTasks) {
      const task = dictionary.today.tasks[id];
      for (const field of ["due", "title", "detail", "action"])
        assert.ok(task[field]);
      assert.ok(dictionary.today[actor]);
    }
    for (const { id } of todayMetrics)
      assert.ok(dictionary.today.metrics[id].hint);
    for (const { id } of waitingItems)
      assert.ok(dictionary.today.waiting.items[id].check);
    for (const { id } of appActivities)
      assert.ok(dictionary.today.activity.items[id].includes("{student}"));
  }
});
