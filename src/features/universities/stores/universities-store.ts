"use client";

import { create } from "zustand";
import { z } from "zod";
import { universityFixtures } from "../mocks/university-data";
import {
  universityFieldsSchema,
  universitySchema,
  workspaceDate,
  type University,
  type UniversityFields,
  type ProgramFields,
} from "../university-record";

const storageKey = "meetta-universities-v1";
const recordsSchema = z.array(universitySchema);

function readRecords() {
  const saved = localStorage.getItem(storageKey);
  return saved === null
    ? universityFixtures
    : recordsSchema.parse(JSON.parse(saved));
}

type State = {
  records: University[];
  ready: boolean;
  load: () => void;
  save: (
    fields: UniversityFields,
    author: string,
    note: string,
    current?: University,
  ) => University;
  addProgram: (
    current: University,
    program: ProgramFields,
    author: string,
    note: string,
  ) => void;
};

export const useUniversitiesStore = create<State>((set) => {
  function persist(records: University[], record: University) {
    const validated = universitySchema.parse(record);
    const next = records.some(({ id }) => id === record.id)
      ? records.map((item) => (item.id === record.id ? validated : item))
      : [...records, validated];
    localStorage.setItem(storageKey, JSON.stringify(next));
    set({ records: next });
    return validated;
  }

  function currentVersion(records: University[], current: University) {
    const latest = records.find(({ id }) => id === current.id);
    if (!latest || latest.version !== current.version) throw new Error("stale");
    return latest;
  }

  return {
    records: universityFixtures,
    ready: false,
    load() {
      try {
        set({ records: readRecords(), ready: true });
      } catch {
        set({ ready: true });
      }
    },
    save(fields, author, note, current) {
      const records = readRecords();
      const values = universityFieldsSchema.parse(fields);
      const previous = current && currentVersion(records, current);
      if (
        records.some(
          ({ id, name }) =>
            id !== previous?.id &&
            name.toLocaleLowerCase() === values.name.toLocaleLowerCase(),
        )
      )
        throw new Error("duplicate");
      const version = (previous?.version ?? 0) + 1;
      return persist(records, {
        ...values,
        id: previous?.id ?? crypto.randomUUID(),
        version,
        programs: previous?.programs ?? [],
        assignments: previous?.assignments ?? [],
        history: [
          { version, on: workspaceDate(), note, author },
          ...(previous?.history ?? []),
        ],
      });
    },
    addProgram(current, program, author, note) {
      const records = readRecords();
      const previous = currentVersion(records, current);
      if (
        previous.programs.some(
          ({ name }) =>
            name.toLocaleLowerCase() ===
            program.name.trim().toLocaleLowerCase(),
        )
      )
        throw new Error("duplicate");
      const version = previous.version + 1;
      persist(records, {
        ...previous,
        version,
        programs: [
          ...previous.programs,
          { ...program, id: crypto.randomUUID() },
        ],
        history: [
          { version, on: workspaceDate(), note, author },
          ...previous.history,
        ],
      });
    },
  };
});
