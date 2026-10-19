import test from "node:test";
import assert from "node:assert/strict";

import {
  predictCGPA,
  calculateRequiredGPA,
  getPredictionDifficulty,
} from "./predictions.js";

test("predicts future CGPA using weighted credits", () => {
  const result = predictCGPA({
    currentCGPA: 3.25,
    completedCredits: 60,
    expectedGPA: 3.75,
    futureCredits: 20,
  });

  assert.equal(result.cgpa, 3.375);
  assert.equal(result.totalCredits, 80);
});

test("calculates required GPA for a target", () => {
  const result = calculateRequiredGPA({
    currentCGPA: 3.25,
    completedCredits: 60,
    targetCGPA: 3.5,
    remainingCredits: 60,
  });

  assert.equal(result.requiredGPA, 3.75);
  assert.equal(result.achievable, true);
});

test("detects an impossible target", () => {
  const result = calculateRequiredGPA({
    currentCGPA: 2.5,
    completedCredits: 100,
    targetCGPA: 3.8,
    remainingCredits: 20,
  });

  assert.equal(result.achievable, false);
  assert.ok(result.requiredGPA > 4);
});

test("detects an already secured target", () => {
  const result = calculateRequiredGPA({
    currentCGPA: 3.8,
    completedCredits: 100,
    targetCGPA: 3,
    remainingCredits: 20,
  });

  assert.equal(result.alreadySecured, true);
});

test("rejects invalid prediction inputs", () => {
  const result = predictCGPA({
    currentCGPA: 3.5,
    completedCredits: 60,
    expectedGPA: 5,
    futureCredits: 20,
  });

  assert.equal(result, null);
});

test("classifies prediction difficulty", () => {
  assert.equal(getPredictionDifficulty(4.5).label, "Not achievable");

  assert.equal(getPredictionDifficulty(3.8).label, "Very challenging");
});
