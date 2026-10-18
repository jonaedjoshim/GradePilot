import { GRADE_POINTS } from "../data/gradeData.js";

export const MAX_GPA = 4.0;

export function isValidSubject(subject) {
  if (!subject || typeof subject !== "object") {
    return false;
  }

  const name = typeof subject.name === "string" ? subject.name.trim() : "";

  const credit = Number(subject.credit);

  return (
    name.length > 0 &&
    Object.hasOwn(GRADE_POINTS, subject.grade) &&
    Number.isFinite(credit) &&
    credit > 0
  );
}

export function getValidSubjects(subjects = []) {
  if (!Array.isArray(subjects)) {
    return [];
  }

  return subjects.filter(isValidSubject);
}

export function calculateGPA(subjects = []) {
  const validSubjects = getValidSubjects(subjects);

  const weightedSum = validSubjects.reduce((total, subject) => {
    const credit = Number(subject.credit);
    const gradePoint = GRADE_POINTS[subject.grade];

    return total + gradePoint * credit;
  }, 0);

  const totalCredits = validSubjects.reduce(
    (total, subject) => total + Number(subject.credit),
    0,
  );

  const gpa = totalCredits > 0 ? weightedSum / totalCredits : 0;

  return {
    gpa: Number(gpa.toFixed(2)),
    totalCredits,
    weightedSum,
    subjectCount: validSubjects.length,
  };
}

export function calculateCGPA(
  subjects = [],
  previousCGPA = "",
  previousCredits = "",
) {
  const current = calculateGPA(subjects);

  const previousGPA = Number(previousCGPA);
  const completedCredits = Number(previousCredits);

  const hasPreviousResult =
    previousCGPA !== "" &&
    previousCredits !== "" &&
    Number.isFinite(previousGPA) &&
    Number.isFinite(completedCredits) &&
    previousGPA >= 0 &&
    previousGPA <= MAX_GPA &&
    completedCredits > 0;

  const previousWeightedSum = hasPreviousResult
    ? previousGPA * completedCredits
    : 0;

  const totalCredits =
    current.totalCredits + (hasPreviousResult ? completedCredits : 0);

  const weightedSum = current.weightedSum + previousWeightedSum;

  const cgpa = totalCredits > 0 ? weightedSum / totalCredits : 0;

  return {
    cgpa: Number(cgpa.toFixed(2)),
    totalCredits,
    weightedSum,
    subjectCount: current.subjectCount,
    currentGPA: current.gpa,
    currentCredits: current.totalCredits,
  };
}

export function calculateGroupGPA(subjects = [], groupKey = "yearSemester") {
  const groups = {};

  for (const subject of getValidSubjects(subjects)) {
    const groupName = subject[groupKey] || "Uncategorized";

    if (!groups[groupName]) {
      groups[groupName] = [];
    }

    groups[groupName].push(subject);
  }

  return Object.entries(groups).map(([name, groupSubjects]) => ({
    name,
    ...calculateGPA(groupSubjects),
  }));
}

export function calculatePredictedCGPA({
  currentCGPA,
  completedCredits,
  futureGPA,
  futureCredits,
}) {
  const cgpa = Number(currentCGPA);
  const completed = Number(completedCredits);
  const gpa = Number(futureGPA);
  const credits = Number(futureCredits);

  const isValid =
    [cgpa, completed, gpa, credits].every(Number.isFinite) &&
    cgpa >= 0 &&
    cgpa <= MAX_GPA &&
    completed >= 0 &&
    gpa >= 0 &&
    gpa <= MAX_GPA &&
    credits > 0;

  if (!isValid) {
    return null;
  }

  const totalCredits = completed + credits;

  const predictedCGPA = (cgpa * completed + gpa * credits) / totalCredits;

  return Number(predictedCGPA.toFixed(2));
}

export function calculateRequiredGPA({
  currentCGPA,
  completedCredits,
  targetCGPA,
  remainingCredits,
}) {
  const current = Number(currentCGPA);
  const completed = Number(completedCredits);
  const target = Number(targetCGPA);
  const remaining = Number(remainingCredits);

  const isValid =
    [current, completed, target, remaining].every(Number.isFinite) &&
    current >= 0 &&
    current <= MAX_GPA &&
    completed >= 0 &&
    target >= 0 &&
    target <= MAX_GPA &&
    remaining > 0;

  if (!isValid) {
    return null;
  }

  const requiredGPA =
    (target * (completed + remaining) - current * completed) / remaining;

  return {
    requiredGPA: Number(requiredGPA.toFixed(2)),
    achievable: requiredGPA <= MAX_GPA,
    alreadyAchievable: requiredGPA <= 0,
  };
}

export function calculateImprovementCGPA({
  subjects = [],
  selectedIds = [],
  improvementGrade = "B",
  previousCGPA = "",
  previousCredits = "",
}) {
  if (!Object.hasOwn(GRADE_POINTS, improvementGrade)) {
    return null;
  }

  const selected = new Set(selectedIds);
  const improvementPoint = GRADE_POINTS[improvementGrade];

  const improvedSubjects = subjects.map((subject) => {
    if (!selected.has(subject.id) || !isValidSubject(subject)) {
      return subject;
    }

    const currentPoint = GRADE_POINTS[subject.grade];

    if (currentPoint >= improvementPoint) {
      return subject;
    }

    return {
      ...subject,
      grade: improvementGrade,
    };
  });

  return calculateCGPA(improvedSubjects, previousCGPA, previousCredits);
}
