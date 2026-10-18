import { GRADE_POINTS, YEAR_SEMESTER_OPTIONS } from "../data/gradeData.js";

const STORAGE_KEY = "gradepilot_state";
const STORAGE_VERSION = 1;

const DEFAULT_SEMESTER = YEAR_SEMESTER_OPTIONS[0];

const PERSISTED_FIELDS = [
  "subjects",
  "previousCGPA",
  "previousCredits",
  "targetCGPA",
  "remainingCredits",
  "theme",
  "sidebarCollapsed",
];

function isValidNumber(value, min, max = Infinity) {
  if (value === "" || value === null || value === undefined) {
    return false;
  }

  const number = Number(value);

  return Number.isFinite(number) && number >= min && number <= max;
}

function normalizeNumber(value, min, max = Infinity) {
  return isValidNumber(value, min, max) ? String(value) : "";
}

function normalizeSubject(subject) {
  if (!subject || typeof subject !== "object" || Array.isArray(subject)) {
    return null;
  }

  const credit = Number(subject.credit);

  return {
    id:
      typeof subject.id === "string" && subject.id.trim()
        ? subject.id
        : crypto.randomUUID(),

    name: typeof subject.name === "string" ? subject.name.slice(0, 150) : "",

    credit: Number.isFinite(credit) && credit >= 0 && credit <= 30 ? credit : 3,

    grade: Object.hasOwn(GRADE_POINTS, subject.grade) ? subject.grade : "B+",

    yearSemester: YEAR_SEMESTER_OPTIONS.includes(subject.yearSemester)
      ? subject.yearSemester
      : DEFAULT_SEMESTER,
  };
}

export function normalizeSubjects(subjects) {
  if (!Array.isArray(subjects)) {
    return [];
  }

  const seenIds = new Set();

  return subjects.reduce((result, subject) => {
    const normalized = normalizeSubject(subject);

    if (!normalized) {
      return result;
    }

    if (seenIds.has(normalized.id)) {
      normalized.id = crypto.randomUUID();
    }

    seenIds.add(normalized.id);
    result.push(normalized);

    return result;
  }, []);
}

export function validateAcademicState(data, defaults) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return defaults;
  }

  return {
    ...defaults,

    subjects: Array.isArray(data.subjects)
      ? normalizeSubjects(data.subjects)
      : defaults.subjects,

    previousCGPA: normalizeNumber(data.previousCGPA, 0, 4),

    previousCredits: normalizeNumber(data.previousCredits, 0),

    targetCGPA: normalizeNumber(data.targetCGPA, 0, 4),

    remainingCredits: normalizeNumber(data.remainingCredits, 0),

    theme: ["light", "dark"].includes(data.theme) ? data.theme : defaults.theme,

    sidebarCollapsed:
      typeof data.sidebarCollapsed === "boolean"
        ? data.sidebarCollapsed
        : defaults.sidebarCollapsed,

    aiInsights: null,
    aiLoading: false,
  };
}

export function loadAcademicState(defaults) {
  if (typeof window === "undefined") {
    return defaults;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return defaults;
    }

    const parsed = JSON.parse(saved);

    if (!parsed || typeof parsed !== "object") {
      return defaults;
    }

    return validateAcademicState(parsed, defaults);
  } catch (error) {
    console.warn("Unable to load saved academic data:", error);
    return defaults;
  }
}

export function saveAcademicState(state) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const data = {};

    for (const field of PERSISTED_FIELDS) {
      data[field] = state[field];
    }

    data.storageVersion = STORAGE_VERSION;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    return true;
  } catch (error) {
    console.warn("Unable to save academic data:", error);
    return false;
  }
}

export function clearAcademicState() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
