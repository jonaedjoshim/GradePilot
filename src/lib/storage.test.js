import test from "node:test";
import assert from "node:assert/strict";

import { normalizeSubjects, validateAcademicState } from "./storage.js";

const defaults = {
  subjects: [],
  previousCGPA: "",
  previousCredits: "",
  targetCGPA: "",
  remainingCredits: "",
  theme: "light",
  sidebarCollapsed: false,
  aiInsights: null,
  aiLoading: false,
};

test("migrates subjects without semester data", () => {
  const subjects = normalizeSubjects([
    {
      id: "1",
      name: "Mathematics",
      credit: 3,
      grade: "A",
    },
  ]);

  assert.equal(subjects.length, 1);
  assert.equal(subjects[0].yearSemester, "1st Year - 1st Semester");
});

test("preserves valid academic data", () => {
  const result = validateAcademicState(
    {
      subjects: [],
      previousCGPA: "3.25",
      previousCredits: "60",
      theme: "dark",
      sidebarCollapsed: true,
    },
    defaults,
  );

  assert.equal(result.previousCGPA, "3.25");
  assert.equal(result.previousCredits, "60");
  assert.equal(result.theme, "dark");
  assert.equal(result.sidebarCollapsed, true);
});

test("rejects invalid CGPA values", () => {
  const result = validateAcademicState(
    {
      previousCGPA: "5.50",
      previousCredits: "-10",
    },
    defaults,
  );

  assert.equal(result.previousCGPA, "");
  assert.equal(result.previousCredits, "");
});

test("rejects invalid theme values", () => {
  const result = validateAcademicState(
    {
      theme: "unknown",
    },
    defaults,
  );

  assert.equal(result.theme, "light");
});

test("removes invalid subjects", () => {
  const subjects = normalizeSubjects([
    null,
    "invalid",
    {
      id: "1",
      name: "English",
      credit: 3,
      grade: "B+",
    },
  ]);

  assert.equal(subjects.length, 1);
});

test("generates unique subject IDs", () => {
  const subjects = normalizeSubjects([
    {
      id: "same-id",
      name: "Math",
      credit: 3,
      grade: "A",
    },
    {
      id: "same-id",
      name: "English",
      credit: 3,
      grade: "B",
    },
  ]);

  assert.notEqual(subjects[0].id, subjects[1].id);
});

test("removes temporary AI state", () => {
  const result = validateAcademicState(
    {
      aiInsights: { status: "High" },
      aiLoading: true,
    },
    defaults,
  );

  assert.equal(result.aiInsights, null);
  assert.equal(result.aiLoading, false);
});
