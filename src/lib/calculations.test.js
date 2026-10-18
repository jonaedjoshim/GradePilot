import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateGPA,
  calculateCGPA,
  calculateGroupGPA,
  calculatePredictedCGPA,
  calculateRequiredGPA,
  calculateImprovementCGPA,
} from "./calculations.js";

const subjects = [
  {
    id: "1",
    name: "Mathematics",
    credit: 3,
    grade: "A",
    yearSemester: "1st Year - 1st Semester",
  },
  {
    id: "2",
    name: "English",
    credit: 3,
    grade: "B",
    yearSemester: "1st Year - 1st Semester",
  },
];

test("calculates weighted GPA correctly", () => {
  const result = calculateGPA(subjects);

  assert.equal(result.gpa, 3.38);
  assert.equal(result.totalCredits, 6);
  assert.equal(result.subjectCount, 2);
});

test("includes previous academic results in CGPA", () => {
  const result = calculateCGPA(subjects, 3.5, 30);

  assert.equal(result.cgpa, 3.48);
  assert.equal(result.totalCredits, 36);
});

test("preserves previous CGPA without new subjects", () => {
  const result = calculateCGPA([], 3.25, 60);

  assert.equal(result.cgpa, 3.25);
  assert.equal(result.totalCredits, 60);
});

test("calculates semester GPA", () => {
  const result = calculateGroupGPA(subjects);

  assert.equal(result.length, 1);
  assert.equal(result[0].gpa, 3.38);
});

test("predicts future CGPA", () => {
  const result = calculatePredictedCGPA({
    currentCGPA: 3,
    completedCredits: 60,
    futureGPA: 4,
    futureCredits: 20,
  });

  assert.equal(result, 3.25);
});

test("detects impossible CGPA targets", () => {
  const result = calculateRequiredGPA({
    currentCGPA: 2.5,
    completedCredits: 100,
    targetCGPA: 3.8,
    remainingCredits: 20,
  });

  assert.equal(result.achievable, false);
  assert.ok(result.requiredGPA > 4);
});

test("simulates improvement without lowering grades", () => {
  const result = calculateImprovementCGPA({
    subjects,
    selectedIds: ["1", "2"],
    improvementGrade: "B",
  });

  assert.equal(result.cgpa, 3.38);
});

test("ignores invalid subjects", () => {
  const result = calculateGPA([
    {
      name: "",
      credit: 3,
      grade: "A",
    },
    {
      name: "Invalid",
      credit: -2,
      grade: "A",
    },
  ]);

  assert.equal(result.gpa, 0);
  assert.equal(result.totalCredits, 0);
});
